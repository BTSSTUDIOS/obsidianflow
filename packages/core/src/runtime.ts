/**
 * ObsidianFlow In-Browser Runtime & Master Clock.
 * Ensures frame-accurate, deterministic seeking across GSAP, WAAPI, Native timelines, and media elements.
 */

import type { FrameAdapter, ObsidianFlowGlobalRuntime, Composition } from './types.js';
import { NativeTimelineAdapter } from './adapters/native.js';
import { parseTime } from './time.js';

declare global {
  interface Window {
    __obsidianflow: ObsidianFlowGlobalRuntime;
    __timelines: Record<string, FrameAdapter | any>;
    __compositions: Record<string, Composition>;
    NativeTimelineAdapter: typeof NativeTimelineAdapter;
  }
}

export function initRuntime(): ObsidianFlowGlobalRuntime {
  if (typeof window === 'undefined') {
    return {} as ObsidianFlowGlobalRuntime;
  }

  if (window.__obsidianflow) {
    return window.__obsidianflow;
  }

  window.__timelines = window.__timelines || {};
  window.__compositions = window.__compositions || {};
  window.NativeTimelineAdapter = NativeTimelineAdapter;

  const runtime: ObsidianFlowGlobalRuntime = {
    version: '0.1.0',
    currentTime: 0,
    timelines: window.__timelines,
    compositions: window.__compositions,

    registerTimeline(id: string, adapter: FrameAdapter) {
      window.__timelines[id] = adapter;
    },

    registerComposition(comp: Composition) {
      window.__compositions[comp.id] = comp;
    },

    async seek(timeInSeconds: number) {
      const t = Math.max(0, timeInSeconds);
      this.currentTime = t;

      // 1. Seek all registered timelines (GSAP, WAAPI, NativeTimeline)
      for (const [id, timeline] of Object.entries(window.__timelines)) {
        if (!timeline) continue;
        try {
          if (typeof timeline.seek === 'function') {
            timeline.seek(t);
          } else if (typeof timeline.time === 'function') {
            timeline.time(t);
          }
        } catch (e) {
          console.warn(`[ObsidianFlow] Error seeking timeline "${id}":`, e);
        }
      }

      // 2. Synchronize all video elements
      const videoElements = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
      for (const video of videoElements) {
        try {
          video.pause();
          const clipEl = video.closest('.clip') as HTMLElement | null;
          if (clipEl) {
            const clipStart = parseTime(clipEl.getAttribute('data-start') || '0s');
            const clipDuration = parseTime(clipEl.getAttribute('data-duration') || '5s');
            const mediaStart = parseTime(video.getAttribute('data-media-start') || '0s');

            if (t >= clipStart && t < clipStart + clipDuration) {
              clipEl.style.display = '';
              const targetTime = mediaStart + (t - clipStart);
              if (Math.abs(video.currentTime - targetTime) > 0.001) {
                video.currentTime = targetTime;
              }
            } else {
              clipEl.style.display = 'none';
            }
          }
        } catch {
          // ignore
        }
      }

      // 3. Synchronize all audio elements
      const audioElements = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
      for (const audio of audioElements) {
        try {
          audio.pause();
          const start = parseTime(audio.getAttribute('data-start') || '0s');
          const duration = parseTime(audio.getAttribute('data-duration') || '10s');
          const mediaStart = parseTime(audio.getAttribute('data-media-start') || '0s');

          if (t >= start && t < start + duration) {
            const targetTime = mediaStart + (t - start);
            if (Math.abs(audio.currentTime - targetTime) > 0.001) {
              audio.currentTime = targetTime;
            }
          }
        } catch {
          // ignore
        }
      }

      // 4. Dispatch deterministic time update event
      const event = new CustomEvent('obsidianflow:timeupdate', {
        detail: { currentTime: t },
      });
      window.dispatchEvent(event);

      // Force synchronous reflow
      if (document.body) {
        void document.body.offsetHeight;
      }
    },
  };

  window.__obsidianflow = runtime;

  // Auto-init on page load
  if (typeof document !== 'undefined') {
    const onReady = () => {
      // Pause all media initially
      document.querySelectorAll('video, audio').forEach((el) => {
        try {
          (el as HTMLMediaElement).pause();
        } catch {
          // ignore
        }
      });
      // Initial seek to frame 0
      runtime.seek(0);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  return runtime;
}

// Auto-run if executed in browser environment
if (typeof window !== 'undefined') {
  initRuntime();
}
