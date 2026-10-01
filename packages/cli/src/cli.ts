#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { lintCommand } from './commands/lint.js';
import { checkCommand } from './commands/check.js';
import { renderCommand } from './commands/render.js';

const program = new Command();

program
  .name('obsidianflow')
  .description('🌋 ObsidianFlow — Deterministic AI-Native Video Rendering Engine from HTML & CSS')
  .version('0.1.0');

program
  .command('init')
  .description('Scaffold a new ObsidianFlow video composition project')
  .argument('<name>', 'Project directory name')
  .option('-t, --template <name>', 'Starter template (blank, short-drama)', 'blank')
  .action(initCommand);

program
  .command('lint')
  .description('Perform 30+ static analysis checks for timing, determinism, and media')
  .argument('<file>', 'Path to composition index.html')
  .option('--json', 'Output machine-readable JSON for AI agents')
  .option('--strict-ai', 'Enforce strict AI model attribution')
  .action(lintCommand);

program
  .command('check')
  .description('Validate composition structure, tracks, and metadata')
  .argument('<file>', 'Path to composition index.html')
  .option('--json', 'Output summary as machine-readable JSON')
  .action(checkCommand);

program
  .command('render')
  .description('Render an HTML composition into a deterministic MP4 video')
  .argument('<file>', 'Path to composition index.html')
  .requiredOption('-o, --output <file>', 'Output MP4 video file path')
  .option('--fps <number>', 'Override composition frame rate')
  .option('--bitrate <string>', 'Video encoding bitrate (e.g. 10M, 6000k)')
  .option('--codec <codec>', 'Video codec (h264, prores, vp9, av1)', 'h264')
  .option('--quality <quality>', 'Quality preset (draft, production, cinema)', 'production')
  .option('--browser <path>', 'Custom Chrome/Chromium executable path')
  .option('--json', 'Output render result as machine-readable JSON')
  .action(renderCommand);

program.parse(process.argv);
