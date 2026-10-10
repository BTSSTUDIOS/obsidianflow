import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getVolcanoBanner } from '../banner.js';

interface SkillOptions {
  install?: boolean;
  agent?: string;
  global?: boolean;
  json?: boolean;
}

export async function skillCommand(action: string = 'info', options: SkillOptions = {}): Promise<void> {
  const repo = 'btsstudios/obsidianflow';
  const fullCommand = `npx skills add ${repo} --full-depth`;

  if (action === 'install' || options.install) {
    console.log(getVolcanoBanner());
    console.log(`🌋 Installing OBSIDIAN FLOW MCP skills into AI agent environment...`);
    console.log(`   $ ${fullCommand}\n`);
    try {
      const args = ['skills', 'add', repo, '--full-depth'];
      if (options.global) args.push('-g');
      if (options.agent) args.push('-a', options.agent);
      if (options.json) args.push('--json');

      execSync(`npx ${args.join(' ')}`, { stdio: 'inherit' });
      console.log(`\n✔ OBSIDIAN FLOW MCP skills installed successfully!`);
      console.log(`  Your agent now has frame vision (<300ms), 254B tick timeline inspection, and broadcast video rendering.\n`);
    } catch (err: any) {
      console.error(`\n❌ Failed to install skill automatically: ${err.message}`);
      console.log(`\nYou can install manually by running:`);
      console.log(`   $ ${fullCommand}\n`);
      process.exit(1);
    }
    return;
  }

  if (options.json) {
    console.log(JSON.stringify({
      repo,
      command: fullCommand,
      skills: ['obsidianflow', 'obsidianflow-core', 'obsidianflow-audio'],
      documentation: 'https://github.com/btsstudios/obsidianflow#readme'
    }, null, 2));
    return;
  }

  console.log(getVolcanoBanner());
  console.log(`
Install all OBSIDIAN FLOW MCP skills & tools into your AI agent (Claude Code,
Cursor, Antigravity, Windsurf, Copilot, etc.) with one command:

  $ ${fullCommand}

Or install directly via CLI:
  $ npx obsidianflow mcp install
  $ npx obsidianflow skill install

Available MCP Skills & Toolsets:
  • obsidianflow        Unified video generation, HTML/CSS layout & MP4 rendering
  • obsidianflow-core   Composition AST, 254B tick timing & frame adapters
  • obsidianflow-audio  Multi-track audio mixing, EBU R128 loudness & ducking
`);
}
