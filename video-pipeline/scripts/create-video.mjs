/**
 * Chatting Wizard School — Video Pipeline v2
 *
 * Usage: node video-pipeline/scripts/create-video.mjs <path-to-video-script.json>
 *
 * Improvements in v2:
 * - Word-level timestamps from ElevenLabs for audio-visual sync
 * - Timing data passed to Remotion components for synced animations
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const PIPELINE_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.resolve(PIPELINE_ROOT, "public");
const AUDIO_DIR = path.resolve(PUBLIC_DIR, "audio");
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, "output");

// Load .env
function loadEnv() {
  const envPath = path.resolve(PROJECT_ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    console.error("ERROR: .env file not found at", envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    process.env[trimmed.slice(0, eqIndex).trim()] = trimmed.slice(eqIndex + 1).trim();
  }
}

loadEnv();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY not found in .env");
  process.exit(1);
}

const FPS = 30;
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL = "eleven_multilingual_v2";

// ============================================================
//  Audio generation WITH timestamps (for sync)
// ============================================================

function charTimestampsToWords(alignment) {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  const words = [];
  let currentWord = "";
  let wordStart = null;
  let wordEnd = null;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    if (char === " " || char === "\n" || char === "\t" || char === ",") {
      if (currentWord) {
        words.push({ word: currentWord, start: wordStart, end: wordEnd });
        currentWord = "";
        wordStart = null;
      }
      // Commas are part of punctuation, skip
    } else {
      if (wordStart === null) {
        wordStart = character_start_times_seconds[i];
      }
      wordEnd = character_end_times_seconds[i];
      currentWord += char;
    }
  }
  if (currentWord) {
    words.push({ word: currentWord, start: wordStart, end: wordEnd });
  }
  return words;
}

async function generateAudioWithTimestamps(text, outputPath, voiceId) {
  console.log(`  🎙️  Generating audio with timestamps...`);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: DEFAULT_MODEL,
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    // Save audio from base64
    const audioBuffer = Buffer.from(data.audio_base64, "base64");
    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`  ✅  Audio saved: ${path.basename(outputPath)} (${(audioBuffer.length / 1024).toFixed(0)} KB)`);

    // Parse word timestamps
    const wordTimestamps = charTimestampsToWords(data.alignment);
    console.log(`  🔤  Got ${wordTimestamps.length} word timestamps`);

    return { wordTimestamps };

  } catch (error) {
    console.log(`  ⚠️  Timestamps API failed (${error.message}), falling back to regular TTS`);
    return await generateAudioRegular(text, outputPath, voiceId);
  }
}

async function generateAudioRegular(text, outputPath, voiceId) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: DEFAULT_MODEL,
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.85,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error (${response.status}): ${await response.text()}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✅  Audio saved: ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(0)} KB)`);

  return { wordTimestamps: null };
}

// ============================================================
//  Audio duration
// ============================================================

async function getAudioDuration(filePath) {
  try {
    const mm = await import("music-metadata");
    const metadata = await mm.parseFile(filePath);
    if (metadata.format.duration) return metadata.format.duration;
  } catch (e) {
    // fallback
  }
  const stats = fs.statSync(filePath);
  return (stats.size * 8) / 128000;
}

// ============================================================
//  Timing calculations
// ============================================================

function calculateSceneTiming(scene, audioDurationSec, wordTimestamps) {
  const wordCount = scene.narration ? scene.narration.split(/\s+/).length : 1;
  const wordsPerSecond = wordCount / Math.max(audioDurationSec, 0.5);
  const framesPerWord = Math.round(FPS / wordsPerSecond);

  const timing = {
    audioDurationSec,
    wordsPerSecond,
    framesPerWord,
    wordTimestamps: wordTimestamps || null,
    bulletStartFrames: [],
    headingDurationFrames: Math.round(1.5 * FPS),
  };

  // Calculate bullet start times based on narration duration
  if (scene.points && scene.points.length > 0) {
    const headingDurationSec = 1.5;
    const remainingDuration = Math.max(audioDurationSec - headingDurationSec, 1);
    const bulletGap = remainingDuration / scene.points.length;

    for (let b = 0; b < scene.points.length; b++) {
      const startSec = headingDurationSec + b * bulletGap;
      timing.bulletStartFrames.push(Math.round(startSec * FPS));
    }
  }

  return timing;
}

// ============================================================
//  Process scenes
// ============================================================

async function processScenes(videoScript) {
  const { scenes, voice_id } = videoScript;
  const voiceId = voice_id || DEFAULT_VOICE_ID;

  if (fs.existsSync(AUDIO_DIR)) {
    for (const file of fs.readdirSync(AUDIO_DIR)) {
      fs.unlinkSync(path.join(AUDIO_DIR, file));
    }
  }
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const processedScenes = [];
  let totalFrames = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    console.log(`\n📌 Scene ${i + 1}/${scenes.length}: [${scene.type}] ${scene.title || scene.heading || ""}`);

    let durationInFrames;
    let audioFile = null;
    let timing = {};

    if (scene.narration) {
      const audioPath = path.join(AUDIO_DIR, `scene-${i}.mp3`);
      const { wordTimestamps } = await generateAudioWithTimestamps(scene.narration, audioPath, voiceId);

      const durationSec = await getAudioDuration(audioPath);
      durationInFrames = Math.ceil((durationSec + 1.5) * FPS);
      audioFile = `audio/scene-${i}.mp3`;

      timing = calculateSceneTiming(scene, durationSec, wordTimestamps);

      console.log(`  ⏱️  Duration: ${durationSec.toFixed(1)}s → ${durationInFrames} frames`);
      console.log(`  📊  Speaking rate: ${timing.wordsPerSecond.toFixed(1)} words/sec → ${timing.framesPerWord} frames/word`);
      if (timing.bulletStartFrames.length > 0) {
        console.log(`  📍  Bullet starts: ${timing.bulletStartFrames.map(f => `${(f / FPS).toFixed(1)}s`).join(", ")}`);
      }
    } else {
      durationInFrames = scene.duration_seconds
        ? Math.ceil(scene.duration_seconds * FPS)
        : 4 * FPS;
    }

    processedScenes.push({
      ...scene,
      durationInFrames,
      audioFile,
      ...timing,
    });

    totalFrames += durationInFrames;
  }

  return { processedScenes, totalFrames };
}

// ============================================================
//  Render
// ============================================================

async function renderVideo(processedScenes, totalFrames, outputFileName) {
  console.log("\n🎬 Bundling Remotion project...");

  const entryPoint = path.resolve(PIPELINE_ROOT, "src", "index.jsx");
  const bundleLocation = await bundle({ entryPoint, publicDir: PUBLIC_DIR });

  console.log("✅ Bundle ready");

  const inputProps = {
    scenes: processedScenes,
    totalDurationInFrames: totalFrames,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "VideoLesson",
    inputProps,
  });

  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`🎥 Rendering video (${totalFrames} frames, ${(totalFrames / FPS).toFixed(1)}s)...`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r   Rendering: ${(progress * 100).toFixed(0)}%`);
    },
  });

  console.log(`\n\n✅ VIDEO READY: ${outputPath}`);
  return outputPath;
}

// ============================================================
//  Main
// ============================================================

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error("Usage: node create-video.mjs <path-to-video-script.json>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(scriptPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`ERROR: Video script not found: ${resolvedPath}`);
    process.exit(1);
  }

  console.log("═══════════════════════════════════════════════");
  console.log("  Chatting Wizard School — Video Generator v2");
  console.log("═══════════════════════════════════════════════\n");

  const videoScript = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  console.log(`📄 Script: "${videoScript.title}"`);
  console.log(`📊 Scenes: ${videoScript.scenes.length}`);

  const { processedScenes, totalFrames } = await processScenes(videoScript);
  console.log(`\n📊 Total duration: ${(totalFrames / FPS).toFixed(1)} seconds`);

  const safeName = videoScript.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const outputFileName = `${safeName}.mp4`;

  await renderVideo(processedScenes, totalFrames, outputFileName);
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
});
