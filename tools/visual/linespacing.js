// Render the same intro passage at several body line-heights for comparison.
//   BASE=http://localhost:8899 OUT=/tmp/ls node tools/visual/linespacing.js
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.BASE || 'http://localhost:8899';
const OUT = process.env.OUT || '/tmp/ls';
const LHS = [1.7, 1.6, 1.55, 1.5];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 820, height: 1200 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + '/posts/always-on-claude-code/', { waitUntil: 'load', timeout: 20000 });
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(400);
  for (const lh of LHS) {
    await page.evaluate((v) => { document.body.style.lineHeight = String(v); }, lh);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/lh-${lh}.png`, clip: { x: 0, y: 260, width: 820, height: 720 } });
  }
  await b.close();
  console.log('rendered: ' + LHS.join(', '));
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
