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
              name: 'obsidianflow',
              version: '0.1.2',
            },
            capabilities: {
              tools: {},
              resources: {},
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
