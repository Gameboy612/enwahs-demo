---
name: update-demo-data
description: Update the fictional companies, tasks, conversations, team members or translations in the Enwahs CRM demo, then validate the dataset and rebuild the static site.
whenToUse: Use when asked to change demo content, add or remove a company/task/message, refresh the demo date, fix a translation, or adjust the demo's analytics.
---

# Update the Enwahs CRM demo data

The demo is a static Next.js site. All content is local, fictional and
deterministic — there is no backend, no database and no WhatsApp/WeChat
connection. Never put real Enwahs client data, phone numbers or documents in
this repository.

## Where things live

| File | What it controls |
|---|---|
| `data/seed.ts` | Companies, contacts, team, tasks, WhatsApp/WeChat threads, messages, notifications and default settings |
| `data/analytics.ts` | Monthly/weekly volume and task-throughput series used by Dashboard and Reports |
| `lib/types.ts` | TypeScript contracts for every data shape |
| `lib/constants.ts` | `DEMO_TODAY`, storage keys, app version |
| `lib/i18n.tsx` | Every UI string as `[English, 繁體中文, 简体中文]` |
| `lib/selectors.ts` | Derived counts, health bands, workload and priority ordering |
| `scripts/validate-data.ts` | Referential, date, translation and placeholder checks |

The app persists edits from the running demo in the browser's `localStorage`.
Changing `data/seed.ts` only changes the next fresh build; existing browsers
keep their old copy until **Settings → Reset demo data** is used.

## Non-negotiable rules

1. **Three languages, always.** Every `Localized` field is
   `{ en, zhHant, zhHans }` with all three non-empty. UI rows in
   `lib/i18n.tsx` are `[en, zhHant, zhHans]`.
2. **Keep interpolation placeholders identical.** If the English string has
   `{count}`, both Chinese strings need `{count}` too.
3. **Use fictional but plausible HK data.** Names, addresses, emails and phone
   numbers must be invented. Use `example.hk` style domains for new contacts.
4. **IDs are references.** A task's `companyId` must exist in `companies`; an
   `assigneeIds` must all exist in `team`; a `sourceThreadId` must exist in
   `threads`. The validator checks this.
5. **Dates are frozen around `DEMO_TODAY`.** The demo currently uses
   `2026-10-26`. If you move the demo date, shift due dates, note timestamps,
   thread timestamps and notification times together so “today / overdue”
   labels stay believable.
6. **No real integrations.** Keep WhatsApp/WeChat read-only and simulated.

## Add a company

1. Add an object to the `companies` array in `data/seed.ts`.
2. Give it a unique kebab-case `id` (`harbourview`, `silvercord`, …).
3. Fill `name`, `shortName`, `industry`, `address`, `contact.name`,
   `contact.title` and `aiSummary` in all three languages.
4. Pick 1–4 `services` from `ServiceKey` in `lib/types.ts`.
5. Set `status`, `risk`, `healthScore` (0–100), `accent` (hex), `since`,
   `lastContact`, `tags` and at least one useful note.
6. Add tasks and/or a thread that reference the new company if it should feel
   active.
7. Run `npm run data:validate`.

## Add or change a task

1. Add to the `tasks` array with a unique `id`.
2. Fill `title`, `description`, `tags` and checklist labels in all languages.
3. Reference an existing `companyId` and one or more existing `assigneeIds`.
   The first assignee is the lead; optional `assigneeRoles` map each ID to
   `"lead"`, `"reviewer"` or `"support"`.
4. Set `status` (`todo` / `doing` / `done`), `priority`
   (`high` / `medium` / `low`), `due` (`YYYY-MM-DD`) and `channel`
   (`whatsapp` / `wechat` / `email` / `internal`).
5. Use `sourceThreadId` when the task came from a conversation; this powers the
   “From conversation” chip and the inbox task-creation state.
6. Run `npm run data:validate`.

## Add a conversation

1. Add a `threads` entry with a unique `id`, an existing `companyId`, and
   `channel: "whatsapp" | "wechat"`.
2. Fill `groupName` and `aiSummary` in all three languages.
3. Keep `messages` in chronological order with unique IDs, an author, a
   `Localized` body, a timestamp and a `kind` (`text`, `image`, `voice`, `file`
   or `note`).
4. Add `extractedTasks` with existing `assigneeIds` and a due date. These are
   the cards in the AI assistant panel; creating one adds a normal task with
   `sourceThreadId` set.
5. Set `unread`, `sentiment`, `responseMinutes` and `lastAt`.
6. Run `npm run data:validate`.

## Update translations

- Add or edit the row in `lib/i18n.tsx`; keep all three values on one line when
  practical so drift is obvious.
- Prefer Hong Kong accounting vocabulary in Traditional Chinese: 審計, 稅務,
  公司秘書, 薪酬, 強積金, 利得稅報稅表, 周年申報表.
- Reuse existing keys where possible rather than adding near-duplicates.
- Run `npm run data:validate`; it checks duplicate keys, empty translations and
  placeholder mismatches.

## Validate and preview

```bash
npm ci                       # first time, or after changing package.json
npm run typecheck            # TypeScript
npm run data:validate        # IDs, dates, all three languages, placeholders
npm run check                # typecheck + validate + production export
npm run preview              # serve out/ at http://localhost:4173
```

`npm run build` uses `scripts/build.mjs`, which adds a WSL/DrvFs EXDEV fallback
on Linux. Do not commit `.next/` or `out/`.

## Visual QA checklist

- Login at `/` with each preview role; the language switch persists.
- Home todo list: tabs, Todo/Doing/Done counts, search, urgent and blocked filters.
- Tasks: list, board, create/edit, mark done, kanban drag, filters; editor company icons, participant-style assignee picker and Todo/Doing/Done icon selector.
- Companies: grid/table, add company, open a profile, add a note, create a task.
- Inbox: switch WhatsApp/WeChat threads, read AI summary, create an extracted
  task, confirm the composer is read-only.
- Reports: charts render, range selector works, CSV export downloads.
- Team: workload bars and member modal, “View tasks” filter.
- Settings: language, toggles, export, reset.
- Mobile 390 px: menu drawer, stacked cards, no horizontal overflow.
- No console errors or broken images.

When the content is ready, hand off to the **deploy-github-pages** skill.
