/**
 * Utilities for parsing and formatting time representations.
 */
import type { RationalRate } from './types.js';

/**
 * Parses time formats into decimal seconds:
 * - '5s', '2.5s'
 * - '500ms'
 * - '1m30s', '2h15m30s'
 * - '00:01:30', '01:30', '00:01:30.500'
 * - '60f' (frame count converted using specified fps)
 * - Raw numeric seconds
 */
export function parseTime(value: string | number | undefined | null, fps = 30): number {
  if (value === undefined || value === null) {
    return 0;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? 0 : Math.max(0, value);
  }

  const str = String(value).trim().toLowerCase();
  if (!str) return 0;

  // Frame format e.g. "60f" or "120frames"
  if (/^(\d+(?:\.\d+)?)f(?:rames)?$/.test(str)) {
    const match = str.match(/^(\d+(?:\.\d+)?)f(?:rames)?$/);
    if (match) {
      const frames = parseFloat(match[1]);
      return fps > 0 ? frames / fps : 0;
    }
  }

  // Milliseconds format e.g. "500ms"
  if (str.endsWith('ms')) {
    const ms = parseFloat(str.slice(0, -2));
    return isNaN(ms) ? 0 : ms / 1000;
  }

  // Seconds format e.g. "10s"
  if (str.endsWith('s') && !str.includes('m') && !str.includes('h')) {
    const s = parseFloat(str.slice(0, -1));
    return isNaN(s) ? 0 : s;
  }

  // Duration with hours/minutes/seconds e.g. "1h30m10s" or "2m15s"
  if (/[hms]/.test(str)) {
    let total = 0;
    const hMatch = str.match(/(\d+(?:\.\d+)?)h/);
    const mMatch = str.match(/(\d+(?:\.\d+)?)m/);
    const sMatch = str.match(/(\d+(?:\.\d+)?)s/);

    if (hMatch) total += parseFloat(hMatch[1]) * 3600;
    if (mMatch) total += parseFloat(mMatch[1]) * 60;
    if (sMatch) total += parseFloat(sMatch[1]);
    return total;
  }

  // Timecode format HH:MM:SS or MM:SS or HH:MM:SS.mmm
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => parseFloat(p));
    if (parts.some((p) => isNaN(p))) return 0;

    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
  }

  // Raw float / int
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Standard NLE tick timebase (254,016,000,000 ticks per second).
 * Divides evenly by 24, 25, 30, 48, 50, 60, 120, 23.976 (24000/1001), 29.97 (30000/1001),
 * 59.94 (60000/1001), and audio sample rates 44.1kHz, 48kHz, 96kHz, 192kHz with zero remainder.
 */
export const TICKS_PER_SECOND = 254_016_000_000n;

/**
 * Standard broadcast and film rational framerates
 */
export const STANDARD_FPS: Record<string, RationalRate> = {
  '24': { numerator: 24, denominator: 1 },
  '25': { numerator: 25, denominator: 1 },
  '30': { numerator: 30, denominator: 1 },
  '48': { numerator: 48, denominator: 1 },
  '50': { numerator: 50, denominator: 1 },
  '60': { numerator: 60, denominator: 1 },
  '120': { numerator: 120, denominator: 1 },
  '23.976': { numerator: 24000, denominator: 1001 },
  '23.98': { numerator: 24000, denominator: 1001 },
  '29.97': { numerator: 30000, denominator: 1001 },
  '59.94': { numerator: 60000, denominator: 1001 },
};

export function resolveFps(fps: number | RationalRate | string = 30): RationalRate {
  if (typeof fps === 'object' && 'numerator' in fps && 'denominator' in fps) {
    return fps;
  }
  const str = String(fps).trim();
  if (STANDARD_FPS[str]) {
    return STANDARD_FPS[str];
  }
  const num = parseFloat(str);
  if (Math.abs(num - 23.976) < 0.01) return STANDARD_FPS['23.976'];
  if (Math.abs(num - 29.97) < 0.01) return STANDARD_FPS['29.97'];
  if (Math.abs(num - 59.94) < 0.01) return STANDARD_FPS['59.94'];

  return { numerator: Math.round(num), denominator: 1 };
}

/**
 * Converts a timeline second value to exact integer ticks.
 */
export function secondsToTicks(seconds: number): bigint {
  if (isNaN(seconds) || seconds <= 0) return 0n;
  const micros = BigInt(Math.round(seconds * 1_000_000));
  return (micros * TICKS_PER_SECOND) / 1_000_000n;
}

/**
 * Converts integer ticks to decimal seconds.
 */
export function ticksToSeconds(ticks: bigint): number {
  if (ticks <= 0n) return 0;
  return Number(ticks) / Number(TICKS_PER_SECOND);
}

/**
 * Computes exact integer ticks for a given frame index.
 */
export function frameToTicks(frame: number, fps: number | RationalRate | string = 30): bigint {
  if (frame <= 0) return 0n;
  const r = resolveFps(fps);
  const ticksPerFrame = (TICKS_PER_SECOND * BigInt(r.denominator)) / BigInt(r.numerator);
  return BigInt(frame) * ticksPerFrame;
}

/**
 * Computes exact integer frame index from ticks.
 */
export function ticksToFrame(ticks: bigint, fps: number | RationalRate | string = 30): number {
  if (ticks <= 0n) return 0;
  const r = resolveFps(fps);
  const ticksPerFrame = (TICKS_PER_SECOND * BigInt(r.denominator)) / BigInt(r.numerator);
  return Number(ticks / ticksPerFrame);
}

/**
 * Format decimal seconds as SMPTE-style timecode (HH:MM:SS:FF or HH:MM:SS;FF for drop frame)
 */
export function formatTimecode(seconds: number, fps: number | RationalRate | string = 30, dropFrame = false): string {
  const ticks = secondsToTicks(seconds);
  const r = resolveFps(fps);
  const totalFrames = ticksToFrame(ticks, r);
  const fpsInt = Math.round(r.numerator / r.denominator);

  const hours = Math.floor(totalFrames / (fpsInt * 3600));
  const minutes = Math.floor((totalFrames % (fpsInt * 3600)) / (fpsInt * 60));
  const secs = Math.floor((totalFrames % (fpsInt * 60)) / fpsInt);
  const frames = totalFrames % fpsInt;

  const pad = (n: number) => String(n).padStart(2, '0');
  const separator = dropFrame ? ';' : ':';
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}${separator}${pad(frames)}`;
}

/**
 * Format seconds with two decimal points
 */
export function formatSeconds(seconds: number): string {
  return `${seconds.toFixed(2)}s`;
}
