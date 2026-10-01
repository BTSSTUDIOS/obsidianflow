# Contributing to OBSIDIAN FLOW

Thank you for your interest in contributing to **OBSIDIAN FLOW**!  
We welcome contributions from developers, designers, and AI researchers working on next-generation programmatic video rendering.

---

## 🏛 Monorepo Architecture

OBSIDIAN FLOW is organized as an npm workspaces monorepo managed with Turborepo:

```
packages/
├── core/       # Types, HTML AST parser (jsdom), 30+ static linter checks, seekable runtime
├── engine/     # Headless Chrome Puppeteer frame-by-frame capture engine
├── producer/   # FFmpeg video encoding pipeline (image2pipe) & audio filtergraph mixer
└── cli/        # obsidianflow CLI binary (init, lint, check, render)
```

---

## 🛠 Local Development Setup

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`
- **FFmpeg**: Installed and available in your system `$PATH`
- **Google Chrome** or **Chromium**: Headless browser for frame capture

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/btsstudios/obsidianflow.git
   cd obsidianflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build all packages:**
   ```bash
   npm run build
   ```

4. **Verify the CLI locally:**
   ```bash
   npx obsidianflow check ./templates/blank/index.html
   npx obsidianflow lint ./templates/blank/index.html
   ```

---

## 🧪 Testing Your Changes

Before submitting a Pull Request, verify that all static checks and builds pass:

```bash
# Build all workspaces
npm run build

# Run linter checks on starter templates
npx obsidianflow lint ./templates/blank/index.html
npx obsidianflow lint ./templates/short-drama/index.html

# Test a fast draft render
npx obsidianflow render ./templates/blank/index.html -o test-render.mp4 --quality draft --fps 24
```

---

## 🧩 Adding New Features

### Adding a New Frame Adapter
Frame adapters must implement the `FrameAdapter` interface in `packages/core/src/types.ts`:
```typescript
export interface FrameAdapter {
  name: string;
  seek(timeInSeconds: number): void | Promise<void>;
  getDuration(): number;
  destroy?(): void;
}
```
Add your adapter implementation to `packages/core/src/adapters/<name>.ts` and export it in `packages/core/src/index.ts`.

### Adding a New Lint Rule
Add your rule to `LINT_RULES` in `packages/core/src/linter.ts`. Follow the rule ID convention:
- `OF001–OF009`: Timing rules
- `OF010–OF019`: Determinism rules
- `OF020–OF029`: Structure & syntax rules
- `OF030–OF039`: Media & AI metadata rules

---

## 📬 Pull Request Guidelines

1. Fork the repo and create a descriptive branch: `git checkout -b feature/my-new-feature`
2. Follow TypeScript strict typing — avoid `any` without justification.
3. Commit with clear, conventional messages (`feat: ...`, `fix: ...`, `docs: ...`).
4. Ensure `npm run build` succeeds with zero errors.
5. Open a Pull Request against the `main` branch with a clear description of changes.

---

## 💬 Community & Support

Join our community on Discord: [https://discord.gg/dgwcQrmqF](https://discord.gg/dgwcQrmqF)  
For questions or security concerns: `bidkar@gulp.wtf`
