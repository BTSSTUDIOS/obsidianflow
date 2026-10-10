<p align="center">
  <br />
  <img src="./assets/obsidianflow-logo.svg" width="100" alt="OBSIDIAN FLOW Logo" />
  <h1 align="center">OBSIDIAN FLOW MCP</h1>
  <p align="center">
    <strong>The Official Video Production MCP Server &amp; Deterministic Cinema Engine</strong><br />
    <em>Real-time frame vision (&lt;300ms), timeline inspection, broadcast audio ducking (EBU R128), and MP4 rendering from HTML &amp; CSS for Claude, Cursor, and AI agents.</em><br />
    <sub>Forged in volcanic fire. Inspired by Remotion and HyperFrames. Built for AI agents. Owned by you.</sub>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/obsidianflow"><img src="https://img.shields.io/npm/v/obsidianflow?style=flat&color=f97316&label=npm" alt="npm version" /></a>
  <a href="https://github.com/btsstudios/obsidianflow/actions/workflows/ci.yml"><img src="https://github.com/btsstudios/obsidianflow/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
  <a href="https://github.com/btsstudios/obsidianflow/releases"><img src="https://img.shields.io/badge/release-v0.1.2-22c55e?style=flat" alt="release" /></a>
  <a href="https://github.com/btsstudios/obsidianflow/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-3b82f6?style=flat" alt="license" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-22c55e?style=flat&logo=node.js&logoColor=white" alt="node version" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
</p>
<p align="center">
  <a href="#-obsidian-flow-mcp-server"><img src="https://img.shields.io/badge/MCP-Official%20Video%20Server-8b5cf6?style=flat&logo=anthropic&logoColor=white" alt="MCP Server" /></a>
  <img src="https://img.shields.io/badge/timebase-254B%20ticks%2Fs-blue?style=flat" alt="254B Tick Timebase" />
  <img src="https://img.shields.io/badge/loudness-EBU_R128_%2D14LUFS-22c55e?style=flat" alt="EBU R128 Loudness" />
  <img src="https://img.shields.io/badge/transitions-SMPTE%20258M-orange?style=flat" alt="SMPTE Wipes" />
  <img src="https://img.shields.io/badge/engine-Headless%20Chrome%20%2B%20FFmpeg-red?style=flat" alt="Chrome and FFmpeg" />
</p>
<p align="center">
  <a href="https://discord.gg/dgwcQrmqF"><img src="https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="#-install-ai-agent-skills"><img src="https://img.shields.io/badge/Skills-Agent%20Native-f97316?style=flat&logo=openai&logoColor=white" alt="Install Skills" /></a>
  <img src="https://img.shields.io/badge/status-young%20and%20moving%20fast-7952d2?style=flat" alt="Status" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat" alt="PRs Welcome" />
  <a href="https://github.com/btsstudios/obsidianflow"><img src="https://img.shields.io/github/stars/btsstudios/obsidianflow?style=flat&color=yellow" alt="GitHub Stars" /></a>
</p>

<p align="center">
  <strong>Write HTML. Render video. Built for the agent era.</strong><br />
  <em>Forged in volcanic fire. Inspired by Remotion and HyperFrames. Built for AI agents. Owned by you.</em>
</p>

<p align="center">
  <code>$ npx obsidianflow mcp</code> &nbsp;•&nbsp; <code>$ npx obsidianflow mcp install</code> &nbsp;•&nbsp; <code>$ npx skills add btsstudios/obsidianflow --full-depth</code>
</p>

<p align="center">
  <a href="#-obsidian-flow-mcp-server">🔌 Connect MCP</a> •
  <a href="#-creative-workflow-prompts">🎬 Workflow Prompts</a> •
  <a href="#-teach-your-ai-agent-to-drive-obsidian-flow-one-shot-prompt">🤖 Drive with Agents</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-cli-commands">CLI</a> •
  <a href="#-static-linter-rules-of001---of039">Linter</a> •
  <a href="CHANGELOG.md">Changelog</a> •
  <a href="https://discord.gg/dgwcQrmqF">Discord</a>
</p>

> 🔌 **The First Full-Stack Video Production MCP for AI Agents**  
> Connect **OBSIDIAN FLOW MCP** to **Claude**, **Cursor**, **ChatGPT**, or **Windsurf**. Your agent gains instant **frame vision** (`render_frame` in <300ms), structured **timeline inspection**, automated **dialogue audio ducking**, a **254-billion tick timebase**, and deterministic **MP4 rendering** directly from HTML/CSS code.

<p align="center">
  <img src="./assets/showcase.gif" width="100%" alt="OBSIDIAN FLOW Showcase Demo" style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.7);" />
</p>

---

## 🔌 OBSIDIAN FLOW MCP Server

Connect **OBSIDIAN FLOW MCP** directly to your AI agent (**Cursor**, **Claude Desktop**, **Claude Code**, **Antigravity**, **Windsurf**, **ChatGPT**). The built-in MCP server gives agents instant frame vision (`render_frame`), timeline inspection, and playbook resources over `stdio`:

### Connect in Cursor (`~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "obsidianflow": {
      "command": "npx",
      "args": ["-y", "obsidianflow", "mcp"]
    }
  }
}
```

### Connect in Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "obsidianflow": {
      "command": "npx",
      "args": ["-y", "obsidianflow", "mcp"]
    }
  }
}
```

### Connect in Claude Code (CLI):
```bash
claude mcp add obsidianflow npx -y obsidianflow mcp
```

### Connect in ChatGPT (Developer Mode):
1. Enable **Developer Mode** in **Settings → Security**.
2. Open **Plugins / Connectors** → **Create MCP App**.
3. Name it **OBSIDIAN FLOW MCP** and connect via local stdio command `npx -y obsidianflow mcp`.

> 🚀 **OBSIDIAN Studio (`obsidian.video`)**: The upcoming web-native NLE is powered by the OBSIDIAN FLOW rendering engine under the hood. Any AI connector can seamlessly bridge local compositions into studio timelines.

### Tools exposed to AI agents:
| Tool | Access | Description |
| :--- | :---: | :--- |
| `render_frame` | Read-only | Captures a single crisp PNG frame in &lt;300ms so the AI can inspect typography and layout in chat |
| `extract_frame` | Read-only | Extracts first or last frame as a visual anchor for generative video models (Veo, Kling, Runway) |
| `inspect_timeline` | Read-only | Returns structured JSON manifest of all clips, tracks, durations, and audio stems |
| `lint_composition` | Read-only | Runs 30+ static deterministic rules for timing, safe zones, and ducking |
| `get_guide` | Read-only | Retrieves official playbook chapters (`rules`, `composition`, `audio`, `smpte-wipes`) |
| `render_video` | Action | Initiates background MP4 rendering with async job tracking |
| `get_job_status` | Read-only | Polls rendering progress and retrieves finished video file path |

---

## 🎬 Creative Workflow Prompts

Exposed via the standard MCP `prompts/list` & `prompts/get` protocol (type `/` in Claude or ChatGPT to invoke):

| Prompt | Category | Description |
| :--- | :--- | :--- |
| `/vox-video-essay` | Editorial / Documentary | Generates a Vox-style explainer with archival image zoom, yellow highlighter text, and ducked audio |
| `/ad-hook-multiplier` | Performance Ads | Generates 3 distinct 3-second opening hook variations (A/B testing) for TikTok & Reels |
| `/vertical-reel-resizer` | Social Media | Reframes 16:9 compositions to 9:16 vertical video with automatic safe zone margins |
| `/saas-product-walkthrough` | Motion Design | Generates a dark-mode browser mockup with simulated mouse clicks and animated feature badges |
| `/project-sorter` | Post-Production | Scans assets directory, classifies stems (VO, SFX, AMB, MX), and scaffolds clean timeline |
| `/headline-multiplier` | Typography | Generates 5 animated kinetic typography styles for marketing copy tests |
| `/social-ad-localizer` | Localization | Re-times subtitles and dialogue stems for international markets with broadcast loudness |

---

## 🤖 Teach Your AI Agent to Drive OBSIDIAN FLOW (One-Shot Prompt)

Copy and paste this instruction directly into your AI coding assistant (**Claude Code**, **Cursor**, **Windsurf**, **ChatGPT**, or **Antigravity**):

```markdown
Help me install OBSIDIAN FLOW from BTS Studios (https://github.com/btsstudios/obsidianflow) and teach yourself to drive it:
1. First, install the CLI or skills: run `npm install -g obsidianflow` or load the official agent skills via `npx skills add btsstudios/obsidianflow --full-depth`.
2. OBSIDIAN FLOW comes with a built-in Model Context Protocol server (its `obsidianflow mcp` command). Connect it to your MCP tools so you have direct frame vision, timeline inspection, and broadcast linter tools.
3. Every repo has an AGENTS.md and built-in playbook chapters (access them via `obsidianflow://guide/rules` or `npx obsidianflow guide`). Read them and save what matters as a reusable rule.
4. Finish with one small test: scaffold a 5-second sample composition (`npx obsidianflow init test-video --template blank`), add background music with dialogue auto-ducking, run `npx obsidianflow lint`, and render a single frame with `render_frame` to verify visual layout.
5. If a step doesn't work on my system, tell me and do the closest thing that does.
```

---

## 📦 Install AI Agent Skills

Let AI agents compose deterministic videos by writing code. Install the official **OBSIDIAN FLOW** skills into your AI coding assistant (**Claude Code**, **Cursor**, **Antigravity**, **Windsurf**, **GitHub Copilot**, **Cline**, **OpenHands**) with one command:

```bash
npx skills add btsstudios/obsidianflow --full-depth
```

Or install directly via the OBSIDIAN FLOW CLI:

```bash
npx obsidianflow skill install
```

| Skill | Description |
| :--- | :--- |
| **`obsidianflow`** | Master skill for autonomous video generation, HTML/CSS layout, deterministic animations & render commands |
| **`obsidianflow-core`** | Composition AST, timing attributes (`data-*`), seekable master clocks, and frame adapters |
| **`obsidianflow-audio`** | Multi-track audio mixing, FFmpeg sidechain dialogue ducking, and volume curves |

---

## 🌟 Video Creation in the Agent Era

OBSIDIAN FLOW is an open-source, AI-native framework for turning standard web technologies (HTML, CSS, SVG, WebGL, animations) into deterministic, frame-accurate MP4 videos.

- **Make videos agentically**: LLMs author HTML and CSS natively. AI coding agents (Claude, Cursor, Antigravity) script, animate, and generate complete video productions using built-in agent skills.
- **Render deterministically**: Frame-by-frame timeline seeking via headless Chrome and direct FFmpeg `image2pipe` streaming. No dropped frames, no wall-clock timing jitter.
- **Compose with standard web tech**: Use CSS keyframes, SVG, WebGL, and seekable timelines (Native, GSAP, WAAPI) with simple HTML `data-*` attributes.
- **Validate before rendering**: Over 30 static analysis checks catch timing overflows, non-deterministic timers, and missing media before invoking the renderer.

---

## ⚔️ Why OBSIDIAN FLOW?

A direct comparison of how **OBSIDIAN FLOW** improves upon existing programmatic video rendering solutions:

| Capability | **OBSIDIAN FLOW** 🌋 | **Remotion** ⚛️ | **HeyGen HyperFrames** ⚡ |
| :--- | :--- | :--- | :--- |
| **Composition Language** | **Native HTML5 + `data-*`**<br>*(Zero framework lock-in)* | React JSX only<br>*(Requires learning custom components)* | HTML + GSAP timeline |
| **AI Agent Native** | **100% Native**<br>*(LLMs write raw HTML & CSS naturally)* | Complex<br>*(LLM must learn Remotion React hooks)* | Script + GSAP timeline |
| **Rendering Core** | **Headless Chrome + direct FFmpeg pipe**<br>*(Deterministic frame-by-frame streaming)* | Headless Chrome + React frame step | Headless Chrome + FFmpeg |
| **Animation Engines** | **Multi-Adapter**:<br>• Native Keyframes (0 deps)<br>• GSAP Timeline<br>• Web Animations API (WAAPI)<br>• Three.js | React state & `useCurrentFrame()` only | GSAP timeline only |
| **Audio Mixing & Ducking** | **Built-in FFmpeg sidechain ducking**<br>*(Auto-ducks music under dialogue)* | Manual `<Audio>` components<br>*(No built-in ducking)* | Audio filtergraph |
| **Pre-Render Linter** | **30+ Static Checks (OF001–OF039)**<br>*(Timing, determinism, media, codecs)* | None built-in<br>*(Errors caught during render)* | Static checks |
| **Agent CLI Interop** | **Full `--json` on all commands**<br>*(Machine-readable for coding agents)* | Human-focused CLI | Developer CLI |
| **Open Source License** | **Apache 2.0**<br>*(100% Free for commercial & enterprise use)* | **Restrictive Company License**<br>*(Paid license required for teams > 3)* | Apache 2.0 |
| **Collaboration Ready** | **Firestore Real-time CRDT Sync**<br>*(Built for multiplayer video editing)* | Local dev preview | Local audit player |

---

## 🏛 Monorepo Architecture

```
/home/b1337/Desktop/OBSIDIAN_FLOW/
├── packages/
│   ├── core/                    # @obsidianflow/core
│   │   ├── types.ts             # Composition, Clip, Track, FrameAdapter types
│   │   ├── parser.ts            # HTML AST parser with jsdom
│   │   ├── linter.ts            # 30+ static checks (OF001-OF039)
│   │   ├── runtime.ts           # Browser runtime & window.__obsidianflow clock
│   │   ├── time.ts              # Timecode & string parsing
│   │   └── adapters/            # Seekable frame adapters (Native, GSAP, WAAPI)
│   │
│   ├── engine/                  # @obsidianflow/engine
│   │   ├── browser.ts           # Headless Chrome launcher & lifecycle
│   │   └── capture.ts           # Deterministic frame-by-frame capture loop
│   │
│   ├── producer/                # @obsidianflow/producer
│   │   ├── pipeline.ts          # Orchestrated render pipeline
│   │   ├── encoder.ts           # FFmpeg video encoding via stdin image2pipe
│   │   └── audio-mixer.ts       # Multi-track audio mixer with ducking
│   │
│   └── cli/                     # obsidianflow CLI
│       ├── cli.ts               # Commander entry point
│       └── commands/            # init, lint, check, render
│
├── templates/
│   ├── blank/                   # Minimal 1080p 10s composition
│   └── short-drama/             # Multi-scene AI drama with dialogue and transitions
│
└── skills/                      # AI Agent Skills (Claude, Cursor, Antigravity)
    ├── obsidianflow-core/       # Composition authoring skill
    └── obsidianflow-audio/      # Multi-track audio and ducking skill
```

```mermaid
flowchart LR
    HTML["HTML + data-* Attributes"] --> Parser["@obsidianflow/core (Parser & Linter)"]
    Parser --> Engine["@obsidianflow/engine (Headless Chrome)"]
    Engine -->|"Raw PNG Frames (stdin)"| Encoder["@obsidianflow/producer (FFmpeg image2pipe)"]
    Audio["Audio Tracks & Groups"] --> Mixer["FFmpeg Audio Mixer (amix + ducking)"]
    Encoder --> Muxer["Final Mux"]
    Mixer --> Muxer
    Muxer --> Output["Deterministic MP4 Video"]
```

---

## 🚀 Quickstart

### 1. Installation & Build

```bash
# Clone the repository
git clone https://github.com/btsstudios/obsidianflow.git
cd obsidianflow

# Install dependencies and build all packages
npm install
npm run build
```

### 2. Scaffold a New Video Project

```bash
npx obsidianflow init my-video --template blank
cd my-video
```

### 3. Check & Lint Composition

```bash
# Quick structure and timing check
npx obsidianflow check ./index.html

# Run 30+ static analysis lint rules
npx obsidianflow lint ./index.html
```

### 4. Render to MP4

```bash
npx obsidianflow render ./index.html -o final.mp4 --fps 30 --bitrate 10M
```

---

## 📝 The Composition Format

Compositions are standard HTML files annotated with `data-*` attributes:

```html
<!DOCTYPE html>
<html
  lang="en"
  data-composition-id="scene-01"
  data-width="1920"
  data-height="1080"
  data-fps="30"
  data-duration="10s"
>
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="styles.css" />
  <script src="@obsidianflow/core/runtime.js"></script>
</head>
<body>
  <!-- Video / Graphic Clip -->
  <div class="clip" id="intro" data-start="0s" data-duration="5s" data-track="video-1">
    <video
      src="assets/city-rain.mp4"
      data-media-start="0s"
      data-generated-by="veo-3.1"
      data-generation-id="gen_789abc"
    ></video>
    <h1 class="title">NEO TOKYO</h1>
  </div>

  <!-- Volcanic Shader Transition -->
  <of-transition
    type="lava-flow"
    data-start="4.5s"
    data-duration="1s"
    data-from="intro"
    data-to="dialogue-shot"
  ></of-transition>

  <!-- Multi-track Audio with Ducking -->
  <of-audio-group data-fx-chain="compression,reverb">
    <audio
      src="assets/synthwave-theme.mp3"
      data-track="music"
      data-start="0s"
      data-duration="10s"
      data-volume="0.6"
      data-ducking="dialogue"
    ></audio>
    <audio
      src="assets/voiceover.mp3"
      data-track="dialogue"
      data-start="2s"
      data-duration="4s"
      data-volume="1.0"
      data-generated-by="elevenlabs"
    ></audio>
  </of-audio-group>

  <!-- Deterministic Timeline Registration -->
  <script>
    const tl = new window.NativeTimelineAdapter();
    tl.fromTo('.title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.0 }, 0.5);
    window.__obsidianflow.registerTimeline('scene-01', tl);
  </script>
</body>
</html>
```

---

## ⚡ CLI Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `obsidianflow init <name>` | Scaffold a project from starter templates (`blank`, `short-drama`) | `npx obsidianflow init promo --template short-drama` |
| `obsidianflow lint <file>` | Run 30+ static rules for timing, determinism, and media | `npx obsidianflow lint ./index.html --json` |
| `obsidianflow check <file>` | Inspect composition dimensions, frames, tracks, and metadata | `npx obsidianflow check ./index.html` |
| `obsidianflow render <file>` | Execute headless Chrome capture and FFmpeg encode | `npx obsidianflow render ./index.html -o video.mp4 --fps 30` |

All commands accept `--json` for machine-to-machine communication with AI coding agents.

---

## 🔍 Static Linter Rules (OF001 - OF039)

| Rule ID | Severity | Category | Description |
| :--- | :--- | :--- | :--- |
| `OF001` | Error | Timing | Clip extends beyond composition duration |
| `OF002` | Warning | Timing | Overlapping clips on same track without transition |
| `OF003` | Error | Timing | Negative clip start time |
| `OF004` | Error | Timing | Zero or negative clip duration |
| `OF005` | Warning | Timing | Audio track extends beyond composition duration |
| `OF006` | Error | Timing | Transition duration exceeds connected clip length |
| `OF007` | Error | Timing | Transition start time outside composition bounds |
| `OF008` | Warning | Timing | Audio ducking references non-existent track |
| `OF009` | Error | Timing | Negative media start offset |
| `OF010` | Error | Determinism | `Math.random()` detected (breaks reproducible rendering) |
| `OF011` | Warning | Determinism | `Date.now()` or `new Date()` detected |
| `OF012` | Error | Determinism | `setInterval()` or `setTimeout()` detected |
| `OF013` | Warning | Determinism | `requestAnimationFrame()` loops detected |
| `OF014` | Warning | Determinism | `performance.now()` detected |
| `OF015` | Warning | Determinism | `crypto.getRandomValues()` detected |
| `OF016` | Warning | Determinism | CSS infinite animation without seekable timeline |
| `OF017` | Warning | Determinism | Async `fetch()` or `XMLHttpRequest` inside render loop |
| `OF018` | Warning | Determinism | Missing `window.__timelines` or runtime registration |
| `OF019` | Info | Determinism | DOM `MutationObserver` or `ResizeObserver` detected |
| `OF020` | Warning | Structure | Missing or default `data-composition-id` |
| `OF021` | Error | Structure | Invalid dimensions (must be positive even integers for H.264) |
| `OF022` | Error | Structure | Invalid FPS (must be between 1 and 120) |
| `OF023` | Error | Structure | Invalid or missing `data-duration` |
| `OF024` | Warning | Structure | Missing runtime script inclusion |
| `OF025` | Error | Structure | Malformed JSON in `data-composition-variables` |
| `OF026` | Warning | Structure | Clip missing `data-track` |
| `OF027` | Error | Structure | Duplicate clip IDs found |
| `OF028` | Warning | Structure | Unknown transition type |
| `OF029` | Warning | Structure | Transition references non-existent clip ID |
| `OF030` | Error | Media | Media element missing `src` attribute |
| `OF031` | Error | Media | Local media file does not exist on disk |
| `OF032` | Error | Media | Empty media source `src=""` |
| `OF033` | Warning | Media | Remote media URL with invalid protocol |
| `OF035` | Info | AI Metadata | Clip missing `data-generated-by` AI model tag |
| `OF036` | Info | AI Metadata | Clip missing `data-generation-id` tracking attribute |
| `OF037` | Warning | Media | Audio volume out of `[0.0, 1.0]` range |
| `OF038` | Warning | Media | Unsupported audio extension |
| `OF039` | Warning | Media | Unsupported video extension |

---

## 🤖 Install AI Agent Skills & MCP Tools

Equip **Claude Code**, **Cursor**, **Antigravity**, **ChatGPT**, or **Windsurf** with the complete **OBSIDIAN FLOW MCP** cinema engineering suite:

```bash
# Universal agent skill install (Claude Code, Cursor, Antigravity)
npx skills add btsstudios/obsidianflow --full-depth

# Or install via the OBSIDIAN FLOW CLI
npx obsidianflow mcp install
```

### Available Skills:
- [`skills/obsidianflow/SKILL.md`](skills/obsidianflow/SKILL.md) — Unified video generation, HTML/CSS layout, and instant frame vision via MCP.
- [`skills/obsidianflow-core/SKILL.md`](skills/obsidianflow-core/SKILL.md) — Composition AST, 254B tick timebase math, and seekable animation timelines.
- [`skills/obsidianflow-audio/SKILL.md`](skills/obsidianflow-audio/SKILL.md) — Multi-track audio layering, dialogue auto-ducking, and EBU R128 (-14 LUFS) broadcast loudness.

---

## 📜 License & Attribution

- **License**: Apache 2.0
- **Author**: BIDKAR RAMOS (`bidkar@gulp.wtf`)
- **Organization**: BTS Studios
- **Repository**: [https://github.com/btsstudios/obsidianflow](https://github.com/btsstudios/obsidianflow)
- **Discord**: [https://discord.gg/dgwcQrmqF](https://discord.gg/dgwcQrmqF)
