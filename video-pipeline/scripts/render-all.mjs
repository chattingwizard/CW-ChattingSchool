/**
 * Batch render ALL Foundations videos and copy to docs/videos/
 * Usage: node video-pipeline/scripts/render-all.mjs
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const SCRIPTS_DIR = path.resolve(PROJECT_ROOT, "video-scripts");
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, "output");
const DOCS_VIDEOS = path.resolve(PROJECT_ROOT, "docs", "videos");

// Map: script filename → short name for docs/videos/
const VIDEOS = [
  { script: "F-01-who-is-chatting-wizard.json",      target: "f-01-cw.mp4" },
  { script: "F-01-welcome-and-3-key-words.json",     target: "f-01.mp4" },
  { script: "F-02-your-team-and-coaching.json",       target: "f-02.mp4" },
  { script: "F-03-what-is-onlyfans.json",             target: "f-03.mp4" },
  { script: "F-04-how-money-flows.json",              target: "f-04.mp4" },
  { script: "F-05-why-fans-pay.json",                 target: "f-05.mp4" },
  { script: "F-06-what-does-a-chatter-do.json",       target: "f-06.mp4" },
  { script: "F-07-a-typical-shift.json",              target: "f-07.mp4" },
  { script: "F-08-banned-topics-list.json",            target: "f-08.mp4" },
  { script: "F-09-handling-banned-requests.json",      target: "f-09.mp4" },
];

fs.mkdirSync(DOCS_VIDEOS, { recursive: true });

console.log("═══════════════════════════════════════════════");
console.log("  Chatting Wizard — BATCH RENDER (all videos)");
console.log(`  Videos to render: ${VIDEOS.length}`);
console.log("═══════════════════════════════════════════════\n");

let success = 0;
let failed = 0;

for (let i = 0; i < VIDEOS.length; i++) {
  const { script, target } = VIDEOS[i];
  const scriptPath = path.join(SCRIPTS_DIR, script);

  if (!fs.existsSync(scriptPath)) {
    console.log(`\n❌ [${i + 1}/${VIDEOS.length}] SKIP — script not found: ${script}`);
    failed++;
    continue;
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`🎬 [${i + 1}/${VIDEOS.length}] Rendering: ${script}`);
  console.log(`   Target: ${target}`);
  console.log("═".repeat(50));

  try {
    execSync(
      `node "${path.resolve(__dirname, "create-video.mjs")}" "${scriptPath}"`,
      { stdio: "inherit", cwd: PROJECT_ROOT, timeout: 600000 }
    );

    // Find the rendered file in output/
    const outputFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith(".mp4"));
    // Sort by modification time (newest first)
    outputFiles.sort((a, b) => {
      return fs.statSync(path.join(OUTPUT_DIR, b)).mtimeMs - fs.statSync(path.join(OUTPUT_DIR, a)).mtimeMs;
    });

    if (outputFiles.length > 0) {
      const rendered = path.join(OUTPUT_DIR, outputFiles[0]);
      const dest = path.join(DOCS_VIDEOS, target);
      fs.copyFileSync(rendered, dest);
      const sizeMB = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
      console.log(`\n✅ Copied → docs/videos/${target} (${sizeMB} MB)`);
      success++;
    } else {
      console.log(`\n❌ No .mp4 found in output after render`);
      failed++;
    }
  } catch (err) {
    console.log(`\n❌ RENDER FAILED: ${err.message}`);
    failed++;
  }
}

console.log(`\n${"═".repeat(50)}`);
console.log(`  BATCH COMPLETE: ${success} success, ${failed} failed`);
console.log("═".repeat(50));
