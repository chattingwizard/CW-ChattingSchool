/**
 * Chatting Wizard School — Design System v2
 *
 * WARM PAPER aesthetic with subtle grid.
 * Professional, educational, clean.
 */
import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate } from "remotion";

// ── Color Tokens ────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  paper: "#f7f3eb",
  paperDark: "#efe8db",
  grid: "#e4ddd0",

  // Primary brand
  primary: "#0b7dba",
  primaryDark: "#063f5e",
  primaryMid: "#1a90c8",
  primaryLight: "#d4edf8",

  // Accent palette
  orange: "#e67e22",
  orangeLight: "#fdebd0",
  green: "#27ae60",
  greenLight: "#d5f5e3",
  purple: "#8e44ad",
  purpleLight: "#ebdef0",
  red: "#e74c3c",
  redLight: "#fadbd8",
  gold: "#f39c12",
  goldLight: "#fef9e7",

  // Text
  text: "#2c3e50",
  textLight: "#7f8c8d",
  textMuted: "#bdc3c7",

  // Cards
  card: "#ffffff",
  cardBorder: "#e8e0d4",
  cardShadow: "rgba(44, 62, 80, 0.08)",
};

// Backward-compat named exports used by other files
export const CW_BLUE = COLORS.primary;
export const CW_BLUE_MID = COLORS.primaryMid;
export const CW_BLUE_LIGHT = "#4db0d9";
export const CW_BLUE_PALE = COLORS.primaryLight;
export const TEXT_COLOR = COLORS.text;
export const TEXT_LIGHT = COLORS.textLight;
export const CARD_BG = COLORS.card;
export const BORDER_COLOR = COLORS.cardBorder;

// ── Font ────────────────────────────────────────────────
export const FONT = '"Poppins", "Segoe UI", system-ui, sans-serif';

export const FontImport = () => (
  <style>
    {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');`}
  </style>
);

// ── Lighten helper ──────────────────────────────────────
export function lightenColor(hex, amount = 0.9) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(
    g + (255 - g) * amount
  )}, ${Math.round(b + (255 - b) * amount)})`;
}

// ── Warm Paper Background with Grid ─────────────────────
export const WarmBackground = () => (
  <>
    {/* Base warm paper */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLORS.paper,
      }}
    />

    {/* Subtle grid lines (notebook feel) */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(${COLORS.grid}44 1px, transparent 1px),
          linear-gradient(90deg, ${COLORS.grid}44 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    />

    {/* Warm gradient accents (very subtle) */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse at 85% 8%, rgba(230,126,34,0.035) 0%, transparent 45%),
          radial-gradient(ellipse at 8% 92%, rgba(11,125,186,0.03) 0%, transparent 45%)
        `,
      }}
    />
  </>
);

// Keep backward compat name
export const BrandedBackground = WarmBackground;

// ── Top Bar ─────────────────────────────────────────────
export const TopBar = ({ height = 44, sectionLabel = "" }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height,
      background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 55%, ${COLORS.primaryMid} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 24,
      paddingRight: 32,
      boxShadow: "0 2px 12px rgba(11,125,186,0.18)",
    }}
  >
    <Img
      src={staticFile("logo.png")}
      style={{
        width: 100,
        height: "auto",
        objectFit: "contain",
        filter: "brightness(0) invert(1)",
        opacity: 0.9,
      }}
    />
    {sectionLabel && (
      <span
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 15,
          fontFamily: FONT,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {sectionLabel}
      </span>
    )}
  </div>
);

// ── Progress Bar (bottom of video) ──────────────────────
export const ProgressBar = ({ progress = 0, color = COLORS.primary }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: "rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${Math.min(progress, 1) * 100}%`,
        backgroundColor: color,
        borderRadius: "0 2px 2px 0",
      }}
    />
  </div>
);

// ── Corner Marks ────────────────────────────────────────
export const CornerMarks = ({
  inset = 24,
  size = 28,
  thickness = 2,
  color = COLORS.primary,
  opacity = 0.1,
}) => {
  const s = (top, right, bottom, left, rot) => ({
    position: "absolute",
    top,
    right,
    bottom,
    left,
    width: size,
    height: size,
    opacity,
    transform: `rotate(${rot}deg)`,
  });
  const L = (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} fill="none">
      <path
        d={`M 0 ${size} L 0 0 L ${size} 0`}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    </svg>
  );
  return (
    <>
      <div style={s(inset + 44, undefined, undefined, inset, 0)}>{L}</div>
      <div style={s(inset + 44, inset, undefined, undefined, 90)}>{L}</div>
      <div style={s(undefined, undefined, inset + 10, inset, 270)}>{L}</div>
      <div style={s(undefined, inset, inset + 10, undefined, 180)}>{L}</div>
    </>
  );
};

// ── Watermark ───────────────────────────────────────────
export const Watermark = () => (
  <div
    style={{
      position: "absolute",
      bottom: 14,
      right: 32,
      display: "flex",
      alignItems: "center",
      gap: 8,
      opacity: 0.3,
    }}
  >
    <Img
      src={staticFile("logo.png")}
      style={{ width: 32, height: "auto", objectFit: "contain" }}
    />
    <span
      style={{
        fontSize: 13,
        color: COLORS.primary,
        fontFamily: FONT,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      Chatting Wizard School
    </span>
  </div>
);

// ── Animated Background — Soft floating shapes for "breathing" feel ──
export const AnimatedBackground = () => {
  const frame = useCurrentFrame();

  const shapes = [
    { x: 10, y: 15, size: 140, spd: 0.008, color: COLORS.primary },
    { x: 80, y: 70, size: 110, spd: 0.006, color: COLORS.orange },
    { x: 40, y: 85, size: 90, spd: 0.01, color: COLORS.purple },
    { x: 88, y: 22, size: 120, spd: 0.007, color: COLORS.green },
    { x: 55, y: 45, size: 80, spd: 0.012, color: COLORS.gold },
  ];

  return (
    <>
      {shapes.map((s, i) => {
        const yOff = Math.sin(frame * s.spd + i * 1.7) * 22;
        const xOff = Math.cos(frame * s.spd * 0.7 + i * 2.3) * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${s.color}08 0%, transparent 70%)`,
              transform: `translate(${xOff}px, ${yOff}px)`,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};

// ── Removed old decorative noise — replaced with AnimatedBackground ──
export const FloatingDots = () => null;
export const BottomAccentLine = () => null;
export const SideAccentBar = () => null;
