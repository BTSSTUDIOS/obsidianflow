<p align="center">
  <br />
  <img src="https://raw.githubusercontent.com/btsstudios/obsidianflow/main/assets/obsidianflow-logo.svg" width="100" alt="OBSIDIAN FLOW Logo" />
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
  <a href="https://github.com/btsstudios/obsidianflow/releases"><img src="https://img.shields.io/badge/release-v0.1.4-22c55e?style=flat" alt="release" /></a>
  <a href="https://github.com/btsstudios/obsidianflow/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-3b82f6?style=flat" alt="license" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-22c55e?style=flat&logo=node.js&logoColor=white" alt="node version" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
</p>
<p align="center">
  <a href="#-obsidian-flow-mcp-server"><img src="https://img.shields.io/badge/MCP-Official%20Video%20Server-8b5cf6?style=flat&logo=anthropic&logoColor=white" alt="MCP Server" /></a>
  <img src="https://img.shields.io/badge/timebase-254B%20ticks%2Fs-blue?style=flat" alt="254B Tick Timebase" />
  <img src="https://img.shields.io/badge/loudness-EBU_R128_--14LUFS-22c55e?style=flat" alt="EBU R128 Loudness" />
  <img src="https://img.shields.io/badge/transitions-SMPTE%20258M-orange?style=flat" alt="SMPTE Wipes" />
  <img src="https://img.shields.io/badge/engine-Headless_Chrome_+_FFmpeg-0ea5e9?style=flat" alt="Chrome and FFmpeg" />
</p>
<p align="center">
  <a href="https://discord.gg/dgwcQrmqF"><img src="https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="#-install-ai-agent-skills"><img src="https://img.shields.io/badge/Skills-Agent%20Native-f97316?style=flat&logo=openai&logoColor=white" alt="Install Skills" /></a>
  <img src="https://img.shields.io/badge/craft-Made%20by%20Real%20Filmmakers-e11d48?style=flat" alt="Made by Real Filmmakers" />
  <img src="https://img.shields.io/badge/status-young%20and%20moving%20fast-7952d2?style=flat" alt="Status" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat" alt="PRs Welcome" />
  <a href="https://github.com/btsstudios/obsidianflow"><img src="https://github.com/btsstudios/obsidianflow?style=flat&color=yellow" alt="GitHub Stars" /></a>
</p>

<p align="center">
  <strong>Write HTML. Render video. Built for the agent era.</strong><br />
  <em>Forged in volcanic fire. Made by real filmmakers, driven by AI agents. Owned by you.</em>
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

> 🎬 **Engineered by Real Filmmakers. Driven by AI Agents.**  
> Unlike generic AI clones and synthetic toy wrappers (ArtCraft, etc.), **OBSIDIAN FLOW MCP** is built on decades of real Hollywood editing wisdom, broadcast loudness standards (EBU R128), and frontline vertical drama retention engineering. Connect it to **Claude**, **Cursor**, **ChatGPT**, or **Windsurf** to give your agent instant **frame vision** (`render_frame` in <300ms), structured **timeline inspection**, automated **dialogue audio ducking**, a **254-billion tick timebase**, and deterministic **MP4 rendering** directly from HTML/CSS code.

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

## ⚡ CLI Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `obsidianflow init <name>` | Scaffold a project from starter templates (`blank`, `short-drama`) | `npx obsidianflow init promo --template short-drama` |
| `obsidianflow lint <file>` | Run 30+ static rules for timing, determinism, and media | `npx obsidianflow lint ./index.html --json` |
| `obsidianflow check <file>` | Inspect composition dimensions, frames, tracks, and metadata | `npx obsidianflow check ./index.html` |
| `obsidianflow mcp` | Launch local Model Context Protocol stdio server | `npx obsidianflow mcp` |
| `obsidianflow mcp install` | Install agent skills suite across Cursor, Claude, Antigravity | `npx obsidianflow mcp install` |

---

## 📜 License & Attribution

- **License**: Apache 2.0
- **Author**: BIDKAR RAMOS (`bidkar@gulp.wtf`)
- **Organization**: BTS Studios
- **Repository**: [https://github.com/btsstudios/obsidianflow](https://github.com/btsstudios/obsidianflow)
- **Discord**: [https://discord.gg/dgwcQrmqF](https://discord.gg/dgwcQrmqF)
