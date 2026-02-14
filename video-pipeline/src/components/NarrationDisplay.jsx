/**
 * NarrationDisplay v3 — Synced narration with keyword highlighting.
 * Key terms get an animated colored underline when spoken.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { FONT, COLORS } from "./Brand";

export const NarrationDisplay = ({
  wordTimestamps = [],
  fontSize = 38,
  highlightWords = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!wordTimestamps || wordTimestamps.length === 0) return null;

  // Normalize highlight words for matching
  const hlSet = new Set(
    highlightWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
  );

  return (
    <div
      style={{
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: "36px 44px",
        boxShadow: `0 3px 18px ${COLORS.cardShadow}`,
        border: `1.5px solid ${COLORS.cardBorder}`,
        fontFamily: FONT,
        lineHeight: 2.0,
        display: "flex",
        flexWrap: "wrap",
        alignContent: "flex-start",
      }}
    >
      {wordTimestamps.map((wt, i) => {
        const wordStartFrame = Math.round(wt.start * fps);
        const fadeFrames = 3;

        const opacity = interpolate(
          frame,
          [wordStartFrame - 1, wordStartFrame + fadeFrames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const y = interpolate(
          frame,
          [wordStartFrame - 1, wordStartFrame + fadeFrames],
          [6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Active glow when word is just spoken
        const activeProgress = interpolate(
          frame,
          [wordStartFrame, wordStartFrame + 15],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const isActive = activeProgress > 0.05;

        // Check if this is a highlighted keyword
        const cleanWord = wt.word.toLowerCase().replace(/[^a-z0-9]/g, "");
        const isHighlighted = hlSet.has(cleanWord);

        // Highlight underline animation
        const highlightWidth =
          isHighlighted && frame >= wordStartFrame
            ? interpolate(
                frame,
                [wordStartFrame, wordStartFrame + 8],
                [0, 100],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            : 0;

        const fontWeight = isHighlighted ? 700 : isActive ? 600 : 400;
        const color = isHighlighted
          ? COLORS.primary
          : isActive && activeProgress > 0.3
            ? COLORS.primary
            : COLORS.text;

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              display: "inline-block",
              marginRight: "0.3em",
              fontSize: isHighlighted ? fontSize + 1 : fontSize,
              fontWeight,
              color,
              position: "relative",
            }}
          >
            {wt.word}
            {/* Animated underline for highlighted words */}
            {isHighlighted && (
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  left: 0,
                  height: 3,
                  width: `${highlightWidth}%`,
                  backgroundColor: COLORS.primary,
                  borderRadius: 2,
                  opacity: 0.6,
                }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
};
