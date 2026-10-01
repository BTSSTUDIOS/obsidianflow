import { JSDOM } from 'jsdom';
import type {
  Composition,
  Clip,
  MediaSource,
  AudioGroup,
  AudioTrack,
  TransitionDef,
  CompositionVariable,
} from './types.js';
import { parseTime } from './time.js';

/**
 * Parses an HTML string (or DOM document) into an ObsidianFlow Composition manifest.
 */
export function parseComposition(input: string | any): Composition {
  let doc: any;

  if (typeof input === 'string') {
    const dom = new JSDOM(input, { runScripts: 'outside-only' });
    doc = dom.window.document;
  } else if (input && input.documentElement) {
    doc = input;
  } else if (typeof document !== 'undefined') {
    doc = document;
  } else {
    throw new Error('Invalid input to parseComposition: expected HTML string or Document');
  }

  const htmlEl = doc.documentElement;
  const bodyEl = doc.body || htmlEl;

  // Attributes can be on <html>, <body>, or a container with data-composition-id
  const rootEl =
    htmlEl.hasAttribute('data-composition-id') || htmlEl.hasAttribute('data-duration')
      ? htmlEl
      : bodyEl.querySelector('[data-composition-id]') || bodyEl;

  const id =
    rootEl.getAttribute('data-composition-id') ||
    htmlEl.getAttribute('data-composition-id') ||
    'composition-01';

  const width = parseInt(
    rootEl.getAttribute('data-width') || htmlEl.getAttribute('data-width') || '1920',
    10
  );
  const height = parseInt(
    rootEl.getAttribute('data-height') || htmlEl.getAttribute('data-height') || '1080',
    10
  );
  const fps = parseInt(
    rootEl.getAttribute('data-fps') || htmlEl.getAttribute('data-fps') || '30',
    10
  );

  const durationAttr =
    rootEl.getAttribute('data-duration') || htmlEl.getAttribute('data-duration') || '10s';
  const duration = parseTime(durationAttr, fps);

  const backgroundColor =
    rootEl.getAttribute('data-background') ||
    htmlEl.getAttribute('data-background') ||
    rootEl.style?.backgroundColor ||
    undefined;

  // Parse variables
  let variables: CompositionVariable[] = [];
  const rawVars =
    rootEl.getAttribute('data-composition-variables') ||
    htmlEl.getAttribute('data-composition-variables');
  if (rawVars) {
    try {
      variables = JSON.parse(rawVars);
    } catch {
      variables = [];
    }
  }

  const clips = parseClips(bodyEl, fps);
  const audioGroups = parseAudioGroups(bodyEl, fps);
  const transitions = parseTransitions(bodyEl, fps);

  return {
    id,
    width,
    height,
    fps,
    duration,
    backgroundColor,
    variables,
    clips,
    audioGroups,
    transitions,
  };
}

/**
 * Parses all .clip elements in the document
 */
function parseClips(container: any, fps: number): Clip[] {
  const clipElements = Array.from(container.querySelectorAll('.clip')) as any[];
  const rootClips: Clip[] = [];

  clipElements.forEach((el, index) => {
    // Only process top-level clips first (not children of another .clip)
    const parentClip = el.parentElement ? el.parentElement.closest('.clip') : null;
    if (parentClip) return;

    rootClips.push(parseSingleClip(el, index, fps));
  });

  return rootClips;
}

function parseSingleClip(el: any, index: number, fps: number): Clip {
  const id = el.id || `clip-${index + 1}`;
  const track = el.getAttribute('data-track') || 'video-1';
  const startTime = parseTime(el.getAttribute('data-start') || '0s', fps);
  const duration = parseTime(el.getAttribute('data-duration') || '5s', fps);
  const selector = el.id ? `#${el.id}` : `.clip:nth-of-type(${index + 1})`;

  const media = extractMedia(el, fps);

  // Parse nested child clips
  const childClipElements = Array.from(el.querySelectorAll('.clip')) as any[];
  const children = childClipElements
    .filter((child) => child.parentElement && child.parentElement.closest('.clip') === el)
    .map((child, childIdx) => parseSingleClip(child, childIdx, fps));

  return {
    id,
    track,
    startTime,
    duration,
    elementSelector: selector,
    media,
    children,
    className: el.className,
  };
}

function extractMedia(el: any, fps: number): MediaSource | undefined {
  const videoEl = el.querySelector('video');
  if (videoEl) {
    return {
      type: 'video',
      src: videoEl.getAttribute('src') || '',
      mediaStart: parseTime(videoEl.getAttribute('data-media-start') || '0s', fps),
      volume: videoEl.hasAttribute('data-volume')
        ? parseFloat(videoEl.getAttribute('data-volume')!)
        : 1.0,
      generatedBy: videoEl.getAttribute('data-generated-by') || undefined,
      generationId: videoEl.getAttribute('data-generation-id') || undefined,
      loop: videoEl.hasAttribute('loop'),
    };
  }

  const imgEl = el.querySelector('img');
  if (imgEl) {
    return {
      type: 'image',
      src: imgEl.getAttribute('src') || '',
      mediaStart: 0,
      generatedBy: imgEl.getAttribute('data-generated-by') || undefined,
      generationId: imgEl.getAttribute('data-generation-id') || undefined,
    };
  }

  const audioEl = el.querySelector('audio');
  if (audioEl) {
    return {
      type: 'audio',
      src: audioEl.getAttribute('src') || '',
      mediaStart: parseTime(audioEl.getAttribute('data-media-start') || '0s', fps),
      volume: audioEl.hasAttribute('data-volume')
        ? parseFloat(audioEl.getAttribute('data-volume')!)
        : 1.0,
      generatedBy: audioEl.getAttribute('data-generated-by') || undefined,
      generationId: audioEl.getAttribute('data-generation-id') || undefined,
    };
  }

  return undefined;
}

/**
 * Parses <of-audio-group> and standalone <audio> tags
 */
function parseAudioGroups(container: any, fps: number): AudioGroup[] {
  const groups: AudioGroup[] = [];
  const groupElements = Array.from(container.querySelectorAll('of-audio-group')) as any[];

  groupElements.forEach((groupEl, gIndex) => {
    const groupId = groupEl.id || `audio-group-${gIndex + 1}`;
    const rawFx = groupEl.getAttribute('data-fx-chain') || '';
    const fxChain = rawFx
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const audioTags = Array.from(groupEl.querySelectorAll('audio')) as any[];
    const tracks: AudioTrack[] = audioTags.map((aEl, tIndex) =>
      parseAudioTrack(aEl, tIndex, fps)
    );

    groups.push({
      id: groupId,
      fxChain,
      tracks,
    });
  });

  // Also collect standalone audio elements outside of <of-audio-group>
  const standaloneAudio = Array.from(container.querySelectorAll('audio')) as any[];
  const unhandledAudio = standaloneAudio.filter(
    (a) => !a.closest('of-audio-group') && !a.closest('.clip')
  );

  if (unhandledAudio.length > 0) {
    const standaloneTracks = unhandledAudio.map((aEl, tIndex) =>
      parseAudioTrack(aEl, tIndex, fps)
    );
    groups.push({
      id: 'default-audio-group',
      fxChain: [],
      tracks: standaloneTracks,
    });
  }

  return groups;
}

function parseAudioTrack(aEl: any, index: number, fps: number): AudioTrack {
  const id = aEl.id || `audio-${index + 1}`;
  const track = aEl.getAttribute('data-track') || 'music';
  const startTime = parseTime(aEl.getAttribute('data-start') || '0s', fps);
  const duration = parseTime(aEl.getAttribute('data-duration') || '10s', fps);
  const volume = aEl.hasAttribute('data-volume')
    ? parseFloat(aEl.getAttribute('data-volume')!)
    : 1.0;
  const ducking = aEl.getAttribute('data-ducking') || undefined;
  const duckingAmount = aEl.hasAttribute('data-ducking-amount')
    ? parseFloat(aEl.getAttribute('data-ducking-amount')!)
    : undefined;
  const fadeIn = aEl.hasAttribute('data-fade-in')
    ? parseTime(aEl.getAttribute('data-fade-in'), fps)
    : undefined;
  const fadeOut = aEl.hasAttribute('data-fade-out')
    ? parseTime(aEl.getAttribute('data-fade-out'), fps)
    : undefined;

  return {
    id,
    src: aEl.getAttribute('src') || '',
    track,
    startTime,
    duration,
    volume: isNaN(volume) ? 1.0 : Math.max(0, Math.min(1, volume)),
    ducking,
    duckingAmount,
    fadeIn,
    fadeOut,
    generatedBy: aEl.getAttribute('data-generated-by') || undefined,
    generationId: aEl.getAttribute('data-generation-id') || undefined,
  };
}

/**
 * Parses <of-transition> elements
 */
function parseTransitions(container: any, fps: number): TransitionDef[] {
  const transitionEls = Array.from(container.querySelectorAll('of-transition')) as any[];

  return transitionEls.map((tEl) => {
    const type = tEl.getAttribute('type') || 'fade';
    const startTime = parseTime(tEl.getAttribute('data-start') || '0s', fps);
    const duration = parseTime(tEl.getAttribute('data-duration') || '1s', fps);
    const from = tEl.getAttribute('data-from') || undefined;
    const to = tEl.getAttribute('data-to') || undefined;

    // Extract any extra data-param-* attributes
    const params: Record<string, any> = {};
    for (const attr of Array.from(tEl.attributes) as any[]) {
      if (attr.name.startsWith('data-param-')) {
        const key = attr.name.replace('data-param-', '');
        params[key] = attr.value;
      }
    }

    return {
      type,
      startTime,
      duration,
      from,
      to,
      params: Object.keys(params).length > 0 ? params : undefined,
    };
  });
}
