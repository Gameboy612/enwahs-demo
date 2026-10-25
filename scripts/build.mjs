#!/usr/bin/env node
/**
 * Portable `next build` wrapper.
 *
 * On Linux (including WSL), Next's static export can hit EXDEV when it renames
 * generated pages inside .next. The preload falls back to copy + unlink; it is
 * harmless on GitHub Actions, where the rename succeeds normally.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const env = { ...process.env };

if (process.platform === "linux") {
  const preload = join(root, "scripts", "rename-fallback.cjs");
  const quoted = preload.includes(" ") ? `"${preload}"` : preload;
  env.NODE_OPTIONS = [env.NODE_OPTIONS, `--require=${quoted}`]
    .filter(Boolean)
    .join(" ");
}

const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: root,
  env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
