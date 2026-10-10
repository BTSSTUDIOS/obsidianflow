import readline from 'readline';
import fs from 'fs';
import path from 'path';
import {
  parseComposition,
  lintComposition,
  parseTime,
  formatTimecode,
  TICKS_PER_SECOND,
} from '@obsidianflow/core';
import { captureSingleFrame } from '@obsidianflow/engine';
import { render as renderVideo } from '@obsidianflow/producer';

interface MCPRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: any;
}

interface RenderJob {
  id: string;
  input: string;
  output: string;
  status: 'running' | 'done' | 'failed';
  percent: number;
  error?: string;
  result?: any;
}

const activeJobs = new Map<string, RenderJob>();

const GUIDE_CHAPTERS: Record<string, string> = {
  rules: `# OBSIDIAN FLOW — Agent Rules
1. Always write standard HTML5 & CSS.
2. Animate with CSS Keyframes or GSAP; never use non-deterministic requestAnimationFrame without master clock.
3. Use data-* attributes for timing: data-start, data-duration, data-fps.
4. Validate compositions with lint before rendering.`,

  composition: `# OBSIDIAN FLOW — Composition Authoring
Use root data attributes:
<html data-composition-id="video-1" data-width="1920" data-height="1080" data-fps="30" data-duration="10s">
Each scene is marked with:
<div class="clip" id="scene-1" data-start="0s" data-duration="5s">...</div>`,

  audio: `# OBSIDIAN FLOW — Multi-Track Audio, Ducking & Volume Keyframes
Tracks belong to groups: dialogue, music, sfx, ambience.
- Auto-Ducking:
  <audio src="music.mp3" data-track="music" data-duck="dialogue" data-duck-ratio="0.25"></audio>
  <audio src="voice.mp3" data-track="dialogue" data-start="1s" data-duration="4s"></audio>
- Rubber-band manual volume keyframes:
  <audio src="music.mp3" data-volume-keyframes="0s:1.0, 2s:0.25, 4.5s:0.25, 5s:1.0"></audio>
- EBU R128 loudness normalization (-14 LUFS) is applied automatically by default.`,

  timing: `# OBSIDIAN FLOW — Exact 254B Tick Time Math
Time base runs at 254,016,000,000 integer ticks per second (same as Adobe Premiere Pro).
Divides evenly with zero remainder for:
- 24, 25, 30, 48, 50, 60, 120 fps
- 23.976 fps (24000/1001), 29.97 fps (30000/1001), 59.94 fps (60000/1001)
- 44.1kHz, 48kHz, 96kHz, 192kHz audio sample rates.`,

  transitions: `# OBSIDIAN FLOW — Transitions & SMPTE Wipes
Transitions connect clips:
<of-transition type="fade" data-start="4.5s" data-duration="1s" data-from="#scene-1" data-to="#scene-2"></of-transition>`,

  'smpte-wipes': `# OBSIDIAN FLOW — SMPTE 258M Wipes
Standard broadcast wipes:
<of-transition type="smpte-wipe" code="1" data-softness="15" data-start="3s" data-duration="1s"></of-transition>
Codes:
- 1: Horizontal wipe (left-to-right)
- 2: Vertical wipe (top-to-bottom)
- 21-26: Barn Door / Box wipes
- 101-104: Circle / Iris wipes
- 201-204: Clock / Radial sweeps`,

  linting: `# OBSIDIAN FLOW — Static Linter Rules
Runs 30+ static rules checking:
- Missing dimensions or duration (OF001, OF002)
- Overlapping non-composite clips (OF010)
- Missing dialogue track for ducked audio (OF025)
- Non-deterministic CSS properties (OF030)
- TikTok 9:16 safe zone violations (OF050)`,

  troubleshooting: `# OBSIDIAN FLOW — Troubleshooting
- Chrome not found: pass --browser /path/to/chrome
- Audio not ducking: ensure voiceover track has data-track="dialogue"
- Blank frames: check font loading and stylesheet relative paths`,
};

const WORKFLOW_PROMPTS = [
  {
    name: 'vox-video-essay',
    description: 'Create a Vox-style mixed-media video essay with archival cutouts, animated yellow highlighter, and ducked audio',
    arguments: [
      { name: 'topic', description: 'The subject or story of the video essay', required: true },
      { name: 'duration', description: 'Target duration in seconds (e.g. 15s or 30s)', required: false },
    ],
    template: (args: any) => `You are an expert motion designer and video essayist creating a Vox-style mixed-media composition using OBSIDIAN FLOW.
Topic: ${args?.topic || 'Documentary Story'}
Target Duration: ${args?.duration || '20s'}

Follow these OBSIDIAN FLOW rules:
1. Use a textured paper or dark documentary background.
2. Animate headlines with animated CSS yellow highlight bars (linear-gradient or pseudo-elements).
3. Include pan-and-zoom (Ken Burns effect) on archival images.
4. Add background music with auto-ducking under narration:
   <audio src="music.mp3" data-track="music" data-duck="dialogue" data-duck-ratio="0.2"></audio>
   <audio src="voiceover.mp3" data-track="dialogue" data-start="1s" data-duration="15s"></audio>
5. Use SMPTE 258M wipes or smooth fades between scenes.
6. Run 'obsidianflow lint' to verify 30+ static rules before rendering.`,
  },
  {
    name: 'ad-hook-multiplier',
    description: 'Generate 3 high-converting opening video hooks for TikTok/Reels paid advertising',
    arguments: [
      { name: 'product', description: 'Name and description of the product', required: true },
      { name: 'targetAudience', description: 'Target audience or persona', required: false },
    ],
    template: (args: any) => `You are a performance creative director creating 3 distinct opening hook variations for a paid video ad using OBSIDIAN FLOW.
Product: ${args?.product || 'Product'}
Target Audience: ${args?.targetAudience || 'Consumers'}

Create 3 distinct 3-second hook scenes:
- Hook A (Problem/Agitation): Bold question confronting the pain point.
- Hook B (Curiosity/Secret): "The reason nobody talks about X..."
- Hook C (Direct Benefit/Proof): Immediate visual demonstration.
Ensure text overlays stay within TikTok 9:16 safe zones (keep bottom > 220px, right > 120px).`,
  },
  {
    name: 'saas-product-walkthrough',
    description: 'Create a sleek modern SaaS UI demo with browser frames, cursor clicks, and feature callouts',
    arguments: [
      { name: 'feature', description: 'The SaaS feature to highlight', required: true },
    ],
    template: (args: any) => `You are creating a polished SaaS product launch video using OBSIDIAN FLOW.
Feature: ${args?.feature || 'New Feature'}
Layout: 1920x1080 60fps.
1. Render a sleek dark-mode browser mockup with window dots and subtle box-shadow.
2. Animate floating feature badges with CSS springs and GSAP timelines.
3. Include modern UI click animations and zoom-ins on key metrics.
4. Mix an upbeat electronic background track with sound effects for clicks and UI pops.`,
  },
  {
    name: 'vertical-reel-resizer',
    description: 'Adapt an existing horizontal video composition to 9:16 vertical for TikTok, Reels, and YouTube Shorts',
    arguments: [
      { name: 'inputFile', description: 'Path to horizontal index.html', required: true },
    ],
    template: (args: any) => `You are converting a 16:9 composition to a mobile-first 9:16 vertical video in OBSIDIAN FLOW.
Input File: ${args?.inputFile || 'index.html'}
Rules:
1. Change data-width="1080" and data-height="1920".
2. Stack video elements vertically (Split-screen or blurred video background with centered hero).
3. Check Rule OF050 (Safe Zones): Ensure text and captions are kept out of the bottom 220px and right 120px dead zones.`,
  },
  {
    name: 'project-sorter',
    description: 'Inspect assets directory, classify footage/images and audio stems (dialogue, sfx, ambience, music), and scaffold a structured OBSIDIAN FLOW composition',
    arguments: [
      { name: 'assetsDir', description: 'Directory containing source footage and audio stems', required: false },
    ],
    template: (args: any) => `You are a post-production assistant organizing a project in OBSIDIAN FLOW.
Assets Directory: ${args?.assetsDir || './assets'}
1. Scan the assets directory and classify files into video clips, background music (data-track="music"), sound effects (data-track="sfx"), and dialogue (data-track="dialogue").
2. Build an index.html timeline scaffold laying out clips chronologically.
3. Apply auto-ducking to music tracks under dialogue and add rubber-band keyframes if needed.
4. Run obsidianflow lint to verify track integrity.`,
  },
  {
    name: 'headline-multiplier',
    description: 'Create 5 animated kinetic typography headline variations for marketing A/B tests',
    arguments: [
      { name: 'hookText', description: 'Core value proposition or headline', required: true },
    ],
    template: (args: any) => `You are a motion typography specialist creating 5 kinetic headline variations in OBSIDIAN FLOW.
Headline: ${args?.hookText || 'Transform Your Workflow'}
Generate 5 CSS animation styles:
- Style 1: Staggered word fade & slide-up with custom cubic-bezier ease.
- Style 2: High-energy TikTok bold pop with scale bounce.
- Style 3: Elegant editorial serif with yellow highlight stroke sweep.
- Style 4: Modern minimal typewriter with blinking cursor.
- Style 5: Split-color gradient mask reveal.`,
  },
  {
    name: 'social-ad-localizer',
    description: 'Adapt a video composition for international markets with synchronized subtitles and localized dialogue stems',
    arguments: [
      { name: 'targetLanguage', description: 'Target language code (e.g. es, de, ja, fr)', required: true },
      { name: 'dialogueAudio', description: 'Path to translated dialogue audio stem', required: true },
    ],
    template: (args: any) => `You are localizing an OBSIDIAN FLOW video for international delivery.
Target Language: ${args?.targetLanguage || 'es'}
Translated Audio: ${args?.dialogueAudio || 'dialogue_es.mp3'}
1. Replace or overlay the dialogue track with the localized audio stem.
2. Synchronize animated subtitle cards formatted in the target language.
3. Verify that auto-ducking against the new dialogue track matches the new audio duration.
4. Export with EBU R128 loudness normalization compliant with broadcast standards.`,
  },
];

export async function mcpCommand(options: { debug?: boolean }) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const logDebug = (...args: any[]) => {
    if (options.debug) {
      process.stderr.write(`[OBSIDIAN FLOW MCP] ${args.join(' ')}\n`);
    }
  };

  logDebug('Server started over stdio');

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let req: MCPRequest;
    try {
      req = JSON.parse(trimmed);
    } catch (e) {
      logDebug('Failed to parse JSON:', trimmed);
      return;
    }

    const { id, method, params } = req;

    const respond = (result: any) => {
      if (id !== undefined && id !== null) {
        const resp = { jsonrpc: '2.0', id, result };
        process.stdout.write(JSON.stringify(resp) + '\n');
      }
    };

    const respondError = (code: number, message: string, data?: any) => {
      if (id !== undefined && id !== null) {
        const resp = { jsonrpc: '2.0', id, error: { code, message, data } };
        process.stdout.write(JSON.stringify(resp) + '\n');
      }
    };

    try {
      switch (method) {
        case 'initialize': {
          respond({
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'obsidianflow-mcp',
              version: '0.1.2',
            },
            capabilities: {
              tools: {},
              resources: {},
              prompts: {},
            },
          });
          break;
        }

        case 'notifications/initialized': {
          // Client ACK; no response needed
          break;
        }

        case 'ping': {
          respond({});
          break;
        }

        case 'prompts/list': {
          const prompts = WORKFLOW_PROMPTS.map((p) => ({
            name: p.name,
            description: p.description,
            arguments: p.arguments,
          }));
          respond({ prompts });
          break;
        }

        case 'prompts/get': {
          const promptName = params?.name as string;
          const promptArgs = params?.arguments || {};
          const matched = WORKFLOW_PROMPTS.find((p) => p.name === promptName);
          if (matched) {
            respond({
              description: matched.description,
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: matched.template(promptArgs),
                  },
                },
              ],
            });
          } else {
            respondError(-32602, `Prompt not found: ${promptName}`);
          }
          break;
        }

        case 'resources/list': {
          const resources = Object.keys(GUIDE_CHAPTERS).map((key) => ({
            uri: `obsidianflow://guide/${key}`,
            name: `OBSIDIAN FLOW Guide: ${key.toUpperCase()}`,
            mimeType: 'text/markdown',
            description: `Official guide and playbook chapter for ${key}`,
          }));
          respond({ resources });
          break;
        }

        case 'resources/read': {
          const uri = params?.uri as string;
          if (uri && uri.startsWith('obsidianflow://guide/')) {
            const topic = uri.replace('obsidianflow://guide/', '');
            const content = GUIDE_CHAPTERS[topic] || GUIDE_CHAPTERS['rules'];
            respond({
              contents: [
                {
                  uri,
                  mimeType: 'text/markdown',
                  text: content,
                },
              ],
            });
          } else {
            respondError(-32602, `Unknown resource URI: ${uri}`);
          }
          break;
        }

        case 'tools/list': {
          respond({
            tools: [
              {
                name: 'get_guide',
                description: 'Read a chapter from the OBSIDIAN FLOW composition guide and agent playbook',
                readOnlyHint: true,
                inputSchema: {
                  type: 'object',
                  properties: {
                    topic: {
                      type: 'string',
                      description: 'Guide chapter topic',
                      enum: [
                        'rules',
                        'composition',
                        'audio',
                        'timing',
                        'transitions',
                        'smpte-wipes',
                        'linting',
                        'troubleshooting',
                      ],
                    },
                  },
                  required: ['topic'],
                },
              },
              {
                name: 'render_frame',
                description: 'Render a single deterministic high-resolution PNG frame at a specific timestamp or frame index (<300ms) for instant visual inspection',
                readOnlyHint: true,
                inputSchema: {
                  type: 'object',
                  properties: {
                    input: {
                      type: 'string',
                      description: 'Path to composition index.html file',
                    },
                    time: {
                      type: 'string',
                      description: 'Timestamp to capture (e.g. "2.5s", "00:02.500", or "60f")',
                    },
                    width: {
                      type: 'number',
                      description: 'Viewport width (defaults to composition width or 1920)',
                    },
                    height: {
                      type: 'number',
                      description: 'Viewport height (defaults to composition height or 1080)',
                    },
                  },
                  required: ['input'],
                },
              },
              {
                name: 'extract_frame',
                description: 'Extract the first or last frame of a composition to use as visual continuity anchors for AI video models',
                readOnlyHint: true,
                inputSchema: {
                  type: 'object',
                  properties: {
                    input: {
                      type: 'string',
                      description: 'Path to composition index.html file',
                    },
                    at: {
                      type: 'string',
                      enum: ['first', 'last'],
                      description: 'Which anchor frame to extract',
                    },
                  },
                  required: ['input', 'at'],
                },
              },
              {
                name: 'inspect_timeline',
                description: 'Parse composition HTML and return complete structured JSON manifest of clips, tracks, durations, audio stems, and transitions',
                readOnlyHint: true,
                inputSchema: {
                  type: 'object',
                  properties: {
                    input: {
                      type: 'string',
                      description: 'Path to composition index.html file',
                    },
                  },
                  required: ['input'],
                },
              },
              {
                name: 'lint_composition',
                description: 'Run 30+ static analysis rules for timing, determinism, media paths, ducking, and SMPTE transitions',
                readOnlyHint: true,
                inputSchema: {
                  type: 'object',
                  properties: {
                    input: {
                      type: 'string',
                      description: 'Path to composition index.html file',
                    },
                    strictAi: {
                      type: 'boolean',
                      description: 'Whether to enforce strict AI model attribution',
                    },
                  },
                  required: ['input'],
                },
              },
              {
                name: 'render_video',
                description: 'Render a composition to a deterministic MP4 video in the background and return a tracking jobId',
                inputSchema: {
                  type: 'object',
                  properties: {
                    input: {
                      type: 'string',
                      description: 'Path to composition index.html file',
                    },
                    output: {
                      type: 'string',
                      description: 'Destination path for rendered video (e.g. output.mp4)',
                    },
                    fps: {
                      type: 'number',
                      description: 'Override composition frame rate',
                    },
                    quality: {
                      type: 'string',
                      enum: ['draft', 'production', 'cinema'],
                      description: 'Quality preset',
                    },
                  },
                  required: ['input', 'output'],
                },
              },
              {
                name: 'get_job_status',
                description: 'Check progress status or retrieve output of an ongoing background video render job',
                readOnlyHint: true,
                inputSchema: {
                  type: 'object',
                  properties: {
                    jobId: {
                      type: 'string',
                      description: 'Job identifier returned by render_video',
                    },
                  },
                  required: ['jobId'],
                },
              },
            ],
          });
          break;
        }

        case 'tools/call': {
          const toolName = params?.name as string;
          const args = params?.arguments || {};

          switch (toolName) {
            case 'get_guide': {
              const topic = String(args.topic || 'rules');
              const chapter = GUIDE_CHAPTERS[topic] || GUIDE_CHAPTERS['rules'];
              respond({
                content: [
                  {
                    type: 'text',
                    text: chapter,
                  },
                ],
              });
              break;
            }

            case 'inspect_timeline': {
              const inputPath = path.resolve(process.cwd(), args.input);
              if (!fs.existsSync(inputPath)) {
                respondError(-32602, `Composition file not found: ${inputPath}`);
                return;
              }
              const html = fs.readFileSync(inputPath, 'utf-8');
              const comp = parseComposition(html);
              respond({
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(comp, null, 2),
                  },
                ],
              });
              break;
            }

            case 'lint_composition': {
              const inputPath = path.resolve(process.cwd(), args.input);
              if (!fs.existsSync(inputPath)) {
                respondError(-32602, `Composition file not found: ${inputPath}`);
                return;
              }
              const html = fs.readFileSync(inputPath, 'utf-8');
              const lintResults = lintComposition(html, {
                basePath: path.dirname(inputPath),
                strictAiAttribution: Boolean(args.strictAi),
              });
              respond({
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(lintResults, null, 2),
                  },
                ],
              });
              break;
            }

            case 'render_frame': {
              const inputPath = path.resolve(process.cwd(), args.input);
              if (!fs.existsSync(inputPath)) {
                respondError(-32602, `Composition file not found: ${inputPath}`);
                return;
              }
              const html = fs.readFileSync(inputPath, 'utf-8');
              const comp = parseComposition(html);

              let timeInSec = 0;
              if (args.time) {
                timeInSec = parseTime(args.time, comp.fps);
              }

              const buffer = await captureSingleFrame({
                compositionPath: inputPath,
                timeInSeconds: timeInSec,
                width: args.width || comp.width || 1920,
                height: args.height || comp.height || 1080,
              });

              const base64 = buffer.toString('base64');
              respond({
                content: [
                  {
                    type: 'image',
                    data: base64,
                    mimeType: 'image/png',
                  },
                  {
                    type: 'text',
                    text: `Rendered frame at ${timeInSec.toFixed(3)}s (${formatTimecode(timeInSec, comp.fps)}) [${comp.width}x${comp.height}]`,
                  },
                ],
              });
              break;
            }

            case 'extract_frame': {
              const inputPath = path.resolve(process.cwd(), args.input);
              if (!fs.existsSync(inputPath)) {
                respondError(-32602, `Composition file not found: ${inputPath}`);
                return;
              }
              const html = fs.readFileSync(inputPath, 'utf-8');
              const comp = parseComposition(html);

              const timeInSec = args.at === 'last' ? Math.max(0, comp.duration - 0.033) : 0;

              const buffer = await captureSingleFrame({
                compositionPath: inputPath,
                timeInSeconds: timeInSec,
                width: comp.width || 1920,
                height: comp.height || 1080,
              });

              const base64 = buffer.toString('base64');
              respond({
                content: [
                  {
                    type: 'image',
                    data: base64,
                    mimeType: 'image/png',
                  },
                  {
                    type: 'text',
                    text: `Extracted ${args.at} anchor frame at ${timeInSec.toFixed(3)}s`,
                  },
                ],
              });
              break;
            }

            case 'render_video': {
              const inputPath = path.resolve(process.cwd(), args.input);
              const outputPath = path.resolve(process.cwd(), args.output);
              const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

              const job: RenderJob = {
                id: jobId,
                input: inputPath,
                output: outputPath,
                status: 'running',
                percent: 0,
              };
              activeJobs.set(jobId, job);

              // Launch render asynchronously in background
              renderVideo({
                input: inputPath,
                output: outputPath,
                fps: args.fps,
                quality: args.quality,
                onProgress: (prog: any) => {
                  job.percent = Math.round(prog.percent);
                },
              })
                .then((result: any) => {
                  job.status = 'done';
                  job.percent = 100;
                  job.result = result;
                })
                .catch((err: any) => {
                  job.status = 'failed';
                  job.error = err.message;
                });

              respond({
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        jobId,
                        status: 'running',
                        message: `Render started for ${args.input} -> ${args.output}. Call get_job_status with jobId to check completion.`,
                      },
                      null,
                      2
                    ),
                  },
                ],
              });
              break;
            }

            case 'get_job_status': {
              const jobId = String(args.jobId);
              const job = activeJobs.get(jobId);
              if (!job) {
                respondError(-32602, `Render job not found: ${jobId}`);
                return;
              }
              respond({
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(job, null, 2),
                  },
                ],
              });
              break;
            }

            default:
              respondError(-32601, `Method or tool not found: ${toolName}`);
              break;
          }
          break;
        }

        default:
          respondError(-32601, `Unknown method: ${method}`);
          break;
      }
    } catch (err: any) {
      logDebug('Error handling request:', err);
      respondError(-32000, `Internal error: ${err.message}`);
    }
  });

  process.on('SIGINT', () => {
    rl.close();
    process.exit(0);
  });
}
