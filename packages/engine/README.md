# @obsidianflow/engine

> **Headless Puppeteer frame-by-frame deterministic capture engine for OBSIDIAN FLOW**

Part of the [OBSIDIAN FLOW](https://github.com/btsstudios/obsidianflow) monorepo.

## Installation

```bash
npm install @obsidianflow/engine
```

## Features

- **Deterministic Browser Lifecycle**: Launches Chromium with deterministic flags, disabled throttling, and fixed virtual viewports.
- **Master Clock Synchronization**: Steps browser timeline frame-by-frame via `window.__obsidianflow.seekToFrame(frame)`.
- **Zero-Jitter Capture**: Captures uncompressed frames directly to buffers or stdout pipelines.

## License

Apache 2.0
