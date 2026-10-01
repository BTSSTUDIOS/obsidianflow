import fs from 'fs';
import path from 'path';
import {
  parseComposition,
  lintComposition,
  type RenderOptions,
  type RenderResult,
} from '@obsidianflow/core';
import { captureFrames } from '@obsidianflow/engine';
import { FFmpegEncoder } from './encoder.js';
import { mixAudio } from './audio-mixer.js';

/**
 * Executes the complete video rendering pipeline:
 * 1. Parse HTML to AST
 * 2. Static lint checks
 * 3. Headless Chrome frame-by-frame capture
 * 4. Piped FFmpeg video encoding
 * 5. Audio filtergraph mixing & final muxing
 */
export async function render(options: RenderOptions): Promise<RenderResult> {
  const startTime = Date.now();
  const inputPath = path.resolve(options.input);
  const outputPath = path.resolve(options.output);
  const basePath = path.dirname(inputPath);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Composition file not found at: ${inputPath}`);
  }

  // 1. Parse composition manifest
  const rawHtml = fs.readFileSync(inputPath, 'utf-8');
  const composition = parseComposition(rawHtml);

  // Apply overrides from CLI options
  if (options.fps && options.fps > 0) {
    composition.fps = options.fps;
  }

  // 2. Run static lint checks
  const lintResults = lintComposition(composition, { basePath });
  const errors = lintResults.filter((r) => r.severity === 'error');
  if (errors.length > 0) {
    const errorDetails = errors.map((e) => `[${e.ruleId}] ${e.message}`).join('\n  ');
    throw new Error(`Composition failed static validation with ${errors.length} error(s):\n  ${errorDetails}`);
  }

  options.onProgress?.({
    phase: 'capturing',
    percent: 0,
    message: 'Starting headless Chrome browser...',
  });

  // Determine whether audio mixing is required
  const hasAudioTracks = composition.audioGroups.some((g) => g.tracks.length > 0);
  const videoOnlyPath = hasAudioTracks
    ? path.join(path.dirname(outputPath), `.temp_${Date.now()}_video.mp4`)
    : outputPath;

  // 3. Initialize FFmpeg video encoder
  const encoder = new FFmpegEncoder({
    output: videoOnlyPath,
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
    codec: options.codec || 'h264',
    bitrate: options.bitrate,
    quality: options.quality || 'production',
  });

  encoder.start();

  // 4. Capture frames and stream into FFmpeg
  await captureFrames({
    compositionPath: inputPath,
    width: composition.width,
    height: composition.height,
    fps: composition.fps,
    duration: composition.duration,
    browserExecutablePath: options.browserExecutablePath,
    onFrame: async (frameBuffer) => {
      await encoder.writeFrame(frameBuffer);
    },
    onProgress: (percent, current, total) => {
      const scaledPercent = hasAudioTracks ? percent * 0.85 : percent * 0.95;
      options.onProgress?.({
        phase: 'capturing',
        percent: Math.round(scaledPercent),
        currentFrame: current,
        totalFrames: total,
        message: `Rendering frame ${current} / ${total}`,
      });
    },
  });

  // Finish video encoding
  options.onProgress?.({
    phase: 'encoding',
    percent: hasAudioTracks ? 85 : 98,
    message: 'Finalizing video stream...',
  });
  await encoder.finish();

  // 5. Audio mixing & muxing (if audio tracks exist)
  if (hasAudioTracks) {
    options.onProgress?.({
      phase: 'mixing',
      percent: 90,
      message: 'Mixing and ducking audio tracks...',
    });

    await mixAudio({
      audioGroups: composition.audioGroups,
      videoPath: videoOnlyPath,
      outputPath: outputPath,
      basePath: basePath,
      duration: composition.duration,
    });
  }

  // 6. Complete and compile results
  const stat = fs.statSync(outputPath);
  const totalFrames = encoder.getFrameCount();
  const renderTimeMs = Date.now() - startTime;

  options.onProgress?.({
    phase: 'complete',
    percent: 100,
    currentFrame: totalFrames,
    totalFrames: totalFrames,
    elapsedMs: renderTimeMs,
    message: 'Render completed successfully',
  });

  const result: RenderResult = {
    output: outputPath,
    duration: composition.duration,
    frames: totalFrames,
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
    renderTime: renderTimeMs,
    size: stat.size,
    codec: options.codec || 'h264',
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  }

  return result;
}
