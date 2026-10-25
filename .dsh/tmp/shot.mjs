import { chromium } from 'playwright';

const [,, url, out, width = '1280', height = '900', lang = 'zh-Hant', full = 'false'] = process.argv;
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: Number(width), height: Number(height) },
  deviceScaleFactor: 2,
});
await context.addInitScript(({ lang }) => {
  localStorage.setItem('enwahs-crm-demo-auth-v1', JSON.stringify({ memberId: 'carlos', signedInAt: new Date().toISOString() }));
  localStorage.setItem('enwahs-crm-demo-language-v1', lang);
}, { lang });
const page = await context.newPage();
const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push(String(err)));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: out, fullPage: full === 'true' });
console.log('errors:', errors);
await browser.close();
