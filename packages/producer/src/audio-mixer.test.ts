import test from 'node:test';
import assert from 'node:assert/strict';
import { mixAudio, type AudioMixOptions } from './audio-mixer.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

test('mixAudio returns outputPath when no valid tracks exist', async () => {
  const tmpDir = os.tmpdir();
  const dummyVideo = path.join(tmpDir, `of_test_${Date.now()}.mp4`);
  const dummyOut = path.join(tmpDir, `of_test_out_${Date.now()}.mp4`);

  fs.writeFileSync(dummyVideo, 'fake video content');

  try {
    const opts: AudioMixOptions = {
      audioGroups: [
        {
          id: 'group-1',
          fxChain: [],
          tracks: [
            {
              id: 'track-1',
              src: 'non-existent-audio-file.mp3',
              track: 'music',
              startTime: 0,
              duration: 5,
              volume: 1.0,
            },
          ],
        },
      ],
      videoPath: dummyVideo,
      outputPath: dummyOut,
      loudnessNorm: true,
    };

    const result = await mixAudio(opts);
    assert.equal(result, dummyOut);
    assert.ok(fs.existsSync(dummyOut));
  } finally {
    if (fs.existsSync(dummyVideo)) fs.unlinkSync(dummyVideo);
    if (fs.existsSync(dummyOut)) fs.unlinkSync(dummyOut);
  }
});
