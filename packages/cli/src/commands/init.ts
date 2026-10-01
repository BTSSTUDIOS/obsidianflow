import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface InitOptions {
  template?: string;
}

export async function initCommand(projectName: string, options: InitOptions = {}): Promise<void> {
  const targetDir = path.resolve(process.cwd(), projectName);
  const templateName = options.template || 'blank';

  console.log(pc.bold(pc.cyan(`\n🌋 Initializing ObsidianFlow project: ${pc.green(projectName)}`)));

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.error(pc.red(`Error: Destination directory "${projectName}" already exists and is not empty.`));
    process.exit(1);
  }

  // Ensure target directory exists
  fs.mkdirSync(targetDir, { recursive: true });

  // Locate templates directory
  const possibleTemplateDirs = [
    path.resolve(__dirname, '../../../templates', templateName),
    path.resolve(__dirname, '../../templates', templateName),
    path.resolve(process.cwd(), 'templates', templateName),
  ];

  let templateDir: string | undefined;
  for (const candidate of possibleTemplateDirs) {
    if (fs.existsSync(candidate)) {
      templateDir = candidate;
      break;
    }
  }

  if (templateDir) {
    copyDirectory(templateDir, targetDir);
  } else {
    // Generate default template fallback
    generateDefaultTemplate(targetDir, projectName);
  }

  // Create minimal package.json in target dir
  const projectPkg = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      lint: `obsidianflow lint ./index.html`,
      check: `obsidianflow check ./index.html`,
      render: `obsidianflow render ./index.html -o ./dist/output.mp4`,
    },
    devDependencies: {
      obsidianflow: '^0.1.0',
    },
  };
  fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(projectPkg, null, 2));

  console.log(pc.green(`✔ Created project in ${targetDir}`));
  console.log(pc.cyan(`\nNext steps:`));
  console.log(`  cd ${projectName}`);
  console.log(`  npx obsidianflow check ./index.html`);
  console.log(`  npx obsidianflow render ./index.html -o output.mp4\n`);
}

function copyDirectory(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateDefaultTemplate(targetDir: string, projectName: string): void {
  const html = `<!DOCTYPE html>
<html
  data-composition-id="${projectName}"
  data-width="1920"
  data-height="1080"
  data-fps="30"
  data-duration="10s"
>
<head>
  <meta charset="utf-8" />
  <title>${projectName}</title>
  <link rel="stylesheet" href="styles.css" />
  <script src="@obsidianflow/core/runtime.js"></script>
</head>
<body>
  <div class="clip" data-start="0s" data-duration="10s" data-track="title">
    <div class="card">
      <h1 class="glow-title">OBSIDIANFLOW</h1>
      <p class="subtitle">AI-Native Video Engine</p>
    </div>
  </div>

  <script>
    if (window.NativeTimelineAdapter) {
      const tl = new window.NativeTimelineAdapter();
      tl.fromTo('.card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.5, ease: 'easeOutCubic' }, 0.5);
      tl.to('.card', { opacity: 0, y: -30, duration: 1, ease: 'easeInCubic' }, 8.5);
      if (window.__obsidianflow) {
        window.__obsidianflow.registerTimeline('${projectName}', tl);
      }
    }
  </script>
</body>
</html>`;

  const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 1920px;
  height: 1080px;
  background: radial-gradient(circle at center, #1a0808 0%, #050505 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #fff;
  overflow: hidden;
}

.clip {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  text-align: center;
}

.glow-title {
  font-size: 80px;
  font-weight: 900;
  letter-spacing: 0.15em;
  background: linear-gradient(135deg, #ff4500, #ff8c00, #ffcc00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 25px rgba(255, 69, 0, 0.6));
}

.subtitle {
  font-size: 28px;
  color: #a0a0a0;
  margin-top: 16px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}`;

  fs.writeFileSync(path.join(targetDir, 'index.html'), html);
  fs.writeFileSync(path.join(targetDir, 'styles.css'), css);
}
