---
name: deploy-github-pages
description: Build, commit and deploy the Enwahs CRM static demo to the main branch of Gameboy612/enwahs-demo and verify GitHub Pages.
whenToUse: Use when asked to publish a demo update, deploy the site, fix a GitHub Pages deployment, or verify the live Enwahs CRM demo URL.
---

# Deploy the Enwahs CRM demo

## Target

| Item | Value |
|---|---|
| Repository | `Gameboy612/enwahs-demo` |
| Default branch | `main` |
| Live URL | `https://gameboy612.github.io/enwahs-demo/` |
| Pages base path | `/enwahs-demo` (derived by the workflow) |
| Workflow | `.github/workflows/deploy.yml` |
| Local preview | `npm run preview` → `http://localhost:4173` |

The site is a **Next.js static export** (`output: "export"`, `trailingSlash:
true`). GitHub Actions builds and uploads `out/` with the official Pages
actions. There is no server runtime.

## Prerequisites (one time)

1. The empty repository exists on GitHub. If it does not, create it under
   `Gameboy612` with **no** README/licence, then set the remote:
   ```bash
   git remote add origin https://github.com/Gameboy612/enwahs-demo.git
   ```
2. You are authenticated for `git push` (HTTPS credential helper or SSH).
   Never commit a token or `.env` file.
3. In GitHub: **Settings → Pages → Build and deployment → Source** is set to
   **GitHub Actions**. The first workflow run creates the `github-pages`
   environment; approve it if the repository requires approval.
4. Optional repository variable: `NEXT_PUBLIC_BASE_PATH` to override the
   derived `/enwahs-demo` (use an empty value for a `<owner>.github.io` user
   site or a custom domain).

## Standard deployment

From `demo/`:

```bash
npm ci
npm run check          # typecheck + data/translation validation + static build
git status             # confirm only intended source changes
git add -A
git commit -m "chore: update Enwahs CRM demo"
git push origin main
```

Or run the helper, which performs the checks, commits any changes and pushes
`main`:

```bash
bash scripts/deploy.sh
```

Then:

1. Open `https://github.com/Gameboy612/enwahs-demo/actions`.
2. Confirm **Deploy demo to GitHub Pages** is green. The deploy job prints the
   live `page_url`.
3. Hard-refresh `https://gameboy612.github.io/enwahs-demo/` and verify:
   - the Enwahs logo and CSS load (no bare HTML);
   - `/dashboard/`, `/tasks/`, `/companies/`, `/inbox/`, `/reports/`,
     `/team/`, `/settings/` all open;
   - a deep link such as
     `/companies/detail/?id=harbourview` survives a refresh;
   - switching EN / 繁中 / 简中 persists;
   - the browser console has no 404s for `_next` assets.

## How the base path works

Next's `basePath` is compiled in, so it cannot be changed after build.

- The workflow computes `/enwahs-demo` from the repository name.
- It passes `NEXT_PUBLIC_BASE_PATH` to `npm run build`.
- `next.config.mjs` applies it to routes and `next/link`.
- `lib/utils.ts` `asset()` prefixes public files such as the logo.
- A user/organisation Pages repository ending in `.github.io` gets an empty
  base path automatically.
- A custom domain needs an empty base path and a `public/CNAME` file.

If links work locally but 404 on Pages, check the workflow's base-path output
and whether **Settings → Pages → Source** is GitHub Actions.

## WSL note

Building from `/mnt/c` can raise `EXDEV: cross-device link not permitted` while
Next moves its generated 500 page. `npm run build` calls
`scripts/build.mjs`, which preloads `scripts/rename-fallback.cjs` on Linux and
falls back to copy + unlink. This is a local build workaround only; GitHub
Actions on Ubuntu does not need it. Never patch `node_modules` by hand.

## Rollback

```bash
git log --oneline -5
git revert <bad-commit>
git push origin main
```

The workflow redeploys the reverted commit. If a deployment is wedged, re-run
the failed job from the Actions tab; do not force-push `main`.

## Troubleshooting

| Symptom | Check |
|---|---|
| `npm ci` fails | `package-lock.json` must be committed and in sync with `package.json` |
| Type/data check fails | Run `npm run typecheck` and `npm run data:validate`; fix reported IDs/translations |
| Build fails on Pages | Check the workflow log; base path and Node 22 setup |
| Blank page / unstyled HTML | Base path mismatch or Pages source not set to Actions |
| 404 on refresh | Ensure `trailingSlash: true` was not removed; Pages serves folder `index.html` |
| Old content still visible | Pages CDN cache; hard-refresh, or re-run deployment |
| Action cannot deploy | Pages environment approval or missing `pages: write` / `id-token: write` permissions |
| Sensitive data appears | Stop, remove it from the commit and history, rotate anything exposed; demo data must be fictional |
