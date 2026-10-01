import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import type { AudioGroup, AudioTrack } from '@obsidianflow/core';

export interface AudioMixOptions {
  audioGroups: AudioGroup[];
  videoPath: string;
  outputPath: string;
  basePath?: string;
  duration?: number;
}

/**
 * Mixes multi-track audio with delays, volume adjustments, and ducking,
 * and muxes the resulting audio stream with the rendered video track.
 */
export async function mixAudio(options: AudioMixOptions): Promise<string> {
  const { audioGroups, videoPath, outputPath, basePath = process.cwd(), duration } = options;

  // Flatten all audio tracks from all groups
  const allTracks: AudioTrack[] = [];
  for (const group of audioGroups) {
    for (const track of group.tracks) {
      if (track.src) {
        allTracks.push(track);
      }
    }
  }

  // Filter to tracks with accessible source files
  const validTracks = allTracks.filter((track) => {
    if (track.src.startsWith('http://') || track.src.startsWith('https://')) {
      return true;
    }
    const resolved = path.isAbsolute(track.src) ? track.src : path.resolve(basePath, track.src);
    return fs.existsSync(resolved);
  });

  // If no audio tracks exist, copy/rename videoPath to outputPath
  if (validTracks.length === 0) {
    if (path.resolve(videoPath) !== path.resolve(outputPath)) {
      fs.copyFileSync(videoPath, outputPath);
    }
    return outputPath;
  }

  // Build FFmpeg command
  const ffmpegArgs: string[] = ['-y', '-i', path.resolve(videoPath)];

  for (const track of validTracks) {
    const trackPath = track.src.startsWith('http')
      ? track.src
      : path.isAbsolute(track.src)
      ? track.src
      : path.resolve(basePath, track.src);
    ffmpegArgs.push('-i', trackPath);
  }

  // Build complex filtergraph for audio
  const filterChains: string[] = [];
  const mixedLabels: string[] = [];

  // Separate dialogue vs other tracks for ducking
  const dialogueIndices: number[] = [];
  validTracks.forEach((track, idx) => {
    if (track.track === 'dialogue') {
      dialogueIndices.push(idx + 1); // 1-indexed because 0 is video
    }
  });

  validTracks.forEach((track, idx) => {
    const inputIdx = idx + 1; // 0 is video
    const delayMs = Math.max(0, Math.round(track.startTime * 1000));
    const label = `a${inputIdx}`;
    const processedLabel = `proc_${inputIdx}`;

    let filter = `[${inputIdx}:a]adelay=${delayMs}|${delayMs},volume=${track.volume.toFixed(2)}`;

    if (track.fadeIn && track.fadeIn > 0) {
      filter += `,afade=t=in:ss=0:d=${track.fadeIn.toFixed(2)}`;
    }
    if (track.fadeOut && track.fadeOut > 0) {
      const fadeStart = Math.max(0, track.duration - track.fadeOut);
      filter += `,afade=t=out:ss=${fadeStart.toFixed(2)}:d=${track.fadeOut.toFixed(2)}`;
    }

    filter += `[${label}]`;
    filterChains.push(filter);

    // Apply sidechain ducking if this track ducks another track and a dialogue track exists
    if (track.ducking === 'dialogue' && dialogueIndices.length > 0) {
      const diagIdx = dialogueIndices[0];
      const duckedLabel = `ducked_${inputIdx}`;
      filterChains.push(
        `[${label}][a${diagIdx}]sidechaincompress=threshold=0.12:ratio=4:attack=50:release=350[${duckedLabel}]`
      );
      mixedLabels.push(`[${duckedLabel}]`);
    } else {
      mixedLabels.push(`[${label}]`);
    }
  });

  // Mix all audio streams together
  if (mixedLabels.length === 1) {
    filterChains.push(`${mixedLabels[0]}aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[outa]`);
  } else {
    filterChains.push(
      `${mixedLabels.join('')}amix=inputs=${mixedLabels.length}:duration=first:dropout_transition=2,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[outa]`
    );
  }

  ffmpegArgs.push('-filter_complex', filterChains.join(';'));
  ffmpegArgs.push('-map', '0:v');
  ffmpegArgs.push('-map', '[outa]');
  ffmpegArgs.push('-c:v', 'copy');
  ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k');

  if (duration && duration > 0) {
    ffmpegArgs.push('-t', String(duration));
  }

  ffmpegArgs.push(path.resolve(outputPath));

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        // Clean up intermediate silent video if it's different from final output
        if (path.resolve(videoPath) !== path.resolve(outputPath) && fs.existsSync(videoPath)) {
          try {
            fs.unlinkSync(videoPath);
          } catch {
            // ignore
          }
        }
        resolve(outputPath);
      } else {
        reject(
          new Error(`FFmpeg audio mix failed with code ${code}.\nFFmpeg stderr:\n${stderr.slice(-1000)}`)
        );
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn FFmpeg for audio mixing: ${err.message}`));
    });
  });
}
