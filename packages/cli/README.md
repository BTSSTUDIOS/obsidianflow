# OBSIDIAN FLOW

> **Deterministic AI-Native Video Rendering Engine from HTML & CSS**

[![npm version](https://img.shields.io/npm/v/obsidianflow?style=flat&color=f97316&label=npm)](https://www.npmjs.com/package/obsidianflow)
[![license](https://img.shields.io/badge/license-Apache%202.0-3b82f6?style=flat)](https://github.com/btsstudios/obsidianflow/blob/main/LICENSE)
[![node version](https://img.shields.io/badge/node-%3E%3D20-22c55e?style=flat)](https://nodejs.org)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white)](https://discord.gg/dgwcQrmqF)

**Write HTML. Render video. Built for the agent era.**

---

## ⚡ Quickstart

### Install the CLI directly:
```bash
npx obsidianflow init my-video
cd my-video
npx obsidianflow check ./index.html
npx obsidianflow render ./index.html -o final.mp4
```

### Or install the AI agent skills:
Install the official **OBSIDIAN FLOW** skills into your AI coding assistant (**Claude Code**, **Cursor**, **Antigravity**, **Windsurf**, **GitHub Copilot**, **Cline**, **OpenHands**):

```bash
npx skills add btsstudios/obsidianflow --full-depth
```

---

## 🌟 Why OBSIDIAN FLOW?

- **HTML5 & CSS Native**: Zero framework lock-in. No React JSX required. LLMs author standard web code naturally.
- **Deterministic Rendering**: Headless Chrome frame-by-frame capture with direct FFmpeg `image2pipe` streaming. No dropped frames, no wall-clock timing jitter.
- **Multi-Track Audio Ducking**: Built-in FFmpeg sidechain filtergraph automatically ducks background music under dialogue.
- **30+ Pre-Render Linter Checks**: Static analysis rules catch timing overflows and non-deterministic timers before invoking the renderer.
- **100% Open Source**: Apache 2.0 license. Free for commercial and enterprise use.

---

## ⚔️ Comparison

| Capability | **OBSIDIAN FLOW** 🌋 | **Remotion** ⚛️ | **HeyGen HyperFrames** ⚡ |
| :--- | :--- | :--- | :--- |
| **Composition Language** | **Native HTML5 + `data-*`** | React JSX only | HTML + GSAP |
| **AI Agent Native** | **100% Native** | Complex React hooks | Script + GSAP |
| **Audio Mixing** | **Built-in FFmpeg sidechain ducking** | Manual `<Audio>` | Audio filtergraph |
| **License** | **Apache 2.0 (Free)** | **Paid company license** | Apache 2.0 |

---

## 🛠 CLI Commands

```bash
# Scaffold a new video project
npx obsidianflow init my-video --template blank

# Validate composition structure & tracks
npx obsidianflow check ./index.html

# Run 30+ static lint analysis rules
npx obsidianflow lint ./index.html

# Render to deterministic MP4 video
npx obsidianflow render ./index.html -o final.mp4 --fps 30 --bitrate 10M

# Manage AI agent skills
npx obsidianflow skill
```

---

## 📖 Links & Community

- **GitHub Repository**: [https://github.com/btsstudios/obsidianflow](https://github.com/btsstudios/obsidianflow)
- **Discord Community**: [https://discord.gg/dgwcQrmqF](https://discord.gg/dgwcQrmqF)
- **Author**: BIDKAR RAMOS ([bidkar@gulp.wtf](mailto:bidkar@gulp.wtf))
- **License**: Apache 2.0
