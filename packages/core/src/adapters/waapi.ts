import type { FrameAdapter } from '../types.js';

export interface WAAPIAnimationLike {
  currentTime: number | null;
  playbackRate: number;
  pause(): void;
  play(): void;
  cancel?(): void;
  effect?: {
    getComputedTiming?(): {
      endTime?: number;
      duration?: number | string;
    };
  } | null;
}

/**
 * Adapter for Web Animations API (element.animate() and CSS Animations).
 * Controls animations by scrubbing their `currentTime` in milliseconds.
 */
export class WAAPIAdapter implements FrameAdapter {
  name = 'waapi';
  private animations: WAAPIAnimationLike[];
  private maxDurationSeconds = 0;

  constructor(animations: WAAPIAnimationLike | WAAPIAnimationLike[]) {
    this.animations = Array.isArray(animations) ? animations : [animations];
    this.calculateDuration();
    this.pauseAll();
  }

  private pauseAll(): void {
    for (const anim of this.animations) {
      try {
        anim.pause();
      } catch {
        // Ignore if already paused or detached
      }
    }
  }

  private calculateDuration(): void {
    let maxMs = 0;
    for (const anim of this.animations) {
      if (anim.effect && typeof anim.effect.getComputedTiming === 'function') {
        const timing = anim.effect.getComputedTiming();
        const end = typeof timing.endTime === 'number' ? timing.endTime : 0;
        if (end > maxMs) maxMs = end;
      }
    }
    this.maxDurationSeconds = maxMs > 0 ? maxMs / 1000 : 10;
  }

  seek(timeInSeconds: number): void {
    const timeMs = Math.max(0, timeInSeconds * 1000);
    for (const anim of this.animations) {
      try {
        anim.currentTime = timeMs;
      } catch {
        // Handle detached or completed animations
      }
    }
  }

  getDuration(): number {
    return this.maxDurationSeconds;
  }

  destroy(): void {
    for (const anim of this.animations) {
      try {
        if (typeof anim.cancel === 'function') anim.cancel();
      } catch {
        // Ignore
      }
    }
    this.animations = [];
  }
}
