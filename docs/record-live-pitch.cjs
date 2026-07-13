/**
 * Record a silent full-desktop live walkthrough of Cantara for voiceover.
 */
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'video-live');
const APP = 'https://cantara-hackathon.vercel.app';

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('button:has-text("Get Started"):not([disabled])', { timeout: 60000 });
  await sleep(2500);

  await page.click('button:has-text("Get Started")');
  await page.waitForSelector('button:has-text("Disconnect")', { timeout: 15000 });
  await sleep(1500);

  await page.locator('a[href="/dashboard"]').first().click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForSelector('text=Welcome back', { timeout: 20000 });
  await sleep(3500);

  const reveal = page.locator('button:has-text("Reveal")');
  if ((await reveal.count()) > 0) {
    await reveal.first().click();
    await sleep(1000);
  }
  await sleep(2500);

  await page.locator('a[href="/send"]').first().click();
  await page.waitForURL('**/send', { timeout: 15000 });
  await sleep(1500);
  await page.selectOption('select', { label: 'Bob' });
  await sleep(800);
  await page.click('button:has-text("Continue")');
  await sleep(1000);
  await page.fill('input[type="number"]', '4.25');
  await page.fill('input[placeholder="What\'s this for?"]', 'Pitch demo payment');
  await sleep(1000);
  await page.click('button:has-text("Continue")');
  await sleep(1200);
  await page.click('button:has-text("Send Payment")');
  await page.waitForSelector('text=Payment Sent', { timeout: 90000 });
  await sleep(4000);

  await page.locator('a[href="/activity"]').first().click();
  await page.waitForURL('**/activity', { timeout: 15000 });
  await sleep(4000);

  await page.locator('a[href="/invoices"]').first().click();
  await page.waitForURL('**/invoices', { timeout: 15000 });
  await sleep(4000);

  await page.locator('a[href="/checkout"]').first().click();
  await page.waitForURL('**/checkout', { timeout: 15000 });
  await sleep(3500);

  await page.locator('a[href="/"]').first().click();
  await sleep(2500);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.webm'));
  if (!files.length) throw new Error('No webm recorded');
  const src = path.join(OUT_DIR, files[0]);
  const dest = path.join(__dirname, 'Cantara-Pitch-Live.webm');
  fs.renameSync(src, dest);
  console.log('Recorded:', dest);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
