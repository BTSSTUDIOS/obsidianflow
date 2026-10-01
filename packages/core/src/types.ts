/**
 * Core type definitions for ObsidianFlow compositions, timelines, and linter.
 */

export interface Composition {
  id: string;
  width: number;
  height: number;
  fps: number;
  duration: number; // in seconds
  backgroundColor?: string;
  variables: CompositionVariable[];
  clips: Clip[];
  audioGroups: AudioGroup[];
  transitions: TransitionDef[];
}

export interface CompositionVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'url' | 'color';
  default?: string | number | boolean;
  description?: string;
}

export interface Clip {
  id: string;
  track: string;
  startTime: number;     // seconds on timeline
  duration: number;      // seconds
  elementSelector: string; // CSS selector or element identifier
  media?: MediaSource;
  children: Clip[];      // nested elements (overlays, titles, subtitles)
  styles?: Record<string, string>;
  className?: string;
}

export interface MediaSource {
  type: 'video' | 'audio' | 'image';
  src: string;
  mediaStart: number;     // trim point offset in source (seconds)
  duration?: number;      // duration if specified
  volume?: number;        // audio volume level [0.0 - 1.0]
  loop?: boolean;
  generatedBy?: string;   // AI model name (e.g., 'veo-3.1', 'kling-3.0', 'elevenlabs')
  generationId?: string;  // links to Project Brain / generation record
}

export interface AudioGroup {
  id: string;
  fxChain: string[];      // e.g. ['compression', 'reverb', 'eq']
  tracks: AudioTrack[];
}

export interface AudioTrack {
  id: string;
  src: string;
  track: 'music' | 'sfx' | 'dialogue' | string;
  startTime: number;      // seconds
  duration: number;       // seconds
  volume: number;         // 0.0 to 1.0
  ducking?: string;       // track name that triggers ducking
  duckingAmount?: number; // duck attenuation (e.g. 0.3)
  fadeIn?: number;        // fade in duration in seconds
  fadeOut?: number;       // fade out duration in seconds
  generatedBy?: string;   // AI model attribution
  generationId?: string;  // Generation tracking ID
}

export interface TransitionDef {
  type: string;           // 'lava-flow', 'obsidian-shatter', 'fade', 'wipe', etc.
  startTime: number;      // timeline seconds
  duration: number;       // seconds
  from?: string;          // clip ID or selector
  to?: string;            // clip ID or selector
  params?: Record<string, string | number | boolean>;
}

/**
 * Universal frame adapter interface.
 * All seekable animation engines (GSAP, WAAPI, Native) implement this.
 */
export interface FrameAdapter {
  name: string;
  seek(timeInSeconds: number): void | Promise<void>;
  getDuration(): number;
  destroy?(): void;
}

export type TimelineRegistry = Record<string, FrameAdapter | any>;

export interface ObsidianFlowGlobalRuntime {
  version: string;
  compositions: Record<string, Composition>;
  timelines: TimelineRegistry;
  currentTime: number;
  seek(timeInSeconds: number): Promise<void>;
  registerTimeline(id: string, adapter: FrameAdapter): void;
  registerComposition(comp: Composition): void;
}

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintResult {
  ruleId: string;
  severity: LintSeverity;
  message: string;
  element?: string;
  line?: number;
  fixSuggestion?: string;
}

export interface LintRule {
  id: string;
  name: string;
  category: 'timing' | 'determinism' | 'media' | 'structure' | 'ai-metadata';
  severity: LintSeverity;
  message: string;
  check: (composition: Composition, rawHtml?: string, options?: LintRuleOptions) => LintResult[];
}

export interface LintRuleOptions {
  basePath?: string;
  strictAiAttribution?: boolean;
}

export interface RenderOptions {
  input: string;                  // path to index.html
  output: string;                 // path to output.mp4
  format?: 'mp4' | 'webm' | 'mov';
  codec?: 'h264' | 'prores' | 'vp9' | 'av1';
  bitrate?: string;               // e.g. '10M'
  fps?: number;
  quality?: 'draft' | 'production' | 'cinema';
  concurrency?: number;
  browserExecutablePath?: string;
  onProgress?: (progress: RenderProgress) => void;
  json?: boolean;
}

export interface RenderProgress {
  phase: 'parsing' | 'linting' | 'capturing' | 'encoding' | 'mixing' | 'complete';
  percent: number;
  currentFrame?: number;
  totalFrames?: number;
  fps?: number;
  elapsedMs?: number;
  message?: string;
}

export interface RenderResult {
  output: string;
  duration: number;
  frames: number;
  fps: number;
  width: number;
  height: number;
  renderTime: number; // ms
  size: number;       // bytes
  codec: string;
}

export interface CaptureOptions {
  compositionPath: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  browserExecutablePath?: string;
  onFrame: (frameData: Buffer, frameIndex: number, totalFrames: number) => Promise<void>;
  onProgress?: (percent: number, currentFrame: number, totalFrames: number) => void;
}
