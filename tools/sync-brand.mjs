import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const sourceDir = path.join(root, "packages", "brand");
const targets = [
  path.join(root, "apps", "main", "public", "brand"),
  path.join(root, "apps", "benchmarks", "public", "brand"),
];

if (!existsSync(sourceDir)) {
  console.error("[sync-brand] Source directory does not exist:", sourceDir);
  process.exit(1);
}

for (const targetDir of targets) {
  mkdirSync(targetDir, { recursive: true });
  for (const fileName of readdirSync(sourceDir)) {
    cpSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
  }
  console.log(`[sync-brand] Copied brand assets -> ${targetDir}`);
}
