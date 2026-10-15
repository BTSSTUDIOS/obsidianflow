import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { scoreComposition, type CompositionScore } from '@obsidianflow/core';

export interface ScoreCliOptions {
  json?: boolean;
}

export async function scoreCommand(filePath: string, options: ScoreCliOptions = {}): Promise<void> {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    if (options.json) {
      console.log(JSON.stringify({ error: `File not found: ${resolvedPath}` }));
    } else {
      console.error(pc.red(`Error: File not found at ${resolvedPath}`));
    }
    process.exit(1);
  }

  const html = fs.readFileSync(resolvedPath, 'utf-8');
  let score: CompositionScore;

  try {
    score = scoreComposition(html);
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ error: err.message }));
    } else {
      console.error(pc.red(`Error scoring composition: ${err.message}`));
    }
    process.exit(1);
  }

  if (options.json) {
    console.log(JSON.stringify(score, null, 2));
    return;
  }

  const gradeColor =
    score.grade === 'A+'
      ? pc.bold(pc.green(`[A+] CINEMA MASTER`))
      : score.grade === 'A'
      ? pc.bold(pc.green(`[A] BROADCAST READY`))
      : score.grade === 'B'
      ? pc.bold(pc.cyan(`[B] HIGH QUALITY`))
      : score.grade === 'C'
      ? pc.bold(pc.yellow(`[C] ACCEPTABLE`))
      : score.grade === 'D'
      ? pc.bold(pc.magenta(`[D] NEEDS REVISION`))
      : pc.bold(pc.red(`[F] UNPOLISHED`));

  console.log(pc.bold(pc.cyan(`\n🎬 OBSIDIAN FLOW — Cinematic Quality & Retention Score`)));
  console.log(pc.dim(`   File: ${path.basename(resolvedPath)}`));
  console.log(`   Grade: ${gradeColor}  Score: ${pc.bold(pc.yellow(`${score.totalScore}/100`))}\n`);

  console.log(pc.bold('Score Breakdown:'));
  const dims = score.dimensions;
  const printDim = (dim: any) => {
    const barLength = Math.round((dim.score / dim.maxScore) * 15);
    const bar = pc.green('█'.repeat(barLength)) + pc.dim('░'.repeat(15 - barLength));
    const scoreText = `${dim.score}/${dim.maxScore}`.padStart(5);
    console.log(`  • ${dim.name.padEnd(28)} ${bar} ${pc.bold(pc.yellow(scoreText))}  ${pc.dim(dim.details)}`);
  };

  printDim(dims.hookVelocity);
  printDim(dims.pacingRhythm);
  printDim(dims.audioArchitecture);
  printDim(dims.smptePrecision);
  printDim(dims.visualCinematics);

  console.log(pc.bold('\nDirector Feedback & Retention Directives:'));
  for (const item of score.feedback) {
    if (item.includes('Flawless')) {
      console.log(`  ${pc.green('✔')} ${pc.green(item)}`);
    } else {
      console.log(`  ${pc.yellow('➜')} ${item}`);
    }
  }
  console.log();
}
