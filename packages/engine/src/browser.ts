import fs from 'fs';
import puppeteer, { type Browser, type LaunchOptions } from 'puppeteer';

export interface BrowserOptions {
  headless?: boolean;
  width?: number;
  height?: number;
  executablePath?: string;
  additionalArgs?: string[];
}

/**
 * Searches common system paths for an installed Chrome or Chromium executable.
 */
export function findSystemChrome(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * Launches a headless Chrome browser optimized for frame-accurate screenshot capture.
 */
export async function launchBrowser(options: BrowserOptions = {}): Promise<Browser> {
  const width = options.width || 1920;
  const height = options.height || 1080;

  const defaultArgs = [
    `--window-size=${width},${height}`,
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-gpu-sandbox',
    '--disable-web-security',
    '--allow-file-access-from-files',
    '--autoplay-policy=no-user-gesture-required',
    '--hide-scrollbars',
    '--mute-audio',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=Translate,OptimizationHints',
    '--force-device-scale-factor=1',
  ];

  const args = [...defaultArgs, ...(options.additionalArgs || [])];

  const execPath = options.executablePath || findSystemChrome();

  const launchConfig: LaunchOptions = {
    headless: true,
    args,
    defaultViewport: {
      width,
      height,
      deviceScaleFactor: 1,
    },
  };

  if (execPath) {
    launchConfig.executablePath = execPath;
  }

  try {
    return await puppeteer.launch(launchConfig);
  } catch (error: any) {
    // If launch failed with specified executable, try default puppeteer launch
    if (launchConfig.executablePath) {
      delete launchConfig.executablePath;
      return await puppeteer.launch(launchConfig);
    }
    throw error;
  }
}
