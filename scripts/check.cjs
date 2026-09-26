// Headless smoke test: visits every page, screenshots the default state,
// then drives every slider (min, max, mid) and clicks every chip, collecting
// console/page errors and unrendered formulas. Exit code 1 on any error.
//
// Usage: npm run check   (or: node scripts/check.cjs [port])
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

function loadPlaywright() {
  try { return require('playwright'); } catch {}
  try { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } catch {}
  console.error('Playwright not found. Run: npm install   (then: npx playwright install chromium)');
  process.exit(2);
}
const { chromium } = loadPlaywright();

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.check', 'shots');
const PORT = parseInt(process.argv[2] || '8765', 10);
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const base = `http://127.0.0.1:${PORT}/`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  let bad = 0;
  try {
    await page.goto(base, { waitUntil: 'networkidle' });
    console.log('katex loaded:', await page.evaluate(() => !!window.katex));
    const links = await page.$$eval('#nav a', as => as.map(a => a.getAttribute('href')));
    for (const t of ['#/', ...links]) {
      await page.goto(base + t, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);
      const before = errors.length;
      const name = t.replace(/[^a-z0-9.]/gi, '_') || 'home';
      await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
      const n = await page.evaluate(() => {
        let count = 0;
        const fire = r => r.dispatchEvent(new Event('input'));
        document.querySelectorAll('input[type=range]').forEach(r => { r.value = r.min; fire(r); r.value = r.max; fire(r); r.value = (parseFloat(r.min) + parseFloat(r.max)) / 2; fire(r); count++; });
        document.querySelectorAll('.chip').forEach(c => { c.click(); count++; });
        return count;
      });
      await page.waitForTimeout(100);
      const fallback = await page.$$eval('.tex-fallback', x => x.length);
      await page.screenshot({ path: path.join(OUT, `${name}_wiggled.png`), fullPage: true });
      const errs = errors.length - before;
      if (errs || fallback) bad++;
      console.log(`${t.padEnd(14)} controls: ${String(n).padStart(3)}  texFallback: ${fallback}  errors: ${errs}${errs ? '  ' + errors.slice(before).join(' | ').slice(0, 300) : ''}`);
    }
  } finally {
    await browser.close();
    server.kill();
  }
  console.log('TOTAL ERRORS', errors.length, bad ? `(${bad} page(s) need attention)` : '');
  process.exit(errors.length || bad ? 1 : 0);
})();
