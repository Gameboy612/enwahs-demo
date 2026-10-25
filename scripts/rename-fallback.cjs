// WSL/DrvFs workaround for Next's static export. Next renames generated
// pages inside .next; some mounts report EXDEV even for same-device renames.
// Fall back to copy + unlink so `next build` can finish. On normal Linux and
// macOS the fallback is never triggered.
const fs = require("fs");

const originalRename = fs.promises.rename.bind(fs.promises);
fs.promises.rename = async function renameWithFallback(from, to) {
  try {
    return await originalRename(from, to);
  } catch (error) {
    if (!error || error.code !== "EXDEV") throw error;
    await fs.promises.copyFile(from, to);
    await fs.promises.unlink(from);
  }
};
