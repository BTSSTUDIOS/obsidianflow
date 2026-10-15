import { test } from 'node:test';
import assert from 'node:assert';
import { scoreComposition } from './scorer.js';

test('scoreComposition grades a production-grade composition with high marks', () => {
  const html = `
    <html data-duration="15s" data-fps="30" data-width="1920" data-height="1080">
      <head>
        <style>
          .crash-zoom { animation: zoomIn 3s ease; }
        </style>
      </head>
      <body>
        <div class="clip crash-zoom" id="shot-1" data-start="0s" data-duration="4s"></div>
        <div class="clip" id="shot-2" data-start="4s" data-duration="5s"></div>
        <div class="clip" id="shot-3" data-start="9s" data-duration="6s"></div>
        <of-transition type="wipe" data-start="4s" data-duration="1s"></of-transition>
        <audio src="dialogue.mp3" data-track="dialogue" data-duck="0.18" data-start="0s" data-duration="15s"></audio>
        <audio src="music.mp3" data-track="music" data-fade-out="1s" data-start="0s" data-duration="15s"></audio>
      </body>
    </html>
  `;

  const score = scoreComposition(html);
  assert.ok(score.totalScore >= 80, `Expected score >= 80, got ${score.totalScore}`);
  assert.ok(['A+', 'A'].includes(score.grade), `Expected A or A+, got ${score.grade}`);
  assert.strictEqual(score.dimensions.hookVelocity.score, 25);
  assert.strictEqual(score.dimensions.audioArchitecture.score, 25);
  assert.strictEqual(score.dimensions.smptePrecision.score, 15);
});

test('scoreComposition detects issues in poorly formatted composition', () => {
  const html = `
    <html data-duration="20s" data-fps="29" data-width="1920" data-height="1080">
      <body>
        <div class="clip" id="shot-1" data-start="5.123s" data-duration="14.877s"></div>
      </body>
    </html>
  `;

  const score = scoreComposition(html);
  assert.ok(score.totalScore < 60, `Expected low score, got ${score.totalScore}`);
  assert.ok(['D', 'F'].includes(score.grade), `Expected D or F, got ${score.grade}`);
  assert.ok(score.feedback.length >= 3);
});
