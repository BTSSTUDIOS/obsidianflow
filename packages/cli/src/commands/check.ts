import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import {
  parseComposition,
  formatTimecode,
  formatSeconds,
  type AudioGroup,
  type CompositionVariable,
} from '@obsidianflow/core';

export interface CheckCliOptions {
  json?: boolean;
}

export async function checkCommand(filePath: string, options: CheckCliOptions = {}): Promise<void> {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    if (options.json) {
      console.log(JSON.stringify({ valid: false, error: `File not found: ${resolvedPath}` }));
    } else {
      console.error(pc.red(`Error: File not found at ${resolvedPath}`));
    }
    process.exit(1);
  }

  const html = fs.readFileSync(resolvedPath, 'utf-8');
  let composition;

  try {
    composition = parseComposition(html);
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ valid: false, error: err.message }));
    } else {
      console.error(pc.red(`Error parsing composition: ${err.message}`));
    }
    process.exit(1);
  }

  const totalFrames = Math.round(composition.duration * composition.fps);
  const audioTracksCount = composition.audioGroups.reduce(
    (acc: number, g: AudioGroup) => acc + g.tracks.length,
    0
  );

  const report = {
    valid: true,
    id: composition.id,
    resolution: `${composition.width}x${composition.height}`,
    width: composition.width,
    height: composition.height,
    fps: composition.fps,
    durationSeconds: composition.duration,
    durationFormatted: formatSeconds(composition.duration),
    timecode: formatTimecode(composition.duration, composition.fps),
    totalFrames,
    clipsCount: composition.clips.length,
    audioTracksCount,
    transitionsCount: composition.transitions.length,
    variablesCount: composition.variables.length,
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(pc.bold(pc.cyan(`\n🌋 Composition Structure Check: ${pc.white(composition.id)}`)));
  console.log(pc.dim(`   Source: ${resolvedPath}\n`));

  console.log(`  ${pc.bold('Resolution:')}   ${pc.yellow(`${composition.width} × ${composition.height}`)}`);
  console.log(`  ${pc.bold('FPS:')}          ${pc.yellow(String(composition.fps))}`);
  console.log(`  ${pc.bold('Duration:')}     ${pc.green(`${formatSeconds(composition.duration)}`)} (${pc.dim(report.timecode)})`);
  console.log(`  ${pc.bold('Total Frames:')} ${pc.magenta(String(totalFrames))}`);
  console.log(`  ${pc.bold('Clips:')}        ${composition.clips.length}`);
  console.log(`  ${pc.bold('Audio Tracks:')} ${audioTracksCount}`);
  console.log(`  ${pc.bold('Transitions:')}  ${composition.transitions.length}`);
  if (composition.variables.length > 0) {
    console.log(
      `  ${pc.bold('Variables:')}    ${composition.variables
        .map((v: CompositionVariable) => v.name)
        .join(', ')}`
    );
  }

  console.log(pc.green(`\n✔ Composition is structurally valid.\n`));
}
