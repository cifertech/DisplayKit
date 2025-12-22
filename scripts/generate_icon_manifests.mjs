import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "..");
const iconsDir = path.join(repoRoot, "icons");

function isPng(p) {
  return p.toLowerCase().endsWith(".png");
}

async function walk(dir, baseDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // Skip node_modules or dot dirs if any
      if (e.name.startsWith(".")) continue;
      out.push(...(await walk(full, baseDir)));
    } else if (e.isFile() && isPng(e.name)) {
      const rel = path.relative(baseDir, full).split(path.sep).join("/");
      // Only include files under icons/<size>/...
      out.push(rel);
    }
  }
  return out;
}

function sortFiles(files) {
  return [...files].sort((a, b) => a.localeCompare(b, "en"));
}

async function writeIfChanged(filePath, content) {
  let prev = null;
  try {
    prev = await fs.readFile(filePath, "utf8");
  } catch {
    // ignore
  }
  if (prev === content) return false;
  await fs.writeFile(filePath, content, "utf8");
  return true;
}

async function main() {
  // Ensure icons dir exists
  await fs.access(iconsDir);

  const files = sortFiles(await walk(iconsDir, iconsDir));
  const manifest = {
    version: 1,
    basePath: "icons/",
    generatedAt: new Date().toISOString(),
    files
  };

  const jsonPath = path.join(iconsDir, "manifest.json");
  const jsPath = path.join(iconsDir, "manifest.js");

  const json = JSON.stringify(manifest, null, 2) + "\n";
  const js =
    `// Auto-generated icon manifest for DisplayKit.\n` +
    `// This file exists to support running DisplayKit via file:// (where fetch() to local JSON is often blocked).\n` +
    `// When hosted (http/https), the app can also load icons/manifest.json.\n` +
    `window.DISPLAYKIT_ICON_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`;

  const changedJson = await writeIfChanged(jsonPath, json);
  const changedJs = await writeIfChanged(jsPath, js);

  if (changedJson || changedJs) {
    console.log("Updated icon manifests.");
  } else {
    console.log("Icon manifests already up to date.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


