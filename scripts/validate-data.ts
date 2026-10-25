import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { seedData } from "../data/seed";
import type { Localized } from "../lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const errors: string[] = [];
const warnings: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function isLocalized(value: Localized | undefined): value is Localized {
  return Boolean(
    value &&
      typeof value.en === "string" &&
      typeof value.zhHant === "string" &&
      typeof value.zhHans === "string",
  );
}

function checkLocalized(value: Localized | undefined, path: string) {
  if (!isLocalized(value)) {
    fail(`${path}: not a localized {en, zhHant, zhHans} object`);
    return;
  }
  for (const [lang, text] of Object.entries(value)) {
    if (!text || !text.trim()) fail(`${path}.${lang}: empty translation`);
  }
}

function unique(values: string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) fail(`${label}: duplicate id "${value}"`);
    seen.add(value);
  }
}

function checkDate(value: string, path: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value) || Number.isNaN(new Date(value).getTime())) {
    fail(`${path}: invalid date "${value}"`);
  }
}

// ---------------------------------------------------------------------------
// Referential integrity
// ---------------------------------------------------------------------------
const companyIds = new Set(seedData.companies.map((company) => company.id));
const memberIds = new Set(seedData.team.map((member) => member.id));
const threadIds = new Set(seedData.threads.map((thread) => thread.id));

unique(
  seedData.companies.map((company) => company.id),
  "companies",
);
unique(
  seedData.tasks.map((task) => task.id),
  "tasks",
);
unique(
  seedData.team.map((member) => member.id),
  "team",
);
unique(
  seedData.threads.map((thread) => thread.id),
  "threads",
);
unique(
  seedData.notifications.map((notification) => notification.id),
  "notifications",
);

for (const member of seedData.team) {
  checkLocalized(member.name, `team.${member.id}.name`);
  checkLocalized(member.title, `team.${member.id}.title`);
  if (member.languages.length === 0) fail(`team.${member.id}: no languages`);
  if (member.capacityHours <= 0) fail(`team.${member.id}: capacity must be positive`);
}

for (const company of seedData.companies) {
  const at = `companies.${company.id}`;
  checkLocalized(company.name, `${at}.name`);
  checkLocalized(company.shortName, `${at}.shortName`);
  checkLocalized(company.industry, `${at}.industry`);
  checkLocalized(company.address, `${at}.address`);
  checkLocalized(company.aiSummary, `${at}.aiSummary`);
  checkLocalized(company.contact.name, `${at}.contact.name`);
  checkLocalized(company.contact.title, `${at}.contact.title`);
  company.tags.forEach((tag, index) => checkLocalized(tag, `${at}.tags[${index}]`));
  company.notes.forEach((note, index) => {
    checkLocalized(note.text, `${at}.notes[${index}].text`);
    if (!memberIds.has(note.authorId)) {
      fail(`${at}.notes[${index}]: unknown author "${note.authorId}"`);
    }
    checkDate(note.at, `${at}.notes[${index}].at`);
  });
  if (company.services.length === 0) fail(`${at}: no services`);
  if (company.healthScore < 0 || company.healthScore > 100) {
    fail(`${at}: healthScore out of range`);
  }
  checkDate(company.lastContact, `${at}.lastContact`);
}

for (const task of seedData.tasks) {
  const at = `tasks.${task.id}`;
  checkLocalized(task.title, `${at}.title`);
  checkLocalized(task.description, `${at}.description`);
  task.tags.forEach((tag, index) => checkLocalized(tag, `${at}.tags[${index}]`));
  task.checklist.forEach((item, index) =>
    checkLocalized(item.label, `${at}.checklist[${index}].label`),
  );
  if (!companyIds.has(task.companyId)) fail(`${at}: unknown company "${task.companyId}"`);
  if (!Array.isArray(task.assigneeIds) || task.assigneeIds.length === 0) {
    fail(`${at}: at least one assignee is required`);
  } else {
    task.assigneeIds.forEach((assigneeId, index) => {
      if (!memberIds.has(assigneeId)) {
        fail(`${at}.assigneeIds[${index}]: unknown assignee "${assigneeId}"`);
      }
    });
    if (task.assigneeRoles) {
      Object.entries(task.assigneeRoles).forEach(([assigneeId, role]) => {
        if (!task.assigneeIds.includes(assigneeId)) {
          fail(`${at}.assigneeRoles: "${assigneeId}" is not assigned`);
        }
        if (!["lead", "reviewer", "support"].includes(role)) {
          fail(`${at}.assigneeRoles.${assigneeId}: invalid role "${role}"`);
        }
      });
    }
  }
  if (task.sourceThreadId && !threadIds.has(task.sourceThreadId)) {
    fail(`${at}: unknown source thread "${task.sourceThreadId}"`);
  }
  checkDate(task.due, `${at}.due`);
  checkDate(task.createdAt, `${at}.createdAt`);
}

for (const thread of seedData.threads) {
  const at = `threads.${thread.id}`;
  checkLocalized(thread.groupName, `${at}.groupName`);
  checkLocalized(thread.aiSummary, `${at}.aiSummary`);
  if (!companyIds.has(thread.companyId)) fail(`${at}: unknown company "${thread.companyId}"`);
  if (thread.channel !== "whatsapp" && thread.channel !== "wechat") {
    fail(`${at}: unsupported channel "${thread.channel}"`);
  }
  thread.messages.forEach((message, index) => {
    checkLocalized(message.text, `${at}.messages[${index}].text`);
    if (!message.at) fail(`${at}.messages[${index}]: missing timestamp`);
  });
  thread.extractedTasks.forEach((extracted, index) => {
    checkLocalized(extracted.title, `${at}.extractedTasks[${index}].title`);
    checkLocalized(extracted.description, `${at}.extractedTasks[${index}].description`);
    if (!Array.isArray(extracted.assigneeIds) || extracted.assigneeIds.length === 0) {
      fail(`${at}.extractedTasks[${index}]: at least one assignee is required`);
    } else {
      extracted.assigneeIds.forEach((assigneeId, assigneeIndex) => {
        if (!memberIds.has(assigneeId)) {
          fail(
            `${at}.extractedTasks[${index}].assigneeIds[${assigneeIndex}]: unknown assignee "${assigneeId}"`,
          );
        }
      });
    }
    checkDate(extracted.due, `${at}.extractedTasks[${index}].due`);
  });
}

for (const notification of seedData.notifications) {
  checkLocalized(notification.title, `notifications.${notification.id}.title`);
  checkLocalized(notification.body, `notifications.${notification.id}.body`);
  if (!notification.href.startsWith("/")) {
    fail(`notifications.${notification.id}: href must be a workspace path`);
  }
}

// ---------------------------------------------------------------------------
// Translation table: every row must have three non-empty strings with matching
// interpolation placeholders.
// ---------------------------------------------------------------------------
const i18nPath = join(here, "..", "lib", "i18n.tsx");
const i18nSource = readFileSync(i18nPath, "utf8");
const rowPattern =
  /^\s*"([^"]+)": \[\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"\],?\s*$/gm;
const rows: { key: string; values: string[] }[] = [];
for (const match of i18nSource.matchAll(rowPattern)) {
  rows.push({ key: match[1], values: [match[2], match[3], match[4]] });
}

const seenKeys = new Set<string>();
for (const row of rows) {
  if (seenKeys.has(row.key)) fail(`i18n: duplicate key "${row.key}"`);
  seenKeys.add(row.key);
  const placeholders = row.values.map((value) => {
    const tokens = new Set<string>();
    for (const token of value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) tokens.add(token[1]);
    return [...tokens].sort().join(",");
  });
  if (new Set(placeholders).size !== 1) {
    fail(`i18n.${row.key}: placeholder mismatch (${placeholders.join(" | ")})`);
  }
  row.values.forEach((value, index) => {
    if (!value.trim()) fail(`i18n.${row.key}: empty language at index ${index}`);
  });
}

if (rows.length < 300) {
  warnings.push(`only ${rows.length} translation rows were parsed; check the regex`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log("Enwahs CRM demo data validation");
console.log(`  companies     ${seedData.companies.length}`);
console.log(`  team members  ${seedData.team.length}`);
console.log(`  tasks         ${seedData.tasks.length}`);
console.log(`  threads       ${seedData.threads.length}`);
console.log(`  messages      ${seedData.threads.reduce((total, thread) => total + thread.messages.length, 0)}`);
console.log(`  translations  ${rows.length}`);

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} validation error(s).`);
  process.exit(1);
}

console.log("\nAll checks passed.");
