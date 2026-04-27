/**
 * One-shot uploader: WP backup wp-content/uploads/ → R2 bucket starblog-media.
 *
 *   node scripts/upload-media-to-r2.mjs <wp-content/uploads dir> [--remote]
 *
 * Default uploads to local R2 (for `wrangler dev` / preview testing).
 * Pass --remote to upload to the production R2 bucket.
 *
 * Reads every file recursively under the given dir and pipes it to:
 *   wrangler r2 object put starblog-media/<relpath> --file=<abspath> [--remote]
 *
 * Concurrency is capped — wrangler spawns are heavy.
 */

import { readdirSync, statSync } from "node:fs";
import { join, relative, sep, posix } from "node:path";
import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const remoteFlag = args.includes("--remote");
const root = args.find((a) => !a.startsWith("--"));
if (!root) {
  console.error("Usage: node scripts/upload-media-to-r2.mjs <uploads-dir> [--remote]");
  process.exit(1);
}

const BUCKET = "starblog-media";
const CONCURRENCY = 6;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const files = [...walk(root)];
console.log(`Found ${files.length} files under ${root}`);
console.log(`Target: r2://${BUCKET} (${remoteFlag ? "REMOTE / production" : "local"})`);

const CT_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
};
function contentType(p) {
  const dot = p.lastIndexOf(".");
  if (dot < 0) return "application/octet-stream";
  return CT_BY_EXT[p.slice(dot).toLowerCase()] ?? "application/octet-stream";
}

let done = 0;
let failed = 0;
const failures = [];

function uploadOne(absPath) {
  const rel = relative(root, absPath).split(sep).join(posix.sep);
  const ct = contentType(absPath);
  const wranglerArgs = [
    "exec",
    "wrangler",
    "r2",
    "object",
    "put",
    `${BUCKET}/${rel}`,
    `--file=${absPath}`,
    `--content-type=${ct}`,
  ];
  if (remoteFlag) wranglerArgs.push("--remote");
  return new Promise((resolve) => {
    const proc = spawn("pnpm", wranglerArgs, {
      stdio: ["ignore", "ignore", "pipe"],
      shell: process.platform === "win32",
    });
    let stderr = "";
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    proc.on("exit", (code) => {
      done++;
      if (code !== 0) {
        failed++;
        failures.push({ rel, code, stderr: stderr.slice(0, 400) });
      }
      if (done % 20 === 0 || done === files.length) {
        process.stdout.write(`\r  ${done}/${files.length}  (failed ${failed})  `);
      }
      resolve();
    });
  });
}

async function runPool(items, n) {
  const queue = items.slice();
  const workers = Array.from({ length: n }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await uploadOne(item);
    }
  });
  await Promise.all(workers);
}

const t0 = Date.now();
await runPool(files, CONCURRENCY);
const dt = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n✓ Uploaded ${done - failed}/${files.length} in ${dt}s`);
if (failures.length) {
  console.log(`✗ ${failures.length} failures:`);
  for (const f of failures.slice(0, 20)) console.log(`  ${f.rel}  (exit ${f.code})\n    ${f.stderr.split("\n")[0]}`);
}
