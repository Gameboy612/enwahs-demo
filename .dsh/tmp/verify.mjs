import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 836, height: 750 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.locator("button").filter({ hasText: /進入|Enter/ }).last().click();
await page.waitForURL(/dashboard/);
await page.goto("http://127.0.0.1:3000/tasks/", { waitUntil: "networkidle" });
await page.locator("main").getByText("審閱離岸申索資料包", { exact: false }).first().click();
await page.waitForTimeout(700);
const dialog = page.getByRole("dialog");
console.log("dialog title:", await dialog.locator("h2").first().textContent());
const addBtn = dialog.getByRole("button", { name: /^(新增|Add)$/ }).first();
console.log("add button count:", await dialog.getByRole("button", { name: /^(新增|Add)$/ }).count());
const beforeScroll = await dialog.evaluate((el) => {
  const scroller = el.querySelector(".overflow-y-auto");
  return { scrollTop: scroller?.scrollTop, scrollHeight: scroller?.scrollHeight, height: scroller?.clientHeight };
});
await addBtn.scrollIntoViewIfNeeded();
await addBtn.click();
await page.waitForTimeout(500);
const dialogs = page.getByRole("dialog");
console.log("dialogs:", await dialogs.count());
console.log("titles:", await dialogs.locator("h2").allTextContents());
console.log("focused:", await page.evaluate(() => document.activeElement?.tagName + " " + (document.activeElement?.getAttribute("placeholder") ?? "")));
await page.screenshot({ path: ".dsh/tmp/after-picker.png" });
// select another person
const picker = dialogs.last();
await picker.getByRole("checkbox").nth(1).click();
await page.waitForTimeout(200);
console.log("count text:", await picker.locator("footer, .border-t").last().textContent().catch(() => ""));
await page.screenshot({ path: ".dsh/tmp/after-selected.png" });
// Done
await picker.getByRole("button", { name: /^(已完成|Done)$/ }).click();
await page.waitForTimeout(500);
console.log("dialogs after done:", await page.getByRole("dialog").count());
console.log("selected rows:", await page.getByRole("dialog").first().locator("select").count());
await page.screenshot({ path: ".dsh/tmp/after-done.png" });
// Escape test: open picker then Escape should keep task modal
await page.getByRole("dialog").first().getByRole("button", { name: /^(新增|Add)$/ }).first().click();
await page.waitForTimeout(300);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
console.log("dialogs after escape:", await page.getByRole("dialog").count());
console.log("errors:", errors);
await browser.close();
