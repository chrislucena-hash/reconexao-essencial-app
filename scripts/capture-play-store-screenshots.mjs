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
  { directory: 'phone', viewport: { width: 360, height: 640 }, scale: 3, suffix: '1080x1920', isMobile: true },
  { directory: 'tablet-10', viewport: { width: 600, height: 960 }, scale: 2, suffix: '1200x1920', isMobile: false },
];
const screens = ['welcome', 'dashboard', 'tracker', 'journey', 'evolution', 'guidance'];
const outputRoot = path.resolve('play-store-screenshots');

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
      isMobile: device.isMobile,
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
