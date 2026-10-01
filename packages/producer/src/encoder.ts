import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface VideoEncoderOptions {
  output: string;
  fps: number;
  width: number;
  height: number;
  codec?: 'h264' | 'prores' | 'vp9' | 'av1';
  bitrate?: string;
  quality?: 'draft' | 'production' | 'cinema';
}

/**
 * FFmpeg pipe encoder that accepts raw PNG frames over stdin and encodes them to MP4/WebM/ProRes.
 */
export class FFmpegEncoder {
  private options: VideoEncoderOptions;
  private ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
  private exitPromise: Promise<void> | null = null;
  private framesWritten = 0;

  constructor(options: VideoEncoderOptions) {
    this.options = {
      codec: 'h264',
      quality: 'production',
      ...options,
    };

    // Ensure output directory exists
    const outDir = path.dirname(path.resolve(this.options.output));
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  }

  /**
   * Initializes the FFmpeg process with image2pipe.
   */
  start(): void {
    const { fps, width, height, codec, bitrate, quality, output } = this.options;

    const ffmpegArgs: string[] = [
      '-y', // overwrite output
      '-f', 'image2pipe',
      '-vcodec', 'png',
      '-r', String(fps),
      '-s', `${width}x${height}`,
      '-i', '-', // read from stdin
    ];

    // Codec-specific flags
    if (codec === 'prores') {
      ffmpegArgs.push('-c:v', 'prores_ks', '-profile:v', '3', '-pix_fmt', 'yuv422p10le');
    } else if (codec === 'vp9') {
      ffmpegArgs.push('-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p');
      if (bitrate) ffmpegArgs.push('-b:v', bitrate);
    } else if (codec === 'av1') {
      ffmpegArgs.push('-c:v', 'libsvtav1', '-pix_fmt', 'yuv420p10le');
    } else {
      // Default: libx264
      ffmpegArgs.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p');
      if (quality === 'draft') {
        ffmpegArgs.push('-preset', 'ultrafast', '-crf', '26');
      } else if (quality === 'cinema') {
        ffmpegArgs.push('-preset', 'slow', '-crf', '15');
      } else {
        ffmpegArgs.push('-preset', 'medium', '-crf', '18');
      }
      if (bitrate) {
        ffmpegArgs.push('-b:v', bitrate);
      }
      ffmpegArgs.push('-movflags', '+faststart');
    }

    ffmpegArgs.push(path.resolve(output));

    this.ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stderrOutput = '';
    this.ffmpegProcess.stderr.on('data', (chunk) => {
      stderrOutput += chunk.toString();
    });

    this.exitPromise = new Promise((resolve, reject) => {
      this.ffmpegProcess!.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(`FFmpeg exited with error code ${code}.\nFFmpeg stderr:\n${stderrOutput.slice(-1000)}`)
          );
        }
      });

      this.ffmpegProcess!.on('error', (err) => {
        reject(new Error(`Failed to spawn FFmpeg process: ${err.message}`));
      });
    });
  }

  /**
   * Writes a single PNG frame buffer into FFmpeg's stdin, respecting backpressure.
   */
  async writeFrame(frameData: Buffer): Promise<void> {
    if (!this.ffmpegProcess) {
      this.start();
    }

    const stdin = this.ffmpegProcess!.stdin;
    this.framesWritten++;

    const canWriteMore = stdin.write(frameData);
    if (!canWriteMore) {
      await new Promise<void>((resolve) => stdin.once('drain', resolve));
    }
  }

  /**
   * Closes stdin and waits for FFmpeg to finish encoding.
   */
  async finish(): Promise<void> {
    if (!this.ffmpegProcess || !this.exitPromise) {
      throw new Error('Encoder was not started or no frames were written');
    }

    this.ffmpegProcess.stdin.end();
    await this.exitPromise;
  }

  getFrameCount(): number {
    return this.framesWritten;
  }
}
