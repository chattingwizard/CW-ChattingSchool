import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

/**
 * An SVG path that animates as if being drawn by a hand.
 * Uses the strokeDashoffset technique with normalized pathLength.
 */
export const DrawnPath = ({
  d,
  startFrame = 0,
  duration = 20,
  stroke = "#2d2d2d",
  strokeWidth = 3,
  fill = "none",
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const NORMALIZED_LENGTH = 1000;

  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={NORMALIZED_LENGTH}
      strokeDasharray={NORMALIZED_LENGTH}
      strokeDashoffset={NORMALIZED_LENGTH * (1 - progress)}
      opacity={opacity}
    />
  );
};

/**
 * A hand-drawn style underline.
 */
export const DrawnUnderline = ({
  x,
  y,
  width,
  startFrame = 0,
  duration = 15,
  stroke = "#2563eb",
  strokeWidth = 3,
}) => {
  // Slightly wavy line for hand-drawn feel
  const midY = y + 2;
  const d = `M ${x} ${y} Q ${x + width * 0.25} ${midY + 3}, ${x + width * 0.5} ${midY} Q ${x + width * 0.75} ${midY - 2}, ${x + width} ${y + 1}`;

  return (
    <DrawnPath
      d={d}
      startFrame={startFrame}
      duration={duration}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

/**
 * A hand-drawn circle (for bullet points or highlighting).
 */
export const DrawnCircle = ({
  cx,
  cy,
  r,
  startFrame = 0,
  duration = 12,
  stroke = "#2d2d2d",
  strokeWidth = 2.5,
  fill = "none",
}) => {
  // Approximate circle with bezier curves for hand-drawn feel
  const d = `M ${cx} ${cy - r} 
    C ${cx + r * 0.6} ${cy - r * 1.05}, ${cx + r * 1.05} ${cy - r * 0.4}, ${cx + r} ${cy}
    C ${cx + r * 1.02} ${cy + r * 0.5}, ${cx + r * 0.5} ${cy + r * 1.05}, ${cx} ${cy + r}
    C ${cx - r * 0.55} ${cy + r * 1.02}, ${cx - r * 1.05} ${cy + r * 0.45}, ${cx - r} ${cy}
    C ${cx - r * 1.02} ${cy - r * 0.5}, ${cx - r * 0.55} ${cy - r * 1.05}, ${cx} ${cy - r}`;

  return (
    <DrawnPath
      d={d}
      startFrame={startFrame}
      duration={duration}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
    />
  );
};

/**
 * A hand-drawn arrow.
 */
export const DrawnArrow = ({
  fromX,
  fromY,
  toX,
  toY,
  startFrame = 0,
  duration = 15,
  stroke = "#2d2d2d",
  strokeWidth = 2.5,
}) => {
  // Arrow line
  const lineD = `M ${fromX} ${fromY} L ${toX} ${toY}`;

  // Arrowhead
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const headLen = 15;
  const a1x = toX - headLen * Math.cos(angle - 0.4);
  const a1y = toY - headLen * Math.sin(angle - 0.4);
  const a2x = toX - headLen * Math.cos(angle + 0.4);
  const a2y = toY - headLen * Math.sin(angle + 0.4);
  const headD = `M ${a1x} ${a1y} L ${toX} ${toY} L ${a2x} ${a2y}`;

  return (
    <>
      <DrawnPath
        d={lineD}
        startFrame={startFrame}
        duration={duration}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <DrawnPath
        d={headD}
        startFrame={startFrame + duration - 5}
        duration={8}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </>
  );
};

/**
 * A hand-drawn checkmark.
 */
export const DrawnCheckmark = ({
  x,
  y,
  size = 60,
  startFrame = 0,
  duration = 15,
  stroke = "#16a34a",
  strokeWidth = 4,
}) => {
  const d = `M ${x} ${y + size * 0.5} L ${x + size * 0.35} ${y + size * 0.85} L ${x + size} ${y + size * 0.1}`;

  return (
    <DrawnPath
      d={d}
      startFrame={startFrame}
      duration={duration}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};
