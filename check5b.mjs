import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const el = await page.evaluateHandle(() => {
  const btn = document.querySelector('button[aria-label="?"]');
  const rect = btn.getBoundingClientRect();
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const top = document.elementFromPoint(cx, cy);
  return {
    rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
    topTag: top ? top.tagName : null,
    topClass: top ? top.className : null,
    isSame: top === btn,
  };
});
console.log(await el.jsonValue());
await browser.close();
