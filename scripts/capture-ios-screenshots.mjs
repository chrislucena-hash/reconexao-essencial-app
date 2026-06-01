import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:3000';
const executableCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const executablePath = executableCandidates.find((candidate) => fs.existsSync(candidate));

if (!executablePath) {
  throw new Error('Chrome ou Edge nao foi localizado para gerar as capturas.');
}

const deviceGroups = [
  { directory: 'iphone-6.9', viewport: { width: 440, height: 956 }, scale: 3, suffix: '1320x2868' },
  { directory: 'iphone-6.5', viewport: { width: 428, height: 926 }, scale: 3, suffix: '1284x2778' },
  { directory: 'iphone-5.5', viewport: { width: 414, height: 736 }, scale: 3, suffix: '1242x2208' },
];
const screens = ['welcome', 'disclaimer', 'dashboard', 'tracker', 'journey', 'evolution'];
const outputRoot = path.resolve('app-store-screenshots');

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

try {
  for (const device of deviceGroups) {
    const directory = path.join(outputRoot, device.directory);
    fs.mkdirSync(directory, { recursive: true });

    const context = await browser.newContext({
      viewport: device.viewport,
      deviceScaleFactor: device.scale,
      isMobile: true,
      hasTouch: true,
      colorScheme: 'dark',
    });

    const page = await context.newPage();

    for (const [index, screen] of screens.entries()) {
      const route = `${baseUrl}/?preview=screenshots&screen=${screen}`;
      const filename = `${String(index + 1).padStart(2, '0')}-${screen}-${device.suffix}.png`;

      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(directory, filename),
        animations: 'disabled',
        fullPage: false,
      });

      console.log(`${device.directory}/${filename}`);
    }

    await context.close();
  }
} finally {
  await browser.close();
}
