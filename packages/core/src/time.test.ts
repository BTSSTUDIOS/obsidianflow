import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TICKS_PER_SECOND,
  resolveFps,
  secondsToTicks,
  ticksToSeconds,
  frameToTicks,
  ticksToFrame,
  formatTimecode,
  parseTime,
} from './time.js';

test('TICKS_PER_SECOND divides evenly by standard broadcast and film rates', () => {
  // 24 fps
  assert.equal(TICKS_PER_SECOND % 24n, 0n);
  // 25 fps PAL
  assert.equal(TICKS_PER_SECOND % 25n, 0n);
  // 30 fps
  assert.equal(TICKS_PER_SECOND % 30n, 0n);
  // 48 fps HFR
  assert.equal(TICKS_PER_SECOND % 48n, 0n);
  // 50 fps
  assert.equal(TICKS_PER_SECOND % 50n, 0n);
  // 60 fps
  assert.equal(TICKS_PER_SECOND % 60n, 0n);
  // 120 fps
  assert.equal(TICKS_PER_SECOND % 120n, 0n);
  // 48000 Hz audio
  assert.equal(TICKS_PER_SECOND % 48000n, 0n);
  // 44100 Hz audio
  assert.equal(TICKS_PER_SECOND % 44100n, 0n);
  // 96000 Hz audio
  assert.equal(TICKS_PER_SECOND % 96000n, 0n);
});

test('NTSC drop-frame rates yield exact integer ticks per frame', () => {
  // 23.976 fps = 24000/1001
  const ticks24 = (TICKS_PER_SECOND * 1001n) / 24000n;
  assert.equal(ticks24, 10594584000n);
  assert.equal((TICKS_PER_SECOND * 1001n) % 24000n, 0n);

  // 29.97 fps = 30000/1001
  const ticks30 = (TICKS_PER_SECOND * 1001n) / 30000n;
  assert.equal(ticks30, 8475667200n);
  assert.equal((TICKS_PER_SECOND * 1001n) % 30000n, 0n);

  // 59.94 fps = 60000/1001
  const ticks60 = (TICKS_PER_SECOND * 1001n) / 60000n;
  assert.equal(ticks60, 4237833600n);
  assert.equal((TICKS_PER_SECOND * 1001n) % 60000n, 0n);
});

test('frameToTicks and ticksToFrame roundtrip accurately', () => {
  const frame = 120;
  const ticks = frameToTicks(frame, '29.97');
  const reconstructed = ticksToFrame(ticks, '29.97');
  assert.equal(reconstructed, frame);
});

test('formatTimecode outputs exact SMPTE timecode without drift', () => {
  assert.equal(formatTimecode(0, 30), '00:00:00:00');
  assert.equal(formatTimecode(1.0, 30), '00:00:01:00');
  assert.equal(formatTimecode(65.5, 30), '00:01:05:15');
  assert.equal(formatTimecode(3661.0, 30), '01:01:01:00');
  assert.equal(formatTimecode(65.5, 30, true), '00:01:05;15');
});

test('parseTime handles various inputs', () => {
  assert.equal(parseTime('2.5s'), 2.5);
  assert.equal(parseTime('500ms'), 0.5);
  assert.equal(parseTime('1m30s'), 90);
  assert.equal(parseTime('60f', 30), 2.0);
  assert.equal(parseTime('00:01:30'), 90);
});
