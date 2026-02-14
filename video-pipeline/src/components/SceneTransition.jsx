/**
 * Scene Transition — Wraps each scene with fade + scale entrance.
 * Creates smooth transitions between scenes instead of hard cuts.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const SceneTransition = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  const FADE_IN_FRAMES = 10;

  // Smooth fade in at start of scene
  const fadeIn = interpolate(frame, [0, FADE_IN_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle scale up (0.985 → 1.0) for a gentle zoom-in feel
  const scaleIn = interpolate(frame, [0, FADE_IN_FRAMES], [0.985, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fadeIn,
        transform: `scale(${scaleIn})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
