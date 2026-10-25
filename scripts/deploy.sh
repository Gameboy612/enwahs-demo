#!/usr/bin/env bash
# Build, commit and push the Enwahs CRM demo to GitHub Pages.
# Usage: bash scripts/deploy.sh [remote] [branch]
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

REMOTE="${1:-origin}"
BRANCH="${2:-main}"
REPO_URL="https://github.com/Gameboy612/enwahs-demo"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "error: run this from the demo git repository" >&2
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "error: remote '$REMOTE' is not configured." >&2
  echo "Create the empty GitHub repo, then run:" >&2
  echo "  git remote add $REMOTE $REPO_URL" >&2
  exit 1
fi

echo "==> Installing locked dependencies"
npm ci

echo "==> Checking types, demo data, translations and building"
npm run check

echo "==> Staging source changes"
git add -A

if git diff --cached --quiet; then
  echo "==> No source changes to commit; pushing current branch"
else
  git commit -m "chore: update Enwahs CRM demo ($(date -u +%Y-%m-%dT%H:%MZ))"
fi

echo "==> Pushing to $REMOTE/$BRANCH"
git push "$REMOTE" "$BRANCH"

echo
echo "Deployment triggered."
echo "Actions: https://github.com/Gameboy612/enwahs-demo/actions"
echo "Live:    https://gameboy612.github.io/enwahs-demo/"
