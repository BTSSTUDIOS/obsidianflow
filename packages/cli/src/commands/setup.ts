import { spawnSync } from 'child_process';
import readline from 'readline';
import pc from 'picocolors';

export interface SetupCliOptions {
  checkOnly?: boolean;
}

interface ToolCheck {
  id: string;
  name: string;
  command: string;
  args?: string[];
  why: string;
  approxSize: string;
  required: boolean;
}

const TOOLS: ToolCheck[] = [
  {
    id: 'node',
    name: 'Node.js (>=20.0.0)',
    command: 'node',
    args: ['--version'],
    why: 'Runtime environment for OBSIDIAN FLOW CLI, core parser, and audio mixer.',
    approxSize: 'Pre-installed',
    required: true,
  },
  {
    id: 'git',
    name: 'Git Version Control',
    command: 'git',
    args: ['--version'],
    why: 'Project versioning and skill installation.',
    approxSize: 'Pre-installed',
    required: false,
  },
  {
    id: 'ffmpeg',
    name: 'FFmpeg with H.264 / AAC',
    command: 'ffmpeg',
    args: ['-version'],
    why: 'Hardware-accelerated MP4 encoding, ProRes rendering, and broadcast EBU R128 audio mixing.',
    approxSize: '~45 MB',
    required: true,
  },
  {
    id: 'chromium',
    name: 'Chrome / Chromium (Headless)',
    command: 'google-chrome',
    args: ['--version'],
    why: 'Deterministic sub-frame HTML/CSS canvas rendering and WebGL/WebGPU capture.',
    approxSize: '~150 MB (reused if present on system)',
    required: true,
  },
];

function checkCommandAvailable(cmd: string, args: string[] = ['--version']): { available: boolean; version?: string } {
  try {
    const res = spawnSync(cmd, args, { encoding: 'utf-8', timeout: 5000 });
    if (res.status === 0 && res.stdout) {
      const firstLine = res.stdout.split('\n')[0].trim();
      return { available: true, version: firstLine };
    }
  } catch {}

  // Fallback check for chrome aliases
  if (cmd === 'google-chrome') {
    for (const alt of ['chromium', 'chromium-browser', 'chrome']) {
      try {
        const res = spawnSync(alt, args, { encoding: 'utf-8', timeout: 5000 });
        if (res.status === 0 && res.stdout) {
          return { available: true, version: res.stdout.split('\n')[0].trim() };
        }
      } catch {}
    }
  }

  return { available: false };
}

async function askUser(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes' || normalized === '');
    });
  });
}

export async function setupCommand(options: SetupCliOptions = {}): Promise<void> {
  console.log(pc.bold(pc.cyan(`\n🌋 OBSIDIAN FLOW — Studio Environment & Permission Setup`)));
  console.log(pc.dim(`   Auditing cinema rendering engines, audio toolchains, and GPU dependencies.\n`));

  let missingCount = 0;

  for (const tool of TOOLS) {
    const check = checkCommandAvailable(tool.command, tool.args);
    if (check.available) {
      console.log(`  ${pc.green('✔')} ${pc.bold(tool.name)}: ${pc.dim(check.version || 'Detected')}`);
    } else {
      missingCount++;
      console.log(`  ${pc.yellow('?')} ${pc.bold(pc.yellow(tool.name))} ${pc.red('[Missing]')}`);
      console.log(`     ${pc.cyan('Purpose:')} ${tool.why}`);
      console.log(`     ${pc.dim('Estimated size:')} ${tool.approxSize}`);

      if (!options.checkOnly) {
        console.log(`     ${pc.dim('OBSIDIAN policy: No global system modifications are made without explicit consent.')}`);
        console.log(`     ${pc.dim('To install, use your package manager (e.g. sudo apt install ffmpeg / brew install ffmpeg).')}`);
      }
      console.log();
    }
  }

  if (missingCount === 0) {
    console.log(pc.bold(pc.green(`\n✔ Full cinema environment operational! All rendering tools detected.\n`)));
  } else {
    console.log(
      pc.bold(
        pc.yellow(
          `\nAudit complete: ${missingCount} tool(s) require attention for local hardware-accelerated rendering.\n`
        )
      )
    );
  }
}
