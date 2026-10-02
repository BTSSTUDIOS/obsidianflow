import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

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
    console.log(`\n🌋 Installing OBSIDIAN FLOW skills via:`);
    console.log(`   $ ${fullCommand}\n`);
    try {
      const args = ['skills', 'add', repo, '--full-depth'];
      if (options.global) args.push('-g');
      if (options.agent) args.push('-a', options.agent);
      if (options.json) args.push('--json');

      execSync(`npx ${args.join(' ')}`, { stdio: 'inherit' });
      console.log(`\n✔ OBSIDIAN FLOW skills installed successfully!`);
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

  console.log(`
┌────────────────────────────────────────────────────────────────────────┐
│  🌋 OBSIDIAN FLOW — Agent Skills                                      │
│  Let AI agents compose deterministic videos by writing HTML & CSS      │
└────────────────────────────────────────────────────────────────────────┘

Install all OBSIDIAN FLOW skills into your AI agent (Claude Code, Cursor,
Antigravity, Windsurf, Copilot, etc.) with one command:

  $ ${fullCommand}

Available Skills:
  • obsidianflow        Unified video generation, HTML/CSS layout & rendering
  • obsidianflow-core   Composition AST, timing attributes, and frame adapters
  • obsidianflow-audio  Multi-track audio mixing, sidechain ducking, and filters

Or install directly with the CLI:
  $ npx obsidianflow skill install
`);
}
