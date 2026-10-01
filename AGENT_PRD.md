# 🌋 ObsidianFlow Engine & CLI — Product Requirements Document (PRD)

> **Target Directory**: `/home/b1337/Desktop/OBSIDIAN_FLOW`  
> **Repository Target**: `https://github.com/btsstudios/obsidianflow`  
> **Author**: BTS Studios (`BIDKAR RAMOS <bidkar@gulp.wtf>`)  
> **License**: Apache 2.0  
> **Primary Goal**: Build the standalone open-source **ObsidianFlow Engine & CLI Monorepo** (competing with Remotion and HeyGen HyperFrames) for turning HTML/CSS and seekable animations into deterministic MP4 videos.

---

## 1. Scope & Clear Boundary

- **What this repository IS**:
  - The standalone, open-source video rendering engine and CLI (`@obsidianflow/*`).
  - Core composition parser, linter, runtime, and seekable animation adapters (GSAP, WAAPI, Native).
  - Headless frame capture engine (Puppeteer) and encoding pipeline (FFmpeg).
  - Developer CLI (`npx obsidianflow init`, `lint`, `render`, `check`).
  - Starter templates and AI agent skills.

- **What this repository is NOT**:
  - This is **NOT** the Obsidian Studio web application (`obsidian.video`). The Obsidian Studio web app is developed separately in the `btsstudios/obsidian` repo and will consume `@obsidianflow/*` as a package.

---

## 2. Monorepo Architecture

```
/home/b1337/Desktop/OBSIDIAN_FLOW/
├── package.json                 # npm workspaces root
├── turbo.json                   # Turborepo build orchestration
├── tsconfig.base.json           # Shared TypeScript settings
├── LICENSE                      # Apache 2.0
├── README.md                    # Engine documentation & CLI guide
├── packages/
│   ├── core/                    # @obsidianflow/core
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types.ts         # Composition, Clip, Track, AudioGroup, Transition types
│   │       ├── parser.ts        # Parse HTML + data-* attributes to Composition AST
│   │       ├── linter.ts        # 30+ static analysis rules (OF001-OF039)
│   │       ├── runtime.ts       # Browser runtime & master clock window.__compositions
│   │       ├── time.ts          # Time string parser ('5s', '500ms', '01:30')
│   │       └── adapters/        # Seekable frame adapters
│   │           ├── gsap.ts      # GSAP timeline adapter (paused timeline seek)
│   │           ├── waapi.ts     # Web Animations API adapter
│   │           └── native.ts    # Native keyframe timeline adapter
│   │
│   ├── engine/                  # @obsidianflow/engine
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── browser.ts       # Headless Chrome launcher & lifecycle
│   │       └── capture.ts       # Frame-by-frame screenshot loop via CDP/Puppeteer
│   │
│   ├── producer/                # @obsidianflow/producer
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── pipeline.ts      # Full render pipeline (parse -> lint -> capture -> encode)
│   │       ├── encoder.ts       # FFmpeg video encoding child process (H.264, ProRes, VP9)
│   │       └── audio-mixer.ts   # FFmpeg audio filtergraph mixdown with ducking
│   │
│   └── cli/                     # @obsidianflow/cli (executable: obsidianflow)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── cli.ts           # Commander.js entry point
│           └── commands/
│               ├── init.ts      # Scaffold from template
│               ├── lint.ts      # Run linter checks
│               ├── render.ts    # Execute producer pipeline (with --json support)
│               └── check.ts     # Quick syntax/timing validator
│
├── templates/
│   ├── blank/                   # Minimal 1080p 10s composition
│   │   ├── index.html
│   │   └── styles.css
│   └── short-drama/             # Multi-scene AI drama with dialogue and title card
│       ├── index.html
│       └── styles.css
│
└── skills/                      # AI Agent markdown skills
    ├── obsidianflow-core/
    │   └── SKILL.md
    └── obsidianflow-audio/
        └── SKILL.md
```

---

## 3. Core Package Specifications (`@obsidianflow/core`)

### HTML Composition Standard
Compositions are valid HTML documents with `data-*` attributes:
```html
<!DOCTYPE html>
<html
  data-composition-id="scene-01"
  data-width="1920"
  data-height="1080"
  data-fps="30"
  data-duration="10s"
>
<head>
  <script src="@obsidianflow/core/runtime.js"></script>
</head>
<body>
  <div class="clip" data-start="0s" data-duration="5s" data-track="video-1">
    <video src="clip.mp4" data-media-start="0s" data-generated-by="veo-3.1"></video>
  </div>
</body>
</html>
```

### Frame Adapters
All animation adapters must implement the common interface:
```typescript
export interface FrameAdapter {
  name: string;
  seek(timeInSeconds: number): void;
  getDuration(): number;
  destroy(): void;
}
```

---

## 4. Engine & Producer Specifications

1. **`@obsidianflow/engine`**:
   - Uses Puppeteer in headless mode.
   - Disables wall-clock time and explicitly evaluates `window.__timelines[id].seek(time)` per frame.
   - Captures raw PNG screenshots per frame and streams to the producer.

2. **`@obsidianflow/producer`**:
   - Pipes raw frames directly into `ffmpeg` via stdin (`-f image2pipe -vcodec png`).
   - Uses `-c:v libx264 -pix_fmt yuv420p` for maximum MP4 compatibility.
   - Extracts `<audio>` and `<video>` sources, calculates start offsets with `adelay`, and applies volume ducking via `amix`.

---

## 5. CLI Commands (`@obsidianflow/cli`)

- `obsidianflow init <project-name> [--template <name>]`
- `obsidianflow lint <path/to/index.html> [--json]`
- `obsidianflow render <path/to/index.html> -o <output.mp4> [--fps 30] [--bitrate 10M] [--json]`
- `obsidianflow check <path/to/index.html>`

All commands support `--json` for machine-readable output by AI coding agents.

---

## 6. Verification Checklist for the Monorepo

- [ ] `npm install` and `npm run build` succeed across all workspace packages (`core`, `engine`, `producer`, `cli`).
- [ ] `npx obsidianflow lint templates/blank/index.html` returns 0 errors.
- [ ] `npx obsidianflow render templates/blank/index.html -o test.mp4` successfully invokes headless Chrome and FFmpeg and generates a valid, playable MP4 file.
- [ ] Apache 2.0 license file present in the root.
