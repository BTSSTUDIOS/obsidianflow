# Changelog

All notable changes to the **OBSIDIAN FLOW** video rendering engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.2] - 2026-10-08

### ⚡ Exact Time Math & SMPTE 258M Timebase
- **254 Billion Tick Timebase (`TICKS_PER_SECOND = 254_016_000_000n`)**: Upgraded core time math to use integer BigInt ticks identical to Adobe Premiere Pro and FilmCraft. Divides cleanly with zero fractional drift across 24, 25, 29.97, 30, 50, 59.94, 60, and 120 fps, as well as 44.1kHz and 48kHz audio sample rates.
- Added helper functions: `secondsToTicks`, `ticksToSeconds`, `frameToTicks`, `ticksToFrame`, `formatSMPTETimecode`.

### 🎚 Broadcast Audio & EBU R128 Normalization
- **Auto-Ducking Parity**: Supported both `data-duck` and `data-ducking` attribute selectors.
- **Ducking Ratio Mapping**: Added `data-duck-ratio` support to control sidechain compression depth.
- **Manual Rubber-Band Volume Keyframes**: Implemented `data-volume-keyframes` parsing and piecewise linear FFmpeg volume filter generation (`eval=frame`).
- **EBU R128 Loudness Normalization**: Added default broadcast normalization targeting `-14 LUFS` and `-1.0 dBTP` True Peak.

### 🎭 Transitions & SMPTE 258M Wipes
- Added `smpte-wipe` transition type supporting standard SMPTE 258M wipe codes:
  - Code `1`: Horizontal Wipe (Left-to-Right)
  - Code `2`: Vertical Wipe (Top-to-Bottom)
  - Codes `21-26`: Barn Door & Box Wipes
  - Codes `101-104`: Circle & Iris Expansions
  - Codes `201-204`: Clock & Radial Sweeps

### 🔌 Model Context Protocol (MCP) Server & Creative Prompts
- Added `obsidianflow mcp` stdio server implementing JSON-RPC 2.0:
  - **Tools**: `render_frame` (&lt;300ms PNG capture), `extract_frame`, `inspect_timeline`, `lint_composition`, `get_guide`, `render_video`, `get_job_status`.
  - **Resources**: `obsidianflow://guide/*` documentation chapters.
  - **Workflow Prompts (`prompts/list`, `prompts/get`)**: Added 7 Higgsfield-style slash-command workflows:
    - `/vox-video-essay` (Editorial documentary motion graphics)
    - `/ad-hook-multiplier` (3 TikTok/Reels viral hook A/B variations)
    - `/vertical-reel-resizer` (16:9 to 9:16 vertical re-framing with safe zones)
    - `/saas-product-walkthrough` (Dark-mode browser UI mockup with cursor clicks)
    - `/project-sorter` (Automated stem and media bin organizer)
    - `/headline-multiplier` (5 kinetic CSS typography animation styles)
    - `/social-ad-localizer` (Multilingual subtitle and audio stem synchronization)

### 🛡 CI/CD & Badges
- Added automated GitHub Actions matrix workflow (`.github/workflows/ci.yml`) testing Node.js 20 and 22.
- Added comprehensive Ghidra-style badge wall to README with live CI status, NPM version, timebase, and community links.

---

## [0.1.1] - 2026-10-02

### Added
- Multi-track audio mixer with sidechain ducking.
- Static linter rules OF001 through OF039 for deterministic rendering verification.
- TikTok / Reels 9:16 safe zone bounds checking.

---

## [0.1.0] - 2026-10-01

### Added
- Initial public release of `@obsidianflow/core`, `@obsidianflow/engine`, and `@obsidianflow/producer`.
- Headless Chrome frame-by-frame seeking loop and direct FFmpeg `image2pipe` encoder.
- Initial agent skills for Claude Code, Cursor, and Antigravity.
