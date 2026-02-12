/**
 * Quick frame preview — renders a single frame as PNG.
 * Usage: node preview-frame.mjs <script.json> [sceneIndex]
 * 
 * sceneIndex defaults to 1 (first content scene, usually the most visual)
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PIPELINE_ROOT = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(PIPELINE_ROOT, "..");
const PUBLIC_DIR = path.resolve(PIPELINE_ROOT, "public");
const AUDIO_DIR = path.resolve(PUBLIC_DIR, "audio");
const AUDIO_CACHE_DIR = path.resolve(PROJECT_ROOT, "audio-cache");

dotenv.config({ path: path.resolve(PROJECT_ROOT, ".env") });

import crypto from "crypto";

const FPS = 30;

function audioCacheKey(text, voiceId) {
  return crypto.createHash("md5").update(`${voiceId}::${text}`).digest("hex");
}

function getCachedAudio(cacheKey) {
  const dir = path.join(AUDIO_CACHE_DIR, cacheKey);
  const audioPath = path.join(dir, "audio.mp3");
  const metaPath = path.join(dir, "meta.json");
  if (fs.existsSync(audioPath) && fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    return { audioPath, wordTimestamps: meta.wordTimestamps };
  }
  return null;
}

async function getAudioDuration(filePath) {
  try {
    const mm = await import("music-metadata");
    const metadata = await mm.parseFile(filePath);
    if (metadata.format.duration) return metadata.format.duration;
  } catch (e) {}
  const stats = fs.statSync(filePath);
  return (stats.size * 8) / 128000;
}

async function main() {
  const scriptPath = process.argv[2];
  const targetScene = parseInt(process.argv[3] || "1");

  if (!scriptPath) {
    console.error("Usage: node preview-frame.mjs <script.json> [sceneIndex]");
    process.exit(1);
  }

  const resolvedPath = path.resolve(scriptPath);
  const videoScript = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  const voiceId = videoScript.voice_id || "21m00Tcm4TlvDq8ikWAM";

  console.log("🖼️  Preview mode — rendering single frame");
  console.log(`📄 Script: "${videoScript.title}"`);
  console.log(`🎯 Target scene: ${targetScene}`);

  // Process scenes (use cached audio only)
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  const processedScenes = [];
  let totalFrames = 0;

  for (let i = 0; i < videoScript.scenes.length; i++) {
    const scene = videoScript.scenes[i];
    let durationInFrames;
    let audioFile = null;
    let timing = {};

    if (scene.narration) {
      const audioPath = path.join(AUDIO_DIR, `scene-${i}.mp3`);
      const cacheKey = audioCacheKey(scene.narration, voiceId);
      const cached = getCachedAudio(cacheKey);

      if (cached) {
        fs.copyFileSync(cached.audioPath, audioPath);
        const durationSec = await getAudioDuration(audioPath);
        durationInFrames = Math.ceil((durationSec + 1.5) * FPS);
        audioFile = `audio/scene-${i}.mp3`;
        timing = { wordTimestamps: cached.wordTimestamps };
      } else {
        console.log(`  ⚠️  Scene ${i} not cached — using 5s placeholder`);
        durationInFrames = 5 * FPS;
      }
    } else {
      durationInFrames = (scene.duration_seconds || 4) * FPS;
    }

    processedScenes.push({ ...scene, durationInFrames, audioFile, ...timing });
    totalFrames += durationInFrames;
  }

  // Calculate frame to capture — middle of target scene
  let frameOffset = 0;
  for (let i = 0; i < targetScene; i++) {
    frameOffset += processedScenes[i].durationInFrames;
  }
  // Go to 75% of the target scene (most content visible)
  const targetDuration = processedScenes[targetScene].durationInFrames;
  const captureFrame = frameOffset + Math.round(targetDuration * 0.75);

  console.log(`📍 Capturing frame ${captureFrame} / ${totalFrames}`);

  const entryPoint = path.resolve(PIPELINE_ROOT, "src", "index.jsx");
  console.log("📦 Bundling...");
  const bundleLocation = await bundle({ entryPoint, publicDir: PUBLIC_DIR });

  const inputProps = {
    scenes: processedScenes,
    totalDurationInFrames: totalFrames,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "VideoLesson",
    inputProps,
  });

  const outputPath = path.resolve(PROJECT_ROOT, "output", "preview.png");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log("🎨 Rendering frame...");
  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: outputPath,
    inputProps,
    frame: captureFrame,
  });

  console.log(`\n✅ PREVIEW READY: ${outputPath}`);
}

main().catch((err) => {
  console.error("❌ ERROR:", err.message);
  process.exit(1);
});
