// 🌋 OBSIDIAN FLOW MCP — Volcanic Pixel HUD Banner

function rgb(r: number, g: number, b: number, text: string): string {
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
}

function bold(text: string): string {
  return `\x1b[1m${text}\x1b[0m`;
}

function dim(text: string): string {
  return `\x1b[2m${text}\x1b[0m`;
}

export function getVolcanoBanner(): string {
  const c0 = (t: string) => rgb(255, 234, 0, t);    // Bright spark yellow
  const c1 = (t: string) => rgb(255, 170, 0, t);    // Magma gold
  const c2 = (t: string) => rgb(255, 106, 0, t);    // Blazing orange
  const c3 = (t: string) => rgb(255, 42, 0, t);     // Molten lava red
  const c4 = (t: string) => rgb(220, 20, 90, t);    // Fiery crimson
  const c5 = (t: string) => rgb(180, 20, 140, t);   // Magma violet
  const c6 = (t: string) => rgb(140, 30, 190, t);   // Obsidian purple
  const c7 = (t: string) => rgb(90, 50, 210, t);    // Deep obsidian blue
  const c8 = (t: string) => rgb(55, 90, 235, t);    // Volcanic cyan-blue
  const c9 = (t: string) => rgb(30, 40, 120, t);    // Bedrock base

  const lines = [
    `       ${c0('✦   ·   🔥   ·   ✦')}`,
    `            ${c1('▄█ █▄')}              ${bold(rgb(255, 106, 0, '🌋 OBSIDIAN FLOW MCP'))}`,
    `          ${c2('▄███████▄')}            ${bold('The Official Video Production MCP Server')}`,
    `         ${c3('███████████')}           ${dim('& Deterministic Cinema Engine')}`,
    `        ${c4('█████▀   ▀█████')}`,
    `       ${c5('█████       █████')}          ${rgb(255, 140, 0, 'Forged in volcanic fire.')}`,
    `      ${c6('█████         █████')}         ${dim('Inspired by Remotion and HyperFrames.')}`,
    `     ${c7('█████           █████')}        ${rgb(180, 200, 255, 'Built for AI agents. Owned by you.')}`,
    `   ${c8('▄█████▄           ▄█████▄')}`,
    `  ${c9('█████████         █████████')}      ${dim('v0.1.3  •  254B Tick Timebase  •  EBU R128')}`,
  ];

  return '\n' + lines.join('\n') + '\n';
}

export function printVolcanoBanner(): void {
  console.log(getVolcanoBanner());
}
