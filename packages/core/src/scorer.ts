import type { Composition, CompositionScore, ScoreDimension } from './types.js';
import { parseComposition } from './parser.js';

export interface ScoreOptions {
  rawHtml?: string;
}

/**
 * Evaluates an ObsidianFlow composition against professional Hollywood and
 * digital cinema criteria: Hook Velocity, Pacing Rhythm, Audio Architecture,
 * SMPTE Frame Precision, and Visual Cinematics.
 */
export function scoreComposition(
  input: Composition | string,
  options: ScoreOptions = {}
): CompositionScore {
  const comp: Composition = typeof input === 'string' ? parseComposition(input) : input;
  const html = options.rawHtml || (typeof input === 'string' ? input : '');

  const feedback: string[] = [];

  // 1. Hook Velocity (Max: 25)
  let hookScore = 0;
  const firstClip = comp.clips[0];
  if (firstClip && firstClip.startTime === 0) {
    hookScore += 5;
  } else {
    feedback.push('Hook delay: First clip does not start at 00:00:00:00.');
  }

  // Check if an event, cut, or camera motion occurs within first 3 seconds
  const earlyEvents = comp.clips.filter((c) => c.startTime > 0 && c.startTime <= 3.5);
  const hasEarlyTransition = comp.transitions.some((t) => t.startTime <= 3.5);
  const hasMotionKeywords = /crash-zoom|dolly|orbit|pan|tilt|whip|typing|fade-in|scale|bounce|reveal/i.test(html);
  const firstClipHasMotion = firstClip && (firstClip.className?.includes('crash-zoom') || firstClip.className?.includes('orbit') || firstClip.className?.includes('dolly') || /crash-zoom|zoomIn/i.test(html));

  if (earlyEvents.length > 0 || hasEarlyTransition || firstClipHasMotion) {
    hookScore += 15;
  } else if (hasMotionKeywords) {
    hookScore += 10;
  } else {
    feedback.push('3-Second Rule: No scene cut, camera motion, or dynamic transition triggers in the first 3 seconds.');
  }

  if (hasMotionKeywords) {
    hookScore += 5;
  }

  hookScore = Math.min(25, hookScore);

  // 2. Pacing Rhythm (Max: 20)
  let pacingScore = 0;
  const clipCount = comp.clips.length;
  if (clipCount >= 3) {
    pacingScore += 10;
  } else if (clipCount >= 2) {
    pacingScore += 7;
  } else {
    feedback.push('Single continuous shot: Consider cutting into at least 2-3 distinct scenes for narrative tension.');
  }

  if (clipCount > 0) {
    const avgShotLength = comp.duration / clipCount;
    if (avgShotLength >= 1.5 && avgShotLength <= 5.5) {
      pacingScore += 5;
    } else if (avgShotLength > 7.0) {
      feedback.push(`Sluggish pacing: Average shot length is ${avgShotLength.toFixed(1)}s (target: 2.0s - 5.0s).`);
    } else {
      pacingScore += 3;
    }

    const hasDeadHolds = comp.clips.some((c) => c.duration > 8.0);
    if (!hasDeadHolds) {
      pacingScore += 5;
    } else {
      feedback.push('Stagnant scene hold: At least one clip remains on screen for > 8.0s without an edit.');
    }
  }

  pacingScore = Math.min(20, pacingScore);

  // 3. Audio Architecture & EBU R128 Ducking (Max: 25)
  let audioScore = 0;
  const audioTracks = comp.audioGroups.flatMap((g) => g.tracks);
  const totalAudioTracks = audioTracks.length;
  if (totalAudioTracks >= 2) {
    audioScore += 10;
  } else if (totalAudioTracks === 1) {
    audioScore += 5;
    feedback.push('Single audio stem: Combine voiceover/dialogue with background music and SFX stems.');
  } else {
    feedback.push('Dead silence: No audio tracks found. Video lacks sound design.');
  }

  const hasDucking = audioTracks.some((t) => t.ducking !== undefined || t.duckingAmount !== undefined);
  if (hasDucking) {
    audioScore += 10;
  } else if (totalAudioTracks >= 2) {
    feedback.push('Missing EBU R128 ducking: Dialogue stems should auto-duck background music (add data-duck="0.18").');
  }

  const hasVolumeKeyframes = audioTracks.some((t) => (t.volumeKeyframes && t.volumeKeyframes.length > 0) || t.fadeIn !== undefined || t.fadeOut !== undefined);
  if (hasVolumeKeyframes) {
    audioScore += 5;
  } else if (audioScore > 0) {
    audioScore += 2; // Partial credit
  }

  audioScore = Math.min(25, audioScore);

  // 4. SMPTE Precision & Clock Alignment (Max: 15)
  let smpteScore = 0;
  const fps = comp.fps || 30;
  if ([23.976, 24, 25, 29.97, 30, 50, 59.94, 60].includes(fps)) {
    smpteScore += 5;
  } else {
    feedback.push(`Non-standard framerate (${fps}fps): Use broadcast standard rates (24, 25, 30, 60fps).`);
  }

  let subframeDrift = false;
  for (const clip of comp.clips) {
    const startFrame = clip.startTime * fps;
    const durFrame = clip.duration * fps;
    if (Math.abs(startFrame - Math.round(startFrame)) > 0.05 || Math.abs(durFrame - Math.round(durFrame)) > 0.05) {
      subframeDrift = true;
      break;
    }
  }

  if (!subframeDrift) {
    smpteScore += 10;
  } else {
    feedback.push('SMPTE sub-frame drift detected: Clip timing does not land on integer frame boundaries.');
  }

  smpteScore = Math.min(15, smpteScore);

  // 5. Visual Cinematics & Safe-Zone Safety (Max: 15)
  let visualScore = 0;
  if (comp.transitions.length > 0 || /of-transition|smpte-wipe|wipe/i.test(html)) {
    visualScore += 5;
  } else {
    feedback.push('Hard cuts only: Consider cinematic SMPTE wipes (<of-transition>) or match cuts.');
  }

  const isVertical = comp.width < comp.height;
  if (isVertical) {
    if (/safe-zone|padding:.*1[0-9]{2}px|inset/i.test(html)) {
      visualScore += 5;
    } else {
      feedback.push('9:16 safe-zone warning: Text may clip beneath TikTok/Reels UI overlay buttons.');
    }
  } else {
    visualScore += 5; // Landscape title safe default
  }

  if (comp.variables.length > 0 || /@keyframes|gsap|requestAnimationFrame/i.test(html)) {
    visualScore += 5;
  } else {
    visualScore += 2;
  }

  visualScore = Math.min(15, visualScore);

  // Total
  const totalScore = hookScore + pacingScore + audioScore + smpteScore + visualScore;

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (totalScore >= 92) grade = 'A+';
  else if (totalScore >= 82) grade = 'A';
  else if (totalScore >= 72) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else if (totalScore >= 50) grade = 'D';

  return {
    totalScore,
    grade,
    dimensions: {
      hookVelocity: {
        name: 'Hook Velocity (3s Rule)',
        score: hookScore,
        maxScore: 25,
        weight: 0.25,
        details: 'Visual movement and audience capture in the first 3.0 seconds',
      },
      pacingRhythm: {
        name: 'Pacing & Shot Rhythm',
        score: pacingScore,
        maxScore: 20,
        weight: 0.20,
        details: 'Scene distribution, average shot length, and absence of dead holds',
      },
      audioArchitecture: {
        name: 'Audio Architecture & Ducking',
        score: audioScore,
        maxScore: 25,
        weight: 0.25,
        details: 'Multi-stem layering, EBU R128 auto-ducking, and volume envelopes',
      },
      smptePrecision: {
        name: 'SMPTE Frame Precision',
        score: smpteScore,
        maxScore: 15,
        weight: 0.15,
        details: 'Broadcast standard framerate and zero sub-frame timing drift',
      },
      visualCinematics: {
        name: 'Cinematics & Safe Zones',
        score: visualScore,
        maxScore: 15,
        weight: 0.15,
        details: 'SMPTE wipe transitions, dynamic camera classes, and UI safe margins',
      },
    },
    feedback: feedback.length > 0 ? feedback : ['Flawless cinematic execution! Ready for broadcast rendering.'],
  };
}
