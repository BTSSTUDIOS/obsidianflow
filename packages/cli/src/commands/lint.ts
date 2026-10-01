import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { lintComposition, type LintResult } from '@obsidianflow/core';

export interface LintCliOptions {
  json?: boolean;
  strictAi?: boolean;
}

export async function lintCommand(filePath: string, options: LintCliOptions = {}): Promise<void> {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    if (options.json) {
      console.log(JSON.stringify([{ ruleId: 'FILE_NOT_FOUND', severity: 'error', message: `File not found: ${resolvedPath}` }]));
    } else {
      console.error(pc.red(`Error: File not found at ${resolvedPath}`));
    }
    process.exit(1);
  }

  const html = fs.readFileSync(resolvedPath, 'utf-8');
  const basePath = path.dirname(resolvedPath);

  const results: LintResult[] = lintComposition(html, {
    basePath,
    strictAiAttribution: options.strictAi,
  });

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    const hasErrors = results.some((r) => r.severity === 'error');
    if (hasErrors) process.exit(1);
    return;
  }

  console.log(pc.bold(pc.cyan(`\n🔍 Linting ObsidianFlow composition: ${pc.white(path.basename(resolvedPath))}`)));
  console.log(pc.dim(`   Path: ${resolvedPath}\n`));

  if (results.length === 0) {
    console.log(pc.green(`✔ All checks passed! 0 errors, 0 warnings.\n`));
    return;
  }

  let errorCount = 0;
  let warnCount = 0;
  let infoCount = 0;

  for (const r of results) {
    if (r.severity === 'error') {
      errorCount++;
      console.log(`${pc.red('✖ ERROR')}   ${pc.bold(`[${r.ruleId}]`)} ${r.message}`);
    } else if (r.severity === 'warning') {
      warnCount++;
      console.log(`${pc.yellow('⚠ WARN ')}   ${pc.bold(`[${r.ruleId}]`)} ${r.message}`);
    } else {
      infoCount++;
      console.log(`${pc.blue('ℹ INFO ')}   ${pc.bold(`[${r.ruleId}]`)} ${r.message}`);
    }

    if (r.element) {
      console.log(pc.dim(`         Element: ${r.element}`));
    }
    if (r.fixSuggestion) {
      console.log(pc.cyan(`         Suggestion: ${r.fixSuggestion}`));
    }
    console.log();
  }

  console.log(
    pc.bold(
      `Summary: ${errorCount > 0 ? pc.red(`${errorCount} error(s)`) : pc.green('0 errors')}, ` +
      `${warnCount > 0 ? pc.yellow(`${warnCount} warning(s)`) : '0 warnings'}, ` +
      `${infoCount} info\n`
    )
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}
