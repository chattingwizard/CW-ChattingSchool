import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

/**
 * Text that appears word by word, synced to narration speed.
 *
 * Props:
 * - text: the text to display
 * - startFrame: when to start the animation (default 0)
 * - framesPerWord: frames per word (from narration speed)
 * - style: inline styles
 */
export const WrittenText = ({
  text,
  startFrame = 0,
  framesPerWord = 6,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  return (
    <span style={{ display: "inline", ...style }}>
      {words.map((word, i) => {
        const wordStart = startFrame + i * framesPerWord;
        const opacity = interpolate(
          frame,
          [wordStart, wordStart + Math.max(3, framesPerWord * 0.6)],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const y = interpolate(
          frame,
          [wordStart, wordStart + Math.max(3, framesPerWord * 0.6)],
          [6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              display: "inline-block",
              marginRight: "0.3em",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};
