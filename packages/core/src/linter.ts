import fs from 'fs';
import path from 'path';
import type { Composition, LintRule, LintResult, LintRuleOptions } from './types.js';
import { parseComposition } from './parser.js';

export const LINT_RULES: LintRule[] = [
  // --- TIMING RULES ---
  {
    id: 'OF001',
    name: 'clip-duration-overflow',
    category: 'timing',
    severity: 'error',
    message: 'Clip extends beyond composition duration',
    check: (c) => {
      const results: LintResult[] = [];
      for (const clip of c.clips) {
        const clipEnd = clip.startTime + clip.duration;
        if (clipEnd > c.duration + 0.001) {
          results.push({
            ruleId: 'OF001',
            severity: 'error',
            message: `Clip "${clip.id}" ends at ${clipEnd.toFixed(2)}s but composition duration is ${c.duration.toFixed(2)}s`,
            element: clip.elementSelector,
            fixSuggestion: `Adjust data-start or data-duration so startTime + duration <= ${c.duration}s`,
          });
        }
      }
      return results;
    },
  },
  {
    id: 'OF002',
    name: 'overlapping-clips',
    category: 'timing',
    severity: 'warning',
    message: 'Clips on the same track overlap in time',
    check: (c) => {
      const results: LintResult[] = [];
      const trackMap: Record<string, typeof c.clips> = {};
      for (const clip of c.clips) {
        if (!trackMap[clip.track]) trackMap[clip.track] = [];
        trackMap[clip.track].push(clip);
      }

      for (const [track, clips] of Object.entries(trackMap)) {
        const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
        for (let i = 0; i < sorted.length - 1; i++) {
          const current = sorted[i];
          const next = sorted[i + 1];
          const currentEnd = current.startTime + current.duration;
          if (currentEnd > next.startTime + 0.001) {
            results.push({
              ruleId: 'OF002',
              severity: 'warning',
              message: `Track "${track}" has overlapping clips: "${current.id}" (ends at ${currentEnd.toFixed(2)}s) and "${next.id}" (starts at ${next.startTime.toFixed(2)}s)`,
              element: next.elementSelector,
              fixSuggestion: 'Use separate tracks for overlapping clips or introduce an <of-transition>',
            });
          }
        }
      }
      return results;
    },
  },
  {
    id: 'OF003',
    name: 'negative-clip-start',
    category: 'timing',
    severity: 'error',
    message: 'Clip start time is negative',
    check: (c) =>
      c.clips
        .filter((clip) => clip.startTime < 0)
        .map((clip) => ({
          ruleId: 'OF003',
          severity: 'error',
          message: `Clip "${clip.id}" has negative start time: ${clip.startTime}s`,
          element: clip.elementSelector,
          fixSuggestion: 'Change data-start to a value >= 0s',
        })),
  },
  {
    id: 'OF004',
    name: 'invalid-clip-duration',
    category: 'timing',
    severity: 'error',
    message: 'Clip duration must be strictly greater than 0',
    check: (c) =>
      c.clips
        .filter((clip) => clip.duration <= 0)
        .map((clip) => ({
          ruleId: 'OF004',
          severity: 'error',
          message: `Clip "${clip.id}" has invalid duration: ${clip.duration}s`,
          element: clip.elementSelector,
          fixSuggestion: 'Set data-duration to a positive value (e.g. data-duration="5s")',
        })),
  },
  {
    id: 'OF005',
    name: 'audio-duration-overflow',
    category: 'timing',
    severity: 'warning',
    message: 'Audio track extends beyond composition duration',
    check: (c) => {
      const results: LintResult[] = [];
      for (const group of c.audioGroups) {
        for (const track of group.tracks) {
          const trackEnd = track.startTime + track.duration;
          if (trackEnd > c.duration + 0.001) {
            results.push({
              ruleId: 'OF005',
              severity: 'warning',
              message: `Audio track "${track.id}" ends at ${trackEnd.toFixed(2)}s, exceeding composition duration (${c.duration.toFixed(2)}s). Audio will be trimmed during encoding.`,
              fixSuggestion: `Set data-duration="${(c.duration - track.startTime).toFixed(2)}s" on <audio>`,
            });
          }
        }
      }
      return results;
    },
  },
  {
    id: 'OF006',
    name: 'transition-duration-overflow',
    category: 'timing',
    severity: 'error',
    message: 'Transition duration is longer than connected clip duration',
    check: (c) => {
      const results: LintResult[] = [];
      for (const t of c.transitions) {
        if (t.duration <= 0) {
          results.push({
            ruleId: 'OF006',
            severity: 'error',
            message: `Transition "${t.type}" has invalid duration: ${t.duration}s`,
          });
        }
      }
      return results;
    },
  },
  {
    id: 'OF007',
    name: 'transition-out-of-bounds',
    category: 'timing',
    severity: 'error',
    message: 'Transition start time is outside composition duration',
    check: (c) =>
      c.transitions
        .filter((t) => t.startTime < 0 || t.startTime >= c.duration)
        .map((t) => ({
          ruleId: 'OF007',
          severity: 'error',
          message: `Transition "${t.type}" starts at ${t.startTime}s, outside composition [0s, ${c.duration}s]`,
        })),
  },
  {
    id: 'OF008',
    name: 'unresolved-audio-ducking',
    category: 'timing',
    severity: 'warning',
    message: 'Audio ducking references a track name that does not exist',
    check: (c) => {
      const results: LintResult[] = [];
      const allTrackNames = new Set<string>();
      for (const group of c.audioGroups) {
        for (const tr of group.tracks) {
          allTrackNames.add(tr.track);
        }
      }
      for (const group of c.audioGroups) {
        for (const tr of group.tracks) {
          if (tr.ducking && !allTrackNames.has(tr.ducking)) {
            results.push({
              ruleId: 'OF008',
              severity: 'warning',
              message: `Audio track "${tr.id}" has ducking="${tr.ducking}", but no audio track has data-track="${tr.ducking}"`,
              fixSuggestion: `Ensure another <audio> element has data-track="${tr.ducking}"`,
            });
          }
        }
      }
      return results;
    },
  },
  {
    id: 'OF009',
    name: 'negative-media-start',
    category: 'timing',
    severity: 'error',
    message: 'Media start offset is negative',
    check: (c) => {
      const results: LintResult[] = [];
      for (const clip of c.clips) {
        if (clip.media && clip.media.mediaStart < 0) {
          results.push({
            ruleId: 'OF009',
            severity: 'error',
            message: `Clip "${clip.id}" has negative mediaStart: ${clip.media.mediaStart}s`,
            element: clip.elementSelector,
          });
        }
      }
      return results;
    },
  },

  // --- DETERMINISM RULES ---
  {
    id: 'OF010',
    name: 'non-deterministic-random',
    category: 'determinism',
    severity: 'error',
    message: 'Math.random() detected. Video renders will not be frame-accurate or reproducible.',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/Math\.random\s*\(/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF010',
            severity: 'error',
            message: 'Math.random() detected in composition scripts. Use a seeded PRNG or fixed keyframe values.',
            fixSuggestion: 'Replace Math.random() with deterministic seed values or time-based functions f(time).',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF011',
    name: 'non-deterministic-date',
    category: 'determinism',
    severity: 'warning',
    message: 'Date.now() or new Date() detected. Wall clock time breaks deterministic rendering.',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/Date\.now\s*\(|new\s+Date\s*\(/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF011',
            severity: 'warning',
            message: 'Wall clock Date access detected. Animation should depend only on timeline seek time.',
            fixSuggestion: 'Use timeline time parameter instead of Date.now().',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF012',
    name: 'timer-functions-detected',
    category: 'determinism',
    severity: 'error',
    message: 'setInterval or setTimeout detected. Headless rendering steps frame-by-frame; real-time timers will desync.',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/setInterval\s*\(|setTimeout\s*\(/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF012',
            severity: 'error',
            message: 'setInterval() or setTimeout() detected. Use seekable timelines (GSAP, WAAPI, or NativeTimeline).',
            fixSuggestion: 'Remove intervals and register animation with window.__timelines or window.__obsidianflow.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF013',
    name: 'request-animation-frame-detected',
    category: 'determinism',
    severity: 'warning',
    message: 'requestAnimationFrame() detected in inline scripts',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/requestAnimationFrame\s*\(/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF013',
            severity: 'warning',
            message: 'requestAnimationFrame() loops run in real-time and will cause skipped frames during capture.',
            fixSuggestion: 'Wrap animation in a seekable timeline implementing seek(time).',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF014',
    name: 'performance-now-detected',
    category: 'determinism',
    severity: 'warning',
    message: 'performance.now() detected in scripts',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/performance\.now\s*\(/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF014',
            severity: 'warning',
            message: 'performance.now() detected. Use the frame seek time parameter instead.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF015',
    name: 'crypto-random-detected',
    category: 'determinism',
    severity: 'warning',
    message: 'crypto.getRandomValues detected',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/crypto\.getRandomValues/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF015',
            severity: 'warning',
            message: 'crypto.getRandomValues() causes non-deterministic rendering.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF016',
    name: 'css-infinite-animation',
    category: 'determinism',
    severity: 'warning',
    message: 'CSS infinite animation detected without a seekable controller',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/animation(?:-iteration-count)?\s*:[^;]*\binfinite\b/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF016',
            severity: 'warning',
            message: 'CSS "animation: ... infinite" detected. Headless capture cannot deterministically scrub CSS animations without WAAPI.',
            fixSuggestion: 'Use element.animate() via WAAPI or NativeTimelineAdapter for deterministic scrubbing.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF017',
    name: 'async-fetch-in-render',
    category: 'determinism',
    severity: 'warning',
    message: 'fetch() or XMLHttpRequest detected',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/\bfetch\s*\(|\bnew\s+XMLHttpRequest\s*\(/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF017',
            severity: 'warning',
            message: 'Network fetch() detected in document. All media and assets should be preloaded before rendering.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF018',
    name: 'missing-timeline-registration',
    category: 'determinism',
    severity: 'warning',
    message: 'No timeline registered on window.__timelines or window.__obsidianflow',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (
        !rawHtml.includes('__timelines') &&
        !rawHtml.includes('__obsidianflow') &&
        !rawHtml.includes('NativeTimelineAdapter')
      ) {
        return [
          {
            ruleId: 'OF018',
            severity: 'warning',
            message: 'Document does not register window.__timelines or import @obsidianflow/core/runtime.js.',
            fixSuggestion: 'Add <script src="@obsidianflow/core/runtime.js"></script> and register timelines.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF019',
    name: 'dom-mutation-observers',
    category: 'determinism',
    severity: 'info',
    message: 'MutationObserver or ResizeObserver detected',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (/new\s+(?:MutationObserver|ResizeObserver)\s*\(/i.test(rawHtml)) {
        return [
          {
            ruleId: 'OF019',
            severity: 'info',
            message: 'DOM observers can delay layout calculations during frame screenshotting.',
          },
        ];
      }
      return [];
    },
  },

  // --- STRUCTURE & SYNTAX RULES ---
  {
    id: 'OF020',
    name: 'missing-composition-id',
    category: 'structure',
    severity: 'warning',
    message: 'Composition has default or missing data-composition-id',
    check: (c) => {
      if (!c.id || c.id === 'untitled' || c.id === 'composition-01') {
        return [
          {
            ruleId: 'OF020',
            severity: 'warning',
            message: 'Missing or default data-composition-id on <html>. Give your composition a descriptive ID.',
            fixSuggestion: 'Add data-composition-id="my-scene-name" to the <html> tag.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF021',
    name: 'invalid-dimensions',
    category: 'structure',
    severity: 'error',
    message: 'Composition dimensions must be positive even integers (required for H.264 video encoding)',
    check: (c) => {
      const results: LintResult[] = [];
      if (c.width <= 0 || isNaN(c.width)) {
        results.push({
          ruleId: 'OF021',
          severity: 'error',
          message: `Invalid width: ${c.width}. Must be a positive integer.`,
        });
      } else if (c.width % 2 !== 0) {
        results.push({
          ruleId: 'OF021',
          severity: 'error',
          message: `Width ${c.width} is odd. H.264/yuv420p requires even width. Suggestion: ${c.width + 1}`,
        });
      }
      if (c.height <= 0 || isNaN(c.height)) {
        results.push({
          ruleId: 'OF021',
          severity: 'error',
          message: `Invalid height: ${c.height}. Must be a positive integer.`,
        });
      } else if (c.height % 2 !== 0) {
        results.push({
          ruleId: 'OF021',
          severity: 'error',
          message: `Height ${c.height} is odd. H.264/yuv420p requires even height. Suggestion: ${c.height + 1}`,
        });
      }
      return results;
    },
  },
  {
    id: 'OF022',
    name: 'invalid-fps',
    category: 'structure',
    severity: 'error',
    message: 'Composition FPS must be between 1 and 120',
    check: (c) => {
      if (c.fps <= 0 || c.fps > 120 || isNaN(c.fps)) {
        return [
          {
            ruleId: 'OF022',
            severity: 'error',
            message: `Invalid fps: ${c.fps}. Typical values: 24, 25, 30, 60.`,
            fixSuggestion: 'Set data-fps="30" or data-fps="60" on <html>.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF023',
    name: 'invalid-duration',
    category: 'structure',
    severity: 'error',
    message: 'Composition duration must be strictly greater than 0',
    check: (c) => {
      if (c.duration <= 0 || isNaN(c.duration)) {
        return [
          {
            ruleId: 'OF023',
            severity: 'error',
            message: `Invalid duration: ${c.duration}s.`,
            fixSuggestion: 'Set data-duration="10s" on <html>.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF024',
    name: 'missing-runtime-script',
    category: 'structure',
    severity: 'warning',
    message: 'Composition HTML does not link the ObsidianFlow runtime script',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      if (!rawHtml.includes('runtime.js') && !rawHtml.includes('@obsidianflow/core')) {
        return [
          {
            ruleId: 'OF024',
            severity: 'warning',
            message: 'Missing runtime script. Include <script src="@obsidianflow/core/runtime.js"></script> for seekable clock synchronization.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'OF025',
    name: 'malformed-variables-json',
    category: 'structure',
    severity: 'error',
    message: 'Malformed JSON in data-composition-variables attribute',
    check: (_, rawHtml) => {
      if (!rawHtml) return [];
      const match = rawHtml.match(/data-composition-variables=['"]([^'"]+)['"]/);
      if (match) {
        try {
          JSON.parse(match[1]);
        } catch (e: any) {
          return [
            {
              ruleId: 'OF025',
              severity: 'error',
              message: `Failed to parse data-composition-variables JSON: ${e.message}`,
            },
          ];
        }
      }
      return [];
    },
  },
  {
    id: 'OF026',
    name: 'clip-missing-track',
    category: 'structure',
    severity: 'warning',
    message: 'Clip is missing data-track attribute',
    check: (c) =>
      c.clips
        .filter((clip) => !clip.track || clip.track === 'undefined')
        .map((clip) => ({
          ruleId: 'OF026',
          severity: 'warning',
          message: `Clip "${clip.id}" does not specify data-track. Defaulting to "video-1".`,
          element: clip.elementSelector,
        })),
  },
  {
    id: 'OF027',
    name: 'duplicate-clip-id',
    category: 'structure',
    severity: 'error',
    message: 'Duplicate clip IDs found in composition',
    check: (c) => {
      const results: LintResult[] = [];
      const seen = new Set<string>();
      for (const clip of c.clips) {
        if (seen.has(clip.id)) {
          results.push({
            ruleId: 'OF027',
            severity: 'error',
            message: `Duplicate clip id="${clip.id}" detected. Each clip must have a unique identifier.`,
            element: clip.elementSelector,
          });
        }
        seen.add(clip.id);
      }
      return results;
    },
  },
  {
    id: 'OF028',
    name: 'unknown-transition-type',
    category: 'structure',
    severity: 'warning',
    message: 'Unknown transition type specified in <of-transition>',
    check: (c) => {
      const knownTransitions = new Set([
        'lava-flow',
        'obsidian-shatter',
        'volcanic-wipe',
        'ember-dissolve',
        'smoke-reveal',
        'crystal-fracture',
        'domain-warp',
        'whip-pan',
        'glitch',
        'cinematic-zoom',
        'light-leak',
        'iris',
        'fade',
        'dissolve',
        'wipe',
      ]);
      const results: LintResult[] = [];
      for (const t of c.transitions) {
        if (!knownTransitions.has(t.type)) {
          results.push({
            ruleId: 'OF028',
            severity: 'warning',
            message: `Transition type "${t.type}" is not recognized. Will fall back to standard crossfade.`,
          });
        }
      }
      return results;
    },
  },
  {
    id: 'OF029',
    name: 'unresolved-transition-target',
    category: 'structure',
    severity: 'warning',
    message: 'Transition references non-existent clip ID',
    check: (c) => {
      const results: LintResult[] = [];
      const clipIds = new Set(c.clips.map((clip) => clip.id));
      for (const t of c.transitions) {
        if (t.from && !clipIds.has(t.from)) {
          results.push({
            ruleId: 'OF029',
            severity: 'warning',
            message: `Transition references data-from="${t.from}" which matches no clip ID.`,
          });
        }
        if (t.to && !clipIds.has(t.to)) {
          results.push({
            ruleId: 'OF029',
            severity: 'warning',
            message: `Transition references data-to="${t.to}" which matches no clip ID.`,
          });
        }
      }
      return results;
    },
  },

  // --- MEDIA RULES ---
  {
    id: 'OF030',
    name: 'missing-media-src',
    category: 'media',
    severity: 'error',
    message: 'Media element is missing src attribute',
    check: (c) => {
      const results: LintResult[] = [];
      for (const clip of c.clips) {
        if (clip.media && !clip.media.src) {
          results.push({
            ruleId: 'OF030',
            severity: 'error',
            message: `Clip "${clip.id}" contains <${clip.media.type}> with no src attribute.`,
            element: clip.elementSelector,
          });
        }
      }
      return results;
    },
  },
  {
    id: 'OF031',
    name: 'local-media-not-found',
    category: 'media',
    severity: 'error',
    message: 'Referenced local media file does not exist on disk',
    check: (c, _, options) => {
      const results: LintResult[] = [];
      if (!options?.basePath) return results;

      const checkFile = (src: string, desc: string) => {
        if (!src || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
          return;
        }
        const resolved = path.isAbsolute(src) ? src : path.resolve(options.basePath!, src);
        if (!fs.existsSync(resolved)) {
          results.push({
            ruleId: 'OF031',
            severity: 'error',
            message: `Media file not found for ${desc}: "${src}" (resolved: ${resolved})`,
            fixSuggestion: 'Check relative path or place file in assets folder.',
          });
        }
      };

      for (const clip of c.clips) {
        if (clip.media?.src) {
          checkFile(clip.media.src, `clip "${clip.id}"`);
        }
      }
      for (const g of c.audioGroups) {
        for (const t of g.tracks) {
          if (t.src) {
            checkFile(t.src, `audio track "${t.id}"`);
          }
        }
      }
      return results;
    },
  },
  {
    id: 'OF032',
    name: 'empty-media-src',
    category: 'media',
    severity: 'error',
    message: 'Media element has empty src=""',
    check: (c) => {
      const results: LintResult[] = [];
      for (const clip of c.clips) {
        if (clip.media && clip.media.src.trim() === '') {
          results.push({
            ruleId: 'OF032',
            severity: 'error',
            message: `Clip "${clip.id}" has empty src attribute`,
            element: clip.elementSelector,
          });
        }
      }
      return results;
    },
  },
  {
    id: 'OF033',
    name: 'malformed-media-url',
    category: 'media',
    severity: 'warning',
    message: 'Remote media URL has invalid protocol',
    check: (c) => {
      const results: LintResult[] = [];
      const checkUrl = (src: string, id: string) => {
        if (src.includes('://') && !src.startsWith('http://') && !src.startsWith('https://')) {
          results.push({
            ruleId: 'OF033',
            severity: 'warning',
            message: `Unsupported protocol in URL "${src}" on "${id}".`,
          });
        }
      };
      for (const clip of c.clips) {
        if (clip.media?.src) checkUrl(clip.media.src, clip.id);
      }
      return results;
    },
  },

  // --- AI ATTRIBUTION & METADATA RULES ---
  {
    id: 'OF035',
    name: 'missing-ai-attribution',
    category: 'ai-metadata',
    severity: 'info',
    message: 'Media source is missing data-generated-by AI model attribution',
    check: (c, _, options) => {
      const results: LintResult[] = [];
      for (const clip of c.clips) {
        if (clip.media && !clip.media.generatedBy) {
          results.push({
            ruleId: 'OF035',
            severity: options?.strictAiAttribution ? 'warning' : 'info',
            message: `Clip "${clip.id}" has media but no data-generated-by attribution (e.g. data-generated-by="veo-3.1").`,
            element: clip.elementSelector,
          });
        }
      }
      return results;
    },
  },
  {
    id: 'OF036',
    name: 'missing-generation-id',
    category: 'ai-metadata',
    severity: 'info',
    message: 'AI media is missing data-generation-id tracking attribute',
    check: (c) => {
      const results: LintResult[] = [];
      for (const clip of c.clips) {
        if (clip.media?.generatedBy && !clip.media.generationId) {
          results.push({
            ruleId: 'OF036',
            severity: 'info',
            message: `Clip "${clip.id}" is generated by "${clip.media.generatedBy}" but has no data-generation-id for tracking.`,
            element: clip.elementSelector,
          });
        }
      }
      return results;
    },
  },
  {
    id: 'OF037',
    name: 'audio-volume-out-of-range',
    category: 'media',
    severity: 'warning',
    message: 'Audio track volume is outside the [0.0, 1.0] range',
    check: (c) => {
      const results: LintResult[] = [];
      for (const g of c.audioGroups) {
        for (const t of g.tracks) {
          if (t.volume < 0 || t.volume > 1) {
            results.push({
              ruleId: 'OF037',
              severity: 'warning',
              message: `Audio track "${t.id}" volume is ${t.volume}. Recommended range is 0.0 to 1.0.`,
            });
          }
        }
      }
      return results;
    },
  },
  {
    id: 'OF038',
    name: 'unsupported-audio-extension',
    category: 'media',
    severity: 'warning',
    message: 'Audio source uses uncommon extension',
    check: (c) => {
      const supportedAudio = new Set(['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac']);
      const results: LintResult[] = [];
      for (const g of c.audioGroups) {
        for (const t of g.tracks) {
          if (t.src && !t.src.startsWith('data:')) {
            const ext = path.extname(t.src.split('?')[0]).toLowerCase();
            if (ext && !supportedAudio.has(ext)) {
              results.push({
                ruleId: 'OF038',
                severity: 'warning',
                message: `Audio track "${t.id}" has unfamiliar file extension "${ext}". FFmpeg may fail to decode.`,
              });
            }
          }
        }
      }
      return results;
    },
  },
  {
    id: 'OF039',
    name: 'unsupported-video-extension',
    category: 'media',
    severity: 'warning',
    message: 'Video source uses uncommon extension',
    check: (c) => {
      const supportedVideo = new Set(['.mp4', '.mov', '.webm', '.mkv', '.avi']);
      const results: LintResult[] = [];
      for (const clip of c.clips) {
        if (clip.media?.type === 'video' && clip.media.src && !clip.media.src.startsWith('data:')) {
          const ext = path.extname(clip.media.src.split('?')[0]).toLowerCase();
          if (ext && !supportedVideo.has(ext)) {
            results.push({
              ruleId: 'OF039',
              severity: 'warning',
              message: `Clip "${clip.id}" has video extension "${ext}". Common formats are .mp4 and .webm.`,
            });
          }
        }
      }
      return results;
    },
  },
];

/**
 * Runs all 30+ static analysis rules against an HTML string or parsed Composition.
 */
export function lintComposition(
  input: string | Composition,
  options?: LintRuleOptions
): LintResult[] {
  let composition: Composition;
  let rawHtml: string | undefined;

  if (typeof input === 'string') {
    rawHtml = input;
    composition = parseComposition(input);
  } else {
    composition = input;
  }

  const allResults: LintResult[] = [];

  for (const rule of LINT_RULES) {
    try {
      const results = rule.check(composition, rawHtml, options);
      allResults.push(...results);
    } catch (err: any) {
      allResults.push({
        ruleId: rule.id,
        severity: 'warning',
        message: `Linter rule ${rule.id} failed to execute: ${err.message}`,
      });
    }
  }

  return allResults;
}
