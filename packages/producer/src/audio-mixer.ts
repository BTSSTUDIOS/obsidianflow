import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import type { AudioGroup, AudioTrack } from '@obsidianflow/core';

export interface LoudnessOptions {
  integrated?: number; // Target LUFS, e.g. -14 for web, -23 for broadcast
  lra?: number;        // Loudness Range, default 11
  truePeak?: number;   // Max True Peak dBTP, e.g. -1.5
}

export interface AudioMixOptions {
  audioGroups: AudioGroup[];
  videoPath: string;
  outputPath: string;
  basePath?: string;
  duration?: number;
  loudnessNorm?: boolean | LoudnessOptions;
}

/**
 * Builds a piece-wise linear volume expression for FFmpeg volume filter.
 */
function buildVolumeCurveExpression(keyframes: NonNullable<AudioTrack['volumeKeyframes']>, defaultVol: number): string {
  if (keyframes.length === 0) return defaultVol.toFixed(2);
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  let expr = defaultVol.toFixed(2);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const curr = sorted[i];
    if (i === 0) {
      expr = `if(lt(t,${curr.time.toFixed(3)}),${curr.volume.toFixed(2)},${expr})`;
    } else {
      const prev = sorted[i - 1];
      const dur = curr.time - prev.time;
      if (dur > 0) {
        const ramp = `(${prev.volume.toFixed(2)}+(${curr.volume.toFixed(2)}-${prev.volume.toFixed(2)})*(t-${prev.time.toFixed(3)})/${dur.toFixed(3)})`;
        expr = `if(between(t,${prev.time.toFixed(3)},${curr.time.toFixed(3)}),${ramp},${expr})`;
      }
    }
  }
  const last = sorted[sorted.length - 1];
  expr = `if(gte(t,${last.time.toFixed(3)}),${last.volume.toFixed(2)},${expr})`;
  return expr;
}

/**
 * Mixes multi-track audio with delays, volume adjustments, and ducking,
 * and muxes the resulting audio stream with the rendered video track.
 */
export async function mixAudio(options: AudioMixOptions): Promise<string> {
  const { audioGroups, videoPath, outputPath, basePath = process.cwd(), duration, loudnessNorm = true } = options;

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
    if (track.track === 'dialogue' || track.track === 'vo' || track.track === 'voiceover') {
      dialogueIndices.push(idx + 1); // 1-indexed because 0 is video
    }
  });

  validTracks.forEach((track, idx) => {
    const inputIdx = idx + 1; // 0 is video
    const delayMs = Math.max(0, Math.round(track.startTime * 1000));
    const label = `a${inputIdx}`;

    let volumeClause: string;
    if (track.volumeKeyframes && track.volumeKeyframes.length > 0) {
      const expr = buildVolumeCurveExpression(track.volumeKeyframes, track.volume);
      volumeClause = `volume='${expr}':eval=frame`;
    } else {
      volumeClause = `volume=${track.volume.toFixed(2)}`;
    }

    let filter = `[${inputIdx}:a]adelay=${delayMs}|${delayMs},${volumeClause}`;

    if (track.fadeIn && track.fadeIn > 0) {
      filter += `,afade=t=in:ss=0:d=${track.fadeIn.toFixed(2)}`;
    }
    if (track.fadeOut && track.fadeOut > 0) {
      const fadeStart = Math.max(0, track.duration - track.fadeOut);
      filter += `,afade=t=out:ss=${fadeStart.toFixed(2)}:d=${track.fadeOut.toFixed(2)}`;
    }

    filter += `[${label}]`;
    filterChains.push(filter);

    // Apply sidechain ducking if this track ducks dialogue and a dialogue track exists
    const shouldDuck = track.ducking && (track.ducking === 'dialogue' || track.ducking === 'true' || track.ducking === 'vo');
    if (shouldDuck && dialogueIndices.length > 0) {
      const diagIdx = dialogueIndices[0];
      const duckedLabel = `ducked_${inputIdx}`;
      // Calculate compression ratio based on duckingAmount (e.g. 0.25 -> ratio ~ 6, 0.5 -> ratio ~ 3)
      const ratio = track.duckingAmount !== undefined && track.duckingAmount > 0
        ? Math.max(2, Math.min(20, Math.round(1 / track.duckingAmount)))
        : 4;
      filterChains.push(
        `[${label}][a${diagIdx}]sidechaincompress=threshold=0.12:ratio=${ratio}:attack=50:release=350[${duckedLabel}]`
      );
      mixedLabels.push(`[${duckedLabel}]`);
    } else {
      mixedLabels.push(`[${label}]`);
    }
  });

  // Mix all audio streams together
  const rawAudioLabel = mixedLabels.length === 1 ? mixedLabels[0] : '[amixed]';
  if (mixedLabels.length > 1) {
    filterChains.push(
      `${mixedLabels.join('')}amix=inputs=${mixedLabels.length}:duration=first:dropout_transition=2[amixed]`
    );
  }

  // Apply EBU R128 loudness normalization
  if (loudnessNorm) {
    const targetLUFS = typeof loudnessNorm === 'object' && loudnessNorm.integrated ? loudnessNorm.integrated : -14;
    const lra = typeof loudnessNorm === 'object' && loudnessNorm.lra ? loudnessNorm.lra : 11;
    const truePeak = typeof loudnessNorm === 'object' && loudnessNorm.truePeak ? loudnessNorm.truePeak : -1.5;

    filterChains.push(
      `${rawAudioLabel}loudnorm=I=${targetLUFS}:LRA=${lra}:TP=${truePeak},aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[outa]`
    );
  } else {
    filterChains.push(
      `${rawAudioLabel}aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[outa]`
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
