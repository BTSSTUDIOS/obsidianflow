import test from 'node:test';
import assert from 'node:assert/strict';
import { parseComposition } from './parser.js';

test('parseComposition correctly parses audio ducking with data-duck and data-duck-ratio', () => {
  const html = `
    <div id="composition" data-fps="30" data-duration="10s">
      <of-audio-group id="audio-bed">
        <audio id="bgm" src="music.mp3" data-track="music" data-duck="dialogue" data-duck-ratio="0.25"></audio>
        <audio id="voice" src="voice.mp3" data-track="dialogue" data-start="1s" data-duration="4s"></audio>
      </of-audio-group>
    </div>
  `;

  const comp = parseComposition(html);
  assert.equal(comp.audioGroups.length, 1);
  const tracks = comp.audioGroups[0].tracks;
  assert.equal(tracks.length, 2);

  const bgm = tracks[0];
  assert.equal(bgm.ducking, 'dialogue');
  assert.equal(bgm.duckingAmount, 0.25);

  const voice = tracks[1];
  assert.equal(voice.track, 'dialogue');
  assert.equal(voice.startTime, 1);
  assert.equal(voice.duration, 4);
});

test('parseComposition supports legacy data-ducking and data-ducking-amount aliases', () => {
  const html = `
    <div id="composition" data-fps="30" data-duration="10s">
      <audio id="bgm" src="music.mp3" data-track="music" data-ducking="dialogue" data-ducking-amount="0.3"></audio>
    </div>
  `;

  const comp = parseComposition(html);
  const track = comp.audioGroups[0].tracks[0];
  assert.equal(track.ducking, 'dialogue');
  assert.equal(track.duckingAmount, 0.3);
});

test('parseComposition parses volume keyframes', () => {
  const html = `
    <div id="composition" data-fps="30" data-duration="10s">
      <audio id="bgm" src="music.mp3" data-volume-keyframes="0s:1.0, 2s:0.25, 4.5s:0.25, 5s:1.0"></audio>
    </div>
  `;

  const comp = parseComposition(html);
  const track = comp.audioGroups[0].tracks[0];
  assert.ok(track.volumeKeyframes);
  assert.equal(track.volumeKeyframes.length, 4);
  assert.deepEqual(track.volumeKeyframes[0], { time: 0, volume: 1.0 });
  assert.deepEqual(track.volumeKeyframes[1], { time: 2, volume: 0.25 });
  assert.deepEqual(track.volumeKeyframes[2], { time: 4.5, volume: 0.25 });
  assert.deepEqual(track.volumeKeyframes[3], { time: 5, volume: 1.0 });
});

test('parseComposition parses SMPTE wipe transitions', () => {
  const html = `
    <div id="composition" data-fps="30" data-duration="10s">
      <of-transition type="smpte-wipe" code="1" data-softness="15" data-start="3s" data-duration="1s"></of-transition>
    </div>
  `;

  const comp = parseComposition(html);
  assert.equal(comp.transitions.length, 1);
  const trans = comp.transitions[0];
  assert.equal(trans.type, 'smpte-wipe');
  assert.equal(trans.smpteCode, 1);
  assert.equal(trans.softness, 15);
  assert.equal(trans.startTime, 3);
  assert.equal(trans.duration, 1);
});
