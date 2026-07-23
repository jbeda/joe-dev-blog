// Visual + a11y check harness. Drives headless Chromium against a locally served
// build: screenshots each page in dark + light, runs axe-core, and checks for
// horizontal overflow at mobile widths. Matches the CHECKLISTS.md recipe.
//
//   BASE=http://localhost:8899 OUT=/tmp/shots node tools/visual/check.js
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('fs');

const BASE = process.env.BASE || 'http://localhost:8899';
const OUT = process.env.OUT || '/tmp/shots';
// Pages to check: comma-separated paths via URLS, else a representative set.
const PAGES = (process.env.URLS || '/,/about/,/colophon/')
  .split(',').map((s) => s.trim()).filter(Boolean)
  .map((p) => ({ name: p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home', path: p }));

async function settle(page) {
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(400);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const report = [];

  for (const pg of PAGES) {
    // Desktop, both themes: screenshot + axe.
    for (const theme of ['dark', 'light']) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
      const page = await ctx.newPage();
      await page.goto(BASE + pg.path, { waitUntil: 'load', timeout: 20000 });
      await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
      await settle(page);
      await page.screenshot({ path: `${OUT}/${pg.name}-${theme}-1280.png` });
      const axe = await new AxeBuilder({ page }).analyze();
      report.push({
        page: pg.name, theme,
        violations: axe.violations.map((v) => ({
          id: v.id, impact: v.impact, count: v.nodes.length,
          sample: v.nodes[0] && v.nodes[0].target,
        })),
      });
      await ctx.close();
    }
    // Mobile overflow (dark default) at 375 and 320.
    for (const w of [375, 320]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(BASE + pg.path, { waitUntil: 'load', timeout: 20000 });
      await settle(page);
      await page.screenshot({ path: `${OUT}/${pg.name}-dark-${w}.png` });
      const m = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      report.push({ page: pg.name, mobile: w, overflow: m.scrollWidth > m.innerWidth, ...m });
      await ctx.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
