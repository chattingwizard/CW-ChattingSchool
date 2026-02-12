/**
 * Visual elements for whiteboard scenes:
 * - DefinitionCard: Colored card with icon + term + definition
 * - SummaryCard: Compact card for review rows
 * - CalloutBox: Highlighted callout for mantras/key messages
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Icon } from "./Icons";
import { FONT, TEXT_COLOR } from "./Brand";

// Lighten a hex color for soft backgrounds
function lightenColor(hex, amount = 0.9) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(g + (255 - g) * amount)}, ${Math.round(b + (255 - b) * amount)})`;
}

// ─────────────────────────────────────────────
//  Definition Card — large card with icon, term, definition
// ─────────────────────────────────────────────

export const DefinitionCard = ({ term, definition, icon, color, startFrame = 0 }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = progress;
  const translateY = interpolate(progress, [0, 1], [30, 0]);
  const scale = interpolate(progress, [0, 1], [0.93, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        backgroundColor: lightenColor(color, 0.93),
        borderRadius: 18,
        padding: "22px 30px",
        marginBottom: 14,
        boxShadow: `0 3px 16px rgba(0,0,0,0.06)`,
        borderLeft: `7px solid ${color}`,
        border: `1.5px solid ${lightenColor(color, 0.8)}`,
        borderLeftWidth: 7,
        borderLeftColor: color,
        borderLeftStyle: "solid",
      }}
    >
      {/* Icon + Term row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundColor: lightenColor(color, 0.85),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={30} color={color} />
        </div>
        <span
          style={{
            fontSize: 42,
            fontWeight: 700,
            color,
            fontFamily: FONT,
            lineHeight: 1.2,
          }}
        >
          {term}
        </span>
      </div>
      {/* Definition text */}
      <div
        style={{
          fontSize: 28,
          color: TEXT_COLOR,
          fontFamily: FONT,
          fontWeight: 400,
          lineHeight: 1.45,
          paddingLeft: 66,
        }}
      >
        {definition}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  Summary Card — compact card for horizontal review row
// ─────────────────────────────────────────────

export const SummaryCard = ({ term, short, icon, color, startFrame = 0 }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = progress;
  const scale = interpolate(progress, [0, 1], [0.88, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: "22px 18px 18px",
        textAlign: "center",
        flex: 1,
        boxShadow: "0 3px 16px rgba(0,0,0,0.06)",
        borderTop: `6px solid ${color}`,
        border: `1.5px solid ${lightenColor(color, 0.7)}`,
        borderTopWidth: 6,
        borderTopColor: color,
        borderTopStyle: "solid",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: lightenColor(color, 0.88),
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={30} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 700, color, fontFamily: FONT, marginBottom: 4 }}>
        {term}
      </div>
      <div style={{ fontSize: 21, color: "#5a6f80", fontFamily: FONT, fontWeight: 400, lineHeight: 1.35 }}>
        {short}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  Callout Box — highlighted message (mantras, key rules)
// ─────────────────────────────────────────────

export const CalloutBox = ({ text, icon, color, startFrame = 0 }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = progress;
  const scale = interpolate(progress, [0, 1], [0.93, 1]);

  // Subtle pulse after appear
  const pulse = frame > startFrame + 14
    ? interpolate(
        frame,
        [startFrame + 14, startFrame + 30, startFrame + 46],
        [1, 1.015, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale * pulse})`,
        backgroundColor: lightenColor(color, 0.93),
        borderRadius: 18,
        padding: "24px 32px",
        marginTop: 20,
        display: "flex",
        alignItems: "center",
        gap: 18,
        border: `3px solid ${color}`,
        boxShadow: `0 4px 24px ${lightenColor(color, 0.7)}`,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: lightenColor(color, 0.85),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={32} color={color} />
      </div>
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: TEXT_COLOR,
          fontFamily: FONT,
          lineHeight: 1.35,
        }}
      >
        {text}
      </span>
    </div>
  );
};
