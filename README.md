<p align="center">
  <br />
  <img src="./assets/obsidianflow-logo.svg" width="130" alt="OBSIDIAN FLOW Logo" />
  <h1 align="center">OBSIDIAN FLOW</h1>
  <p align="center">
    <strong>Deterministic AI-Native Video Rendering Engine from HTML &amp; CSS</strong>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/obsidianflow"><img src="https://img.shields.io/npm/v/obsidianflow?style=flat&color=f97316&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/obsidianflow"><img src="https://img.shields.io/npm/dm/obsidianflow?style=flat&color=22c55e&label=downloads" alt="npm downloads" /></a>
  <a href="https://github.com/btsstudios/obsidianflow/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-3b82f6?style=flat" alt="license" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-22c55e?style=flat" alt="node version" />
  <a href="https://discord.gg/dgwcQrmqF"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord" /></a>
</p>

<p align="center">
  <strong>Write HTML. Render video. Built for agents.</strong>
</p>

<p align="center">
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-the-composition-format">Format</a> •
  <a href="#-cli-commands">CLI</a> •
  <a href="#-static-linter-rules-of001---of039">Linter</a> •
  <a href="#-ai-agent-skills">Skills</a>
</p>

<p align="center">
  <img src="./assets/showcase.gif" width="100%" alt="OBSIDIAN FLOW Showcase Demo" style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.7);" />
</p>

---

## 🌟 Overview

**OBSIDIAN FLOW** is an open-source, AI-native video rendering framework designed to turn standard web technologies (HTML, CSS, SVG, WebGL, animations) into deterministic, frame-accurate MP4 videos.

Unlike video frameworks that require custom JavaScript-heavy component ecosystems, **OBSIDIAN FLOW** uses **native HTML5 documents annotated with `data-*` attributes**. Because modern Large Language Models (LLMs) author HTML and CSS natively, AI agents can generate cinematic compositions, subtitles, motion graphics, and audio layers effortlessly.

---

## 🏛 Architecture

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

## 🤖 AI Agent Skills

ObsidianFlow includes native skills for AI coding agents (Claude, Cursor, Antigravity, GitHub Copilot):
- [`skills/obsidianflow-core/SKILL.md`](skills/obsidianflow-core/SKILL.md) — Teaches agents composition structure, timing, determinism, and timeline registration.
- [`skills/obsidianflow-audio/SKILL.md`](skills/obsidianflow-audio/SKILL.md) — Teaches agents multi-track audio layering, automated ducking, and sound design.

---

## 📜 License & Attribution

- **License**: Apache 2.0
- **Author**: BIDKAR RAMOS (`btsstudiosla@gmail.com`)
- **Organization**: BTS Studios
- **Repository**: [https://github.com/btsstudios/obsidianflow](https://github.com/btsstudios/obsidianflow)
