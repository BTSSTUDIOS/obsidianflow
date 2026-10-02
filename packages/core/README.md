# @obsidianflow/core

> **Core composition parser, linter, seekable runtime, and adapters for OBSIDIAN FLOW**

Part of the [OBSIDIAN FLOW](https://github.com/btsstudios/obsidianflow) monorepo.

## Installation

```bash
npm install @obsidianflow/core
```

## Features

- **HTML Composition Parser**: Parses HTML compositions and extracts clips, tracks, transitions, and audio elements into a typed AST.
- **Seekable Master Clock**: Injects `window.__obsidianflow` into the browser runtime for frame-accurate timeline seeking.
- **Seekable Frame Adapters**: Adapters for CSS Keyframes, GSAP Timelines, and Web Animations API (WAAPI).
- **30+ Static Linter Rules (OF001–OF039)**: Validates compositions for timing overflows, missing media, and non-deterministic patterns.

## License

Apache 2.0
