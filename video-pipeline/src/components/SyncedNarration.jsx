import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

/**
 * Displays narration text word-by-word, perfectly synced to ElevenLabs timestamps.
 *
 * Props:
 * - wordTimestamps: array of { word, start, end } (seconds) from ElevenLabs
 * - highlightWords: optional array of words to highlight with color
 * - highlightColor: color for highlighted words (default "#2563eb")
 * - fontSize: base font size (default 38)
 * - color: text color (default "#2d2d2d")
 * - lineHeight: line height (default 1.8)
 */
export const SyncedNarration = ({
  wordTimestamps = [],
  highlightWords = [],
  highlightColor = "#2563eb",
  fontSize = 38,
  color = "#2d2d2d",
  lineHeight = 1.8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!wordTimestamps || wordTimestamps.length === 0) return null;

  const currentTimeSec = frame / fps;

  // Normalize highlight words to lowercase for matching
  const hlSet = new Set(
    highlightWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: `4px 0px`,
        lineHeight,
        alignContent: "flex-start",
      }}
    >
      {wordTimestamps.map((wt, i) => {
        const wordStartFrame = Math.round(wt.start * fps);
        const fadeInDuration = 4; // frames for fade-in

        const opacity = interpolate(
          frame,
          [wordStartFrame - 1, wordStartFrame + fadeInDuration],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const y = interpolate(
          frame,
          [wordStartFrame - 1, wordStartFrame + fadeInDuration],
          [8, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Check if this word should be highlighted
        const cleanWord = wt.word.toLowerCase().replace(/[^a-z0-9]/g, "");
        const isHighlight = hlSet.has(cleanWord);

        // "Just spoken" glow effect — word glows briefly when first appearing
        const glowProgress = interpolate(
          frame,
          [wordStartFrame, wordStartFrame + 12],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const wordColor = isHighlight ? highlightColor : color;
        const scale = interpolate(glowProgress, [0, 1], [1, 1.05]);

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px) scale(${scale})`,
              display: "inline-block",
              marginRight: "0.32em",
              fontSize: isHighlight ? fontSize + 2 : fontSize,
              fontWeight: isHighlight ? 700 : 400,
              color: wordColor,
              textShadow: glowProgress > 0.1
                ? `0 0 ${8 * glowProgress}px rgba(37, 99, 235, ${0.3 * glowProgress})`
                : "none",
            }}
          >
            {wt.word}
          </span>
        );
      })}
    </div>
  );
};
