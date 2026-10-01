import type { FrameAdapter } from '../types.js';

export interface GSAPTimelineLike {
  seek(time: number, suppressEvents?: boolean): any;
  pause(atTime?: number, suppressEvents?: boolean): any;
  duration(): number;
  totalDuration?(): number;
  kill?(): void;
}

/**
 * Adapter for GreenSock Animation Platform (GSAP) timelines.
 * Ensures the timeline is paused and frame-by-frame seek is deterministic.
 */
export class GSAPAdapter implements FrameAdapter {
  name = 'gsap';
  private timeline: GSAPTimelineLike;

  constructor(timeline: GSAPTimelineLike) {
    this.timeline = timeline;
    if (typeof this.timeline.pause === 'function') {
      this.timeline.pause(0);
    }
  }

  seek(timeInSeconds: number): void {
    if (this.timeline && typeof this.timeline.seek === 'function') {
      this.timeline.seek(timeInSeconds, false);
    }
  }

  getDuration(): number {
    if (this.timeline && typeof this.timeline.totalDuration === 'function') {
      return this.timeline.totalDuration();
    }
    if (this.timeline && typeof this.timeline.duration === 'function') {
      return this.timeline.duration();
    }
    return 0;
  }

  destroy(): void {
    if (this.timeline && typeof this.timeline.kill === 'function') {
      this.timeline.kill();
    }
  }
}
