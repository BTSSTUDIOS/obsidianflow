/**
 * Utilities for parsing and formatting time representations.
 */

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
 * Format decimal seconds as SMPTE-style timecode (HH:MM:SS:FF)
 */
export function formatTimecode(seconds: number, fps = 30): string {
  const totalSeconds = Math.max(0, seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const frames = Math.floor((totalSeconds - Math.floor(totalSeconds)) * fps);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(frames)}`;
}

/**
 * Format seconds with two decimal points
 */
export function formatSeconds(seconds: number): string {
  return `${seconds.toFixed(2)}s`;
}
