import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 836, height: 750 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
const dialogs = () => page.getByRole("dialog");
const openTask = async () => {
  await page.locator("main").getByText("審閱離岸申索資料包", { exact: false }).first().click();
  await page.waitForTimeout(500);
};
const addBtn = () => dialogs().first().getByRole("button", { name: /^(新增|Add)$/ }).first();

await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.locator("button").filter({ hasText: /進入|Enter/ }).last().click();
await page.waitForURL(/dashboard/);
await page.goto("http://127.0.0.1:3000/tasks/", { waitUntil: "networkidle" });
await openTask();

// 1. Cancel discards draft selection
await addBtn().scrollIntoViewIfNeeded();
await addBtn().click();
await page.waitForTimeout(300);
let picker = dialogs().last();
await picker.getByRole("checkbox").nth(0).click();
console.log("draft count after select:", await picker.locator("text=/已選 2 位|2 selected/").count());
await picker.getByRole("button", { name: /^(取消|Cancel)$/ }).click();
await page.waitForTimeout(300);
console.log("dialogs after cancel:", await dialogs().count());
const selectedNames = await dialogs().first().locator(".border.rounded-xl.border-line > div").allTextContents();
console.log("selected row text:", JSON.stringify(selectedNames));

// 2. Reopen: draft reset, escape closes only picker
await addBtn().click();
await page.waitForTimeout(300);
picker = dialogs().last();
console.log("picker reopened count:", await picker.locator("text=/已選 1 位|1 selected/").count());
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
console.log("dialogs after picker escape:", await dialogs().count(), "body overflow:", await page.evaluate(() => document.body.style.overflow));

// 3. Use Done with 2 selections
await addBtn().click();
await page.waitForTimeout(300);
picker = dialogs().last();
await picker.getByRole("checkbox").nth(1).click();
await picker.getByRole("button", { name: /^(已完成|Done)$/ }).click();
await page.waitForTimeout(300);
console.log("dialogs after done:", await dialogs().count());
console.log("role selects:", await dialogs().first().locator("select[aria-label^='角色']").count());

// 4. Save and verify it persisted: reopen from row after modal close
await dialogs().first().getByRole("button", { name: /^(儲存|Save)$/ }).click();
await page.waitForTimeout(500);
console.log("dialogs after save:", await dialogs().count());
await openTask();
const rows = await dialogs().first().locator("section").first().locator("div.flex.items-center").allTextContents();
console.log("rows after save:", JSON.stringify(rows));

// 5. Company picker escape closes only that picker
await dialogs().first().getByRole("button", { name: /選擇公司|Select company/ }).click();
await page.waitForTimeout(300);
console.log("dialogs after company open:", await dialogs().count());
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
console.log("dialogs after company escape:", await dialogs().count());

// 6. Escape closes the task modal itself
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
console.log("dialogs after task escape:", await dialogs().count(), "body overflow:", await page.evaluate(() => document.body.style.overflow));
console.log("console errors:", errors);
await browser.close();

// Mobile pass
const browser2 = await chromium.launch({ headless: true });
const mobile = await browser2.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await mobile.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await mobile.locator("button").filter({ hasText: /進入|Enter/ }).last().click();
await mobile.waitForURL(/dashboard/);
await mobile.goto("http://127.0.0.1:3000/tasks/", { waitUntil: "networkidle" });
await mobile.locator("main").getByText("審閱離岸申索資料包", { exact: false }).first().click();
await mobile.waitForTimeout(500);
const md = mobile.getByRole("dialog").first();
const add = md.getByRole("button", { name: /^(新增|Add)$/ }).first();
await add.scrollIntoViewIfNeeded();
await add.click();
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: ".dsh/tmp/after-mobile.png" });
console.log("mobile dialogs:", await mobile.getByRole("dialog").count());
await browser2.close();
