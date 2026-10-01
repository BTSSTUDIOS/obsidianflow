import path from 'path';
import type { CaptureOptions } from '@obsidianflow/core';
import { launchBrowser } from './browser.js';

/**
 * Deterministically steps through an HTML composition frame-by-frame,
 * seeking all timelines and capturing PNG buffers.
 */
export async function captureFrames(options: CaptureOptions): Promise<void> {
  const {
    compositionPath,
    width,
    height,
    fps,
    duration,
    onFrame,
    onProgress,
    browserExecutablePath,
  } = options;

  const totalFrames = Math.max(1, Math.round(duration * fps));

  const browser = await launchBrowser({
    width,
    height,
    executablePath: browserExecutablePath,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1,
    });

    // Resolve URL (file path or HTTP)
    const url = compositionPath.startsWith('http://') || compositionPath.startsWith('https://')
      ? compositionPath
      : `file://${path.resolve(compositionPath)}`;

    await page.goto(url, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 60000,
    });

    // Wait for the runtime and timelines to be ready
    await page.waitForFunction(
      () => {
        return (
          Boolean(window.__obsidianflow) ||
          Boolean(window.__timelines) ||
          document.readyState === 'complete'
        );
      },
      { timeout: 15000 }
    ).catch(() => {
      // Continue even if explicit global isn't defined
    });

    // Initial seek to frame 0
    await page.evaluate(async () => {
      if (window.__obsidianflow && typeof window.__obsidianflow.seek === 'function') {
        await window.__obsidianflow.seek(0);
      } else if (window.__timelines) {
        for (const tl of Object.values(window.__timelines)) {
          if (tl && typeof tl.seek === 'function') tl.seek(0);
        }
      }
    });

    // Deterministic frame capture loop
    for (let frame = 0; frame < totalFrames; frame++) {
      const timeInSeconds = frame / fps;

      // 1. Advance all registered timelines & media to exact time
      await page.evaluate(async (t: number) => {
        if (window.__obsidianflow && typeof window.__obsidianflow.seek === 'function') {
          await window.__obsidianflow.seek(t);
        } else if (window.__timelines) {
          for (const tl of Object.values(window.__timelines)) {
            if (tl && typeof tl.seek === 'function') {
              tl.seek(t);
            }
          }
        }

        // Force synchronous layout recalculation
        if (document.body) {
          void document.body.offsetHeight;
        }
      }, timeInSeconds);

      // 2. Capture screenshot buffer
      const screenshot = (await page.screenshot({
        type: 'png',
        omitBackground: false,
        clip: {
          x: 0,
          y: 0,
          width,
          height,
        },
      })) as Buffer;

      // 3. Emit frame to consumer
      await onFrame(screenshot, frame, totalFrames);

      // 4. Report progress
      if (onProgress) {
        const percent = ((frame + 1) / totalFrames) * 100;
        onProgress(percent, frame + 1, totalFrames);
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }
}
