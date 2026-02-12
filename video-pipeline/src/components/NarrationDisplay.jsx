/**
 * NarrationDisplay — Main visual for content scenes.
 * Shows the narrated text synced word-by-word with audio.
 * What you SEE = what you HEAR. No separate bullet points.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { FONT, CW_BLUE, TEXT_COLOR, CARD_BG, BORDER_COLOR } from "./Brand";

export const NarrationDisplay = ({
  wordTimestamps = [],
  fontSize = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!wordTimestamps || wordTimestamps.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: CARD_BG,
        borderRadius: 18,
        padding: "40px 50px",
        boxShadow: "0 4px 24px rgba(11,125,186,0.1)",
        border: `1.5px solid ${BORDER_COLOR}`,
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

        // Word appears when narrator says it
        const opacity = interpolate(
          frame,
          [wordStartFrame - 1, wordStartFrame + fadeFrames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Gentle slide up
        const y = interpolate(
          frame,
          [wordStartFrame - 1, wordStartFrame + fadeFrames],
          [6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // "Active" glow — word is bright when just spoken
        const activeProgress = interpolate(
          frame,
          [wordStartFrame, wordStartFrame + 15],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const isActive = activeProgress > 0.05;
        const fontWeight = isActive ? 600 : 400;
        const color = isActive
          ? interpolate(activeProgress, [0, 1], [0, 1]) > 0.3
            ? CW_BLUE
            : TEXT_COLOR
          : TEXT_COLOR;

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              display: "inline-block",
              marginRight: "0.3em",
              fontSize,
              fontWeight,
              color,
              transition: "color 0.3s ease",
            }}
          >
            {wt.word}
          </span>
        );
      })}
    </div>
  );
};
