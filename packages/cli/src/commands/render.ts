import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';
import type { RenderProgress } from '@obsidianflow/core';
import { render, type RenderResult } from '@obsidianflow/producer';

export interface RenderCliOptions {
  output: string;
  fps?: number;
  bitrate?: string;
  codec?: 'h264' | 'prores' | 'vp9' | 'av1';
  quality?: 'draft' | 'production' | 'cinema';
  browser?: string;
  json?: boolean;
}

export async function renderCommand(filePath: string, options: RenderCliOptions): Promise<void> {
  const resolvedInput = path.resolve(process.cwd(), filePath);
  const resolvedOutput = path.resolve(process.cwd(), options.output || 'output.mp4');

  if (!fs.existsSync(resolvedInput)) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: `Input file not found: ${resolvedInput}` }));
    } else {
      console.error(pc.red(`Error: Composition file not found at: ${resolvedInput}`));
    }
    process.exit(1);
  }

  let spinner: any = null;
  if (!options.json) {
    console.log(pc.bold(pc.cyan(`\n🌋 ObsidianFlow Render Engine`)));
    console.log(pc.dim(`   Input:  ${resolvedInput}`));
    console.log(pc.dim(`   Output: ${resolvedOutput}\n`));
    spinner = ora({ text: 'Initializing render pipeline...', color: 'yellow' }).start();
  }

  try {
    const result: RenderResult = await render({
      input: resolvedInput,
      output: resolvedOutput,
      fps: options.fps ? Number(options.fps) : undefined,
      bitrate: options.bitrate,
      codec: options.codec,
      quality: options.quality,
      browserExecutablePath: options.browser,
      json: options.json,
      onProgress: (progress: RenderProgress) => {
        if (spinner) {
          const frameInfo =
            progress.currentFrame && progress.totalFrames
              ? ` [${progress.currentFrame}/${progress.totalFrames}]`
              : '';
          spinner.text = `${progress.message || progress.phase}${frameInfo} (${progress.percent}%)`;
        }
      },
    });

    if (spinner) {
      spinner.succeed(pc.green('Render completed successfully!'));
      console.log();
      console.log(`  ${pc.bold('File:')}        ${pc.green(result.output)}`);
      console.log(`  ${pc.bold('Duration:')}    ${result.duration.toFixed(2)}s (${result.frames} frames @ ${result.fps}fps)`);
      console.log(`  ${pc.bold('Dimensions:')}  ${result.width} × ${result.height}`);
      console.log(`  ${pc.bold('Render Time:')} ${(result.renderTime / 1000).toFixed(2)}s`);
      console.log(`  ${pc.bold('Size:')}        ${(result.size / (1024 * 1024)).toFixed(2)} MB`);
      console.log();
    }
  } catch (err: any) {
    if (spinner) {
      spinner.fail(pc.red('Render failed'));
    }
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(pc.red(`\nRender Error:\n${err.message}\n`));
    }
    process.exit(1);
  }
}
