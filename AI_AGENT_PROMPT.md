# 🤖 Master Prompt for AI Coding Agent: ObsidianFlow Engine & CLI

Copy and paste this prompt into the other AI agent:

```markdown
You are tasked with building the open-source **ObsidianFlow Engine & CLI Monorepo**, an AI-native video rendering framework designed to compete with Remotion and HeyGen HyperFrames.

IMPORTANT SCOPE NOTE:
You are building the STANDALONE ENGINE AND CLI PACKAGES ONLY in this repository.
Do NOT build the Obsidian Studio web app (which lives in a separate repository).

Project Location: `/home/b1337/Desktop/OBSIDIAN_FLOW`
Target GitHub Repo: `https://github.com/btsstudios/obsidianflow`
License: Apache 2.0
Git Author: BIDKAR RAMOS <bidkar@gulp.wtf>

### Deliverables:
1. **Monorepo Root**: `package.json` (npm workspaces), `turbo.json`, `LICENSE` (Apache 2.0), `README.md`.
2. **`packages/core`**:
   - Types (`Composition`, `Clip`, `Track`, `FrameAdapter`).
   - Parser (HTML + `data-*` attributes to composition AST using jsdom).
   - Linter (30+ static checks for timing, determinism, missing media).
   - Runtime (`window.__compositions`, master seekable clock).
   - Frame adapters (`gsap.ts`, `waapi.ts`, `native.ts`).
3. **`packages/engine`**:
   - Puppeteer frame-by-frame deterministic capture engine.
4. **`packages/producer`**:
   - FFmpeg video encoding pipeline (image2pipe to H.264 MP4).
   - FFmpeg audio mixer with ducking and volume curves.
5. **`packages/cli`**:
   - `npx obsidianflow init <name>`
   - `npx obsidianflow lint <file> [--json]`
   - `npx obsidianflow render <file> -o <output.mp4> [--json]`
   - `npx obsidianflow check <file>`
6. **`templates/`**:
   - `templates/blank` (minimal 10s composition).
   - `templates/short-drama` (multi-scene template with dialogue and titles).
7. **`skills/`**:
   - AI agent skills for composition authoring.

Follow the full specifications in `/home/b1337/Desktop/OBSIDIAN_FLOW/AGENT_PRD.md`.
Begin by setting up the workspaces, packages, and TypeScript configurations, then build and verify each package until `npx obsidianflow render` works end-to-end.
```
