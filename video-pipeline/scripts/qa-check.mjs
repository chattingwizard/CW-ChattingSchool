/**
 * QA Check v2 — Strict automated pre-render validation.
 *
 * Usage: node video-pipeline/scripts/qa-check.mjs <path-to-video-script.json>
 *
 * Three severity levels:
 *   FAIL  — Blocks render. Must fix.
 *   WARN  — Should fix. Render allowed but flag review.
 *   PASS  — Green. No action needed.
 *
 * v2 additions:
 *   - Enforces rich layouts on every content scene (no plain bullet fallback)
 *   - Minimum visual diversity (multiple types per scene)
 *   - All visuals must have trigger words (FAIL, not WARN)
 *   - Validates highlight-box or callout exists when numbers/money in narration
 *   - Checks sectionLabel on every scene
 *   - Validates layout is a known type
 *   - Prints component catalog on fail for reference
 */

import fs from "fs";
import path from "path";

const PASS = "✅";
const FAIL = "❌";
const WARN = "⚠️";

// ── Known layouts and visual types ──────────────────────

const KNOWN_LAYOUTS = [
  "flow-chain",
  "icon-grid",
  "definition-cards",
  "summary-row",
];

const RICH_VISUAL_TYPES = [
  "definition",
  "summary-card",
  "callout",
  "flow-node",
  "icon-card",
  "stat",
  "quote",
  "comparison",
  "step",
  "highlight-box",
];

const EMPHASIS_TYPES = ["callout", "highlight-box", "quote"];

// ── Check functions ─────────────────────────────────────

function checkDuration(script) {
  let totalWords = 0;
  for (const scene of script.scenes) {
    if (scene.narration) {
      totalWords += scene.narration.split(/\s+/).length;
    }
  }
  const estimatedDuration = totalWords / 2.5;

  if (estimatedDuration > 180) {
    return {
      status: "fail",
      message: `Estimated ${estimatedDuration.toFixed(0)}s (${totalWords} words) exceeds 2.5 min limit`,
    };
  }
  return {
    status: "pass",
    message: `Estimated ${estimatedDuration.toFixed(0)}s (${totalWords} words) — under 2.5 min`,
  };
}

function checkEveryContentSceneHasLayout(script) {
  const issues = [];

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (scene.type !== "wb-content" && scene.type !== "content") continue;

    if (!scene.layout) {
      issues.push(
        `Scene ${i + 1} ("${scene.heading || "untitled"}"): NO layout defined. Every content scene must use a layout (${KNOWN_LAYOUTS.join(", ")})`
      );
    } else if (!KNOWN_LAYOUTS.includes(scene.layout)) {
      issues.push(
        `Scene ${i + 1}: Unknown layout "${scene.layout}". Valid: ${KNOWN_LAYOUTS.join(", ")}`
      );
    }
  }

  if (issues.length > 0) {
    return {
      status: "fail",
      message: `Content scenes without proper layout:\n    ${issues.join("\n    ")}`,
    };
  }
  return {
    status: "pass",
    message: "All content scenes have a valid layout defined",
  };
}

function checkVisualElementsPerScene(script) {
  const issues = [];
  let contentScenes = 0;

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (scene.type !== "wb-content" && scene.type !== "content") continue;
    contentScenes++;

    const visuals = scene.visuals || [];
    const richVisuals = visuals.filter((v) => RICH_VISUAL_TYPES.includes(v.type));

    if (richVisuals.length < 2) {
      issues.push(
        `Scene ${i + 1} ("${scene.heading || "untitled"}"): only ${richVisuals.length} visual element(s). Minimum 2 required.`
      );
    }

    // Check visual type diversity — should have at least 2 different types
    const uniqueTypes = new Set(richVisuals.map((v) => v.type));
    if (richVisuals.length >= 2 && uniqueTypes.size < 2) {
      issues.push(
        `Scene ${i + 1}: All visuals are type "${[...uniqueTypes][0]}". Mix types for visual variety.`
      );
    }
  }

  if (issues.length > 0) {
    return {
      status: "fail",
      message: `Visual element issues:\n    ${issues.join("\n    ")}`,
    };
  }
  return {
    status: "pass",
    message: `All ${contentScenes} content scenes have 2+ visuals with type diversity`,
  };
}

function checkAllVisualsHaveTriggers(script) {
  const issues = [];

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (!scene.visuals) continue;

    const noTrigger = scene.visuals.filter((v) => !v.trigger);
    if (noTrigger.length > 0) {
      const types = noTrigger.map((v) => v.type).join(", ");
      issues.push(
        `Scene ${i + 1}: ${noTrigger.length} visual(s) missing "trigger" (${types}). Audio sync won't work.`
      );
    }
  }

  if (issues.length > 0) {
    return {
      status: "fail",
      message: `Visuals without trigger words (breaks audio-visual sync):\n    ${issues.join("\n    ")}`,
    };
  }
  return {
    status: "pass",
    message: "All visuals have trigger words for audio-visual sync",
  };
}

function checkEmphasisElements(script) {
  const issues = [];

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (scene.type !== "wb-content" && scene.type !== "content") continue;

    const visuals = scene.visuals || [];
    const hasEmphasis = visuals.some((v) => EMPHASIS_TYPES.includes(v.type));

    if (!hasEmphasis) {
      issues.push(
        `Scene ${i + 1} ("${scene.heading || "untitled"}"): No callout, highlight-box, or quote. Every content scene needs at least one emphasis element.`
      );
    }
  }

  if (issues.length > 0) {
    return {
      status: "warn",
      message: `Scenes missing emphasis elements (callout/highlight-box/quote):\n    ${issues.join("\n    ")}`,
    };
  }
  return {
    status: "pass",
    message: "All content scenes have at least one emphasis element",
  };
}

function checkSectionLabels(script) {
  const issues = [];

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (!scene.sectionLabel) {
      issues.push(`Scene ${i + 1} ("${scene.title || scene.heading || "untitled"}"): missing sectionLabel`);
    }
  }

  if (issues.length > 0) {
    return {
      status: "fail",
      message: `Scenes without sectionLabel (required for top bar):\n    ${issues.join("\n    ")}`,
    };
  }
  return {
    status: "pass",
    message: "All scenes have sectionLabel defined",
  };
}

function checkIconsExist(script) {
  const KNOWN_ICONS = [
    "dollar", "chat", "user", "globe", "target", "star",
    "check", "x", "arrow", "lock", "calendar", "film",
    "building", "percent", "heart", "eye", "sparkle",
    "shield", "users", "trending",
  ];
  const issues = [];

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (!scene.visuals) continue;

    for (const v of scene.visuals) {
      if (v.icon && !KNOWN_ICONS.includes(v.icon)) {
        issues.push(
          `Scene ${i + 1}: Unknown icon "${v.icon}" on ${v.type}. Known: ${KNOWN_ICONS.join(", ")}`
        );
      }
    }
  }

  if (issues.length > 0) {
    return {
      status: "fail",
      message: `Unknown icons (will render blank):\n    ${issues.join("\n    ")}`,
    };
  }
  return { status: "pass", message: "All icons are valid" };
}

function checkColorsExist(script) {
  const issues = [];

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (!scene.visuals) continue;

    for (const v of scene.visuals) {
      if (v.color && !/^#[0-9a-fA-F]{6}$/.test(v.color)) {
        issues.push(
          `Scene ${i + 1}: Invalid color "${v.color}" on ${v.type}. Must be #RRGGBB hex.`
        );
      }
    }
  }

  if (issues.length > 0) {
    return {
      status: "fail",
      message: `Invalid color values:\n    ${issues.join("\n    ")}`,
    };
  }
  return { status: "pass", message: "All colors are valid hex" };
}

function checkRecallQuestion(script) {
  const lastScene = script.scenes[script.scenes.length - 1];
  if (!lastScene) return { status: "fail", message: "No scenes found" };

  const narration = (lastScene.narration || "").toLowerCase();
  const hasQuestion =
    narration.includes("?") ||
    narration.includes("quick check") ||
    narration.includes("pause") ||
    narration.includes("the answer is");

  if (!hasQuestion) {
    return {
      status: "fail",
      message: "Last scene missing recall question. Must include ? or 'quick check' or 'the answer is'.",
    };
  }
  return { status: "pass", message: "Recall question present in last scene" };
}

function checkPracticalExample(script) {
  let hasExample = false;
  for (const scene of script.scenes) {
    const narration = (scene.narration || "").toLowerCase();
    const heading = (scene.heading || "").toLowerCase();
    if (
      narration.includes("example") ||
      narration.includes("for instance") ||
      narration.includes("imagine") ||
      narration.includes("let's say") ||
      narration.includes("here's how") ||
      narration.match(/\$\d+/) ||
      narration.match(/\d+%/)
    ) {
      hasExample = true;
      break;
    }
  }

  if (!hasExample) {
    return {
      status: "warn",
      message: "No practical example with numbers or scenarios detected",
    };
  }
  return { status: "pass", message: "Practical example with concrete numbers found" };
}

function checkSaleMantra(script) {
  const fullText = script.scenes
    .map((s) => s.narration || "")
    .join(" ")
    .toLowerCase();
  const hasMantra =
    fullText.includes("every conversation has one goal") ||
    fullText.includes("a sale") ||
    fullText.includes("the more you sell");

  if (!hasMantra) {
    return {
      status: "warn",
      message: 'Sale mantra not found. Add: "every conversation has one goal — a sale"',
    };
  }
  return { status: "pass", message: "Sale mantra present" };
}

function checkSceneCount(script) {
  const count = script.scenes.length;
  if (count < 3) {
    return {
      status: "fail",
      message: `Only ${count} scenes. Minimum: title + content + outro = 3`,
    };
  }
  if (count > 6) {
    return {
      status: "warn",
      message: `${count} scenes — may exceed 2.5 min. Consider splitting.`,
    };
  }
  return { status: "pass", message: `${count} scenes — good structure` };
}

function checkSceneStructure(script) {
  const issues = [];
  const first = script.scenes[0];
  const last = script.scenes[script.scenes.length - 1];

  if (first && !["wb-title", "title"].includes(first.type)) {
    issues.push(`First scene should be type "wb-title", got "${first.type}"`);
  }
  if (last && !["wb-outro", "outro"].includes(last.type)) {
    issues.push(`Last scene should be type "wb-outro", got "${last.type}"`);
  }

  // Check all scenes have narration
  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (!scene.narration || scene.narration.trim().length < 10) {
      issues.push(`Scene ${i + 1}: Missing or too-short narration`);
    }
  }

  if (issues.length > 0) {
    return {
      status: "fail",
      message: `Structure issues:\n    ${issues.join("\n    ")}`,
    };
  }
  return { status: "pass", message: "Correct structure: title → content → outro, all narrated" };
}

function checkVisualDensity(script) {
  const issues = [];

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    if (scene.type !== "wb-content" && scene.type !== "content") continue;

    const narration = scene.narration || "";
    const wordCount = narration.split(/\s+/).filter(Boolean).length;
    const visuals = scene.visuals || [];
    const visualCount = visuals.length;

    if (visualCount === 0) continue; // other checks catch this

    const ratio = Math.round(wordCount / visualCount);

    if (ratio > 30) {
      issues.push(
        `Scene ${i + 1} ("${scene.heading || "untitled"}"): ${wordCount} words / ${visualCount} visuals = ${ratio} words/visual. Max recommended: 25. Add more visuals or shorten narration.`
      );
    }
  }

  if (issues.length > 0) {
    return {
      status: "fail",
      message: `Low visual density (too much narration per visual — viewer sees nothing changing):\n    ${issues.join("\n    ")}`,
    };
  }
  return {
    status: "pass",
    message: "Visual density OK — enough visuals to cover narration",
  };
}

function checkLayoutDiversity(script) {
  const layouts = new Set();
  for (const scene of script.scenes) {
    if (scene.layout) layouts.add(scene.layout);
  }

  const contentScenes = script.scenes.filter(
    (s) => s.type === "wb-content" || s.type === "content"
  ).length;

  if (contentScenes >= 2 && layouts.size < 2) {
    return {
      status: "warn",
      message: `Only ${layouts.size} layout type(s) used across ${contentScenes} content scenes. Use different layouts for visual variety.`,
    };
  }
  return {
    status: "pass",
    message: `${layouts.size} different layout(s) across ${contentScenes} content scene(s) — good variety`,
  };
}

// ── Component catalog (printed on failure) ──────────────

function printComponentCatalog() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║              COMPONENT CATALOG — v3                      ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  LAYOUTS (set on content scene):                         ║
║  ├─ "flow-chain"       → Horizontal process diagram      ║
║  ├─ "icon-grid"        → 2×2 grid of concept cards       ║
║  ├─ "definition-cards" → Stacked term + definition cards  ║
║  └─ "summary-row"      → Horizontal compact cards         ║
║                                                          ║
║  VISUAL TYPES (inside "visuals" array):                  ║
║  ├─ "flow-node"     → Node in flow-chain (icon,label,val)║
║  ├─ "icon-card"     → Card for icon-grid (icon,term,desc)║
║  ├─ "definition"    → Term + definition for def-cards    ║
║  ├─ "summary-card"  → Compact card for summary-row       ║
║  ├─ "callout"       → Key message emphasis (red border)  ║
║  ├─ "highlight-box" → Big number + secondary text        ║
║  ├─ "quote"         → Italic quoted text                 ║
║  └─ "stat"          → Big number in colored circle       ║
║                                                          ║
║  EMPHASIS (min 1 per content scene):                     ║
║  callout | highlight-box | quote                         ║
║                                                          ║
║  ICONS: dollar, chat, user, globe, target, star, check,  ║
║  x, arrow, lock, calendar, film, building, percent,      ║
║  heart, eye, sparkle, shield, users, trending             ║
║                                                          ║
║  COLORS: #0b7dba (blue), #e67e22 (orange),              ║
║  #27ae60 (green), #8e44ad (purple), #e74c3c (red),      ║
║  #f39c12 (gold)                                          ║
║                                                          ║
║  EVERY visual needs: "trigger" (word in narration)       ║
║  EVERY scene needs: "sectionLabel"                       ║
╚══════════════════════════════════════════════════════════╝
`);
}

// ── Main ────────────────────────────────────────────────

function runQA(scriptPath) {
  const resolvedPath = path.resolve(scriptPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const script = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));

  console.log("══════════════════════════════════════════════");
  console.log("  QA Check v2 — Chatting Wizard School");
  console.log("══════════════════════════════════════════════\n");
  console.log(`📄 Script: "${script.title}"`);
  console.log(`📊 Scenes: ${script.scenes.length}\n`);

  const checks = [
    { name: "Scene structure (title→content→outro)", fn: checkSceneStructure },
    { name: "Scene count (3-6)", fn: checkSceneCount },
    { name: "Duration < 2.5 min", fn: checkDuration },
    { name: "Every content scene has layout", fn: checkEveryContentSceneHasLayout },
    { name: "Visual elements (min 2/scene, diverse)", fn: checkVisualElementsPerScene },
    { name: "Emphasis element per scene", fn: checkEmphasisElements },
    { name: "All visuals have trigger words", fn: checkAllVisualsHaveTriggers },
    { name: "Section labels on all scenes", fn: checkSectionLabels },
    { name: "Icons are valid", fn: checkIconsExist },
    { name: "Colors are valid hex", fn: checkColorsExist },
    { name: "Visual density (words/visual ratio)", fn: checkVisualDensity },
    { name: "Layout diversity", fn: checkLayoutDiversity },
    { name: "Recall question in outro", fn: checkRecallQuestion },
    { name: "Practical example present", fn: checkPracticalExample },
    { name: "Sale mantra included", fn: checkSaleMantra },
  ];

  let passes = 0;
  let fails = 0;
  let warns = 0;

  for (const check of checks) {
    const result = check.fn(script);
    const icon =
      result.status === "pass" ? PASS : result.status === "fail" ? FAIL : WARN;
    console.log(`${icon} ${check.name}`);
    console.log(`   ${result.message}\n`);

    if (result.status === "pass") passes++;
    else if (result.status === "fail") fails++;
    else warns++;
  }

  console.log("──────────────────────────────────────────────");
  console.log(
    `Results: ${passes} passed, ${warns} warnings, ${fails} failed`
  );

  if (fails > 0) {
    console.log(
      `\n❌ QA FAILED — Fix ${fails} issue(s) before rendering.\n`
    );
    printComponentCatalog();
    process.exit(1);
  } else if (warns > 0) {
    console.log(
      `\n⚠️  QA PASSED with ${warns} warning(s). Review before rendering.\n`
    );
    process.exit(0);
  } else {
    console.log(`\n✅ QA PASSED — All checks green. Ready to render!\n`);
    process.exit(0);
  }
}

// ── Entry point ─────────────────────────────────────────
const scriptPath = process.argv[2];
if (!scriptPath) {
  console.error("Usage: node qa-check.mjs <path-to-video-script.json>");
  process.exit(1);
}

runQA(scriptPath);
