#!/usr/bin/env node

import { execSync } from 'child_process';
import readline from 'readline';

const packages = [
  { name: '@obsidianflow/core', path: 'packages/core' },
  { name: '@obsidianflow/engine', path: 'packages/engine' },
  { name: '@obsidianflow/producer', path: 'packages/producer' },
  { name: 'obsidianflow', path: 'packages/cli' },
];

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n🌋 OBSIDIAN FLOW — Monorepo Publisher\n');

  // Verify login
  try {
    const user = execSync('npm whoami', { encoding: 'utf8' }).trim();
    console.log(`✔ Authenticated as npm user: ${user}`);
  } catch (err) {
    console.error('❌ You are not logged into npm. Please run: npm login');
    process.exit(1);
  }

  // Get OTP from CLI argument or prompt if needed
  let otp = process.argv[2]?.replace(/^--otp=/, '') || '';

  if (!otp) {
    console.log('\nℹ️  If your npm account has 2FA enabled, enter your 6-digit authenticator code.');
    console.log('   (If you are using an npm Automation Token, simply press Enter to skip)\n');
    otp = await prompt('🔑 Enter 2FA OTP code (or leave blank if using token): ');
  }

  console.log('\n📦 Publishing packages in dependency order...\n');

  for (const pkg of packages) {
    console.log(`🚀 Publishing ${pkg.name}...`);
    try {
      const otpFlag = otp ? ` --otp=${otp}` : '';
      execSync(`npm publish --workspace=${pkg.path} --access public${otpFlag}`, {
        stdio: 'inherit',
      });
      console.log(`✔ Published ${pkg.name} successfully!\n`);
    } catch (err) {
      console.error(`\n❌ Failed to publish ${pkg.name}.`);
      if (err.message.includes('403') || err.message.includes('Two-factor')) {
        console.error('⚠️  2FA OTP was invalid, expired, or missing.');
        console.error('   Please re-run: npm run publish:packages -- <new-otp-code>');
      }
      process.exit(1);
    }
  }

  console.log('\n🎉 ALL OBSIDIAN FLOW PACKAGES PUBLISHED SUCCESSFULLY!\n');
  console.log('You can now install the CLI anywhere:');
  console.log('   $ npx obsidianflow init my-video\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
