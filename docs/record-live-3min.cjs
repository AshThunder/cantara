/**
 * Live walkthrough at 1920x1080 with Alice → Bob account switch proof.
 */
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'video-3min', 'live-raw');
const APP = 'https://cantara-hackathon.vercel.app';
const NOTE = `Pitch dual-party ${Date.now().toString(36)}`;

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openMenuLink(page, menuName, href) {
  await page.locator(`button:has-text("${menuName}")`).first().click();
  await sleep(500);
  await page.locator(`a[href="${href}"]`).first().click();
  await page.waitForURL(`**${href}`, { timeout: 20000 });
}

async function connectAs(page, displayName) {
  // If connected, disconnect first
  const disc = page.locator('button:has-text("Disconnect")');
  if ((await disc.count()) > 0) {
    await disc.first().click();
    await sleep(1000);
  }
  // Log In opens party menu
  await page.locator('button:has-text("Log In")').first().click();
  await sleep(600);
  await page.locator(`button:has-text("${displayName}")`).first().click();
  await page.waitForSelector('button:has-text("Disconnect")', { timeout: 15000 });
  await sleep(1500);
}

async function main() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: 1920, height: 1080 } },
  });

  const page = await context.newPage();

  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('button:has-text("Get Started"):not([disabled])', { timeout: 60000 });
  await sleep(3500);

  // --- Alice ---
  await page.click('button:has-text("Get Started")');
  await page.waitForSelector('button:has-text("Disconnect")', { timeout: 15000 });
  await sleep(1500);

  await page.locator('a[href="/dashboard"]').first().click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForSelector('text=Welcome back', { timeout: 20000 });
  await sleep(2000);
  const reveal = page.locator('button:has-text("Reveal")');
  if ((await reveal.count()) > 0) {
    await reveal.first().click();
    await sleep(1000);
  }
  await sleep(3000);

  // Send Alice → Bob
  await page.locator('a[href="/send"]').first().click();
  await page.waitForURL('**/send', { timeout: 15000 });
  await sleep(1200);
  await page.selectOption('select', { label: 'Bob' });
  await sleep(700);
  await page.click('button:has-text("Continue")');
  await sleep(800);
  await page.fill('input[type="number"]', '6.50');
  await page.fill('input[placeholder="What\'s this for?"]', NOTE);
  await sleep(800);
  await page.click('button:has-text("Continue")');
  await sleep(1000);
  await page.click('button:has-text("Send Payment")');
  await page.waitForSelector('text=Payment Sent', { timeout: 90000 });
  await sleep(4000);

  // Alice activity (outgoing)
  await page.locator('a[href="/activity"]').first().click();
  await page.waitForURL('**/activity', { timeout: 15000 });
  await sleep(3500);

  // --- Switch to Bob ---
  await page.locator('a[href="/"]').first().click();
  await sleep(1500);
  await connectAs(page, 'Bob');
  await sleep(1000);

  await page.locator('a[href="/dashboard"]').first().click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForSelector('text=Welcome back', { timeout: 20000 });
  await sleep(2500);
  const reveal2 = page.locator('button:has-text("Reveal")');
  if ((await reveal2.count()) > 0) {
    await reveal2.first().click();
    await sleep(1000);
  }
  await sleep(3500);

  // Bob activity — received payment from Alice (unique note)
  await openMenuLink(page, 'Personal', '/activity');
  await page.waitForSelector(`text=${NOTE}`, { timeout: 30000 });
  await sleep(2000);
  await page.mouse.wheel(0, 200);
  await sleep(4500);

  // Product coverage as Bob (receiver)
  await openMenuLink(page, 'Personal', '/multi-send');
  await sleep(2500);
  await openMenuLink(page, 'Personal', '/request');
  await sleep(2500);
  await openMenuLink(page, 'Personal', '/subscriptions');
  await sleep(2500);
  await openMenuLink(page, 'Business', '/checkout');
  await sleep(2200);
  await openMenuLink(page, 'Business', '/invoices');
  await sleep(3000);
  await openMenuLink(page, 'Personal', '/wallet');
  await sleep(3000);

  await page.locator('a[href="/"]').first().click();
  await sleep(3000);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.webm'));
  if (!files.length) throw new Error('No webm recorded');
  const dest = path.join(__dirname, 'video-3min', 'live.webm');
  fs.renameSync(path.join(OUT_DIR, files[0]), dest);
  console.log('Live recorded:', dest, 'note=', NOTE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
