/**
 * Chatting Wizard — Shared branding for all video scenes.
 * VISIBLE, BOLD branding — not subtle.
 */
import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate } from "remotion";

// ── Colors ──────────────────────────────────────────────
export const CW_BLUE = "#0b7dba";
export const CW_BLUE_MID = "#1a90c8";
export const CW_BLUE_LIGHT = "#4db0d9";
export const CW_BLUE_PALE = "#d4edf8";

export const TEXT_COLOR = "#1a2a3a";
export const TEXT_LIGHT = "#5a6f80";
export const CARD_BG = "#ffffff";
export const BORDER_COLOR = "#b8d8ea";

// ── Font ────────────────────────────────────────────────
export const FONT = '"Poppins", "Segoe UI", system-ui, sans-serif';

// ── Google Fonts import ─────────────────────────────────
export const FontImport = () => (
  <style>
    {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');`}
  </style>
);

// ── Branded background with visible gradient + decorations ──
export const BrandedBackground = () => (
  <>
    {/* Main gradient — clearly blue, NOT white */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(160deg, #b8ddf0 0%, #d6ecf6 35%, #e8f3fa 70%, #d0e7f3 100%)",
      }}
    />

    {/* Subtle dot pattern for texture */}
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1.5" fill="#0b7dba" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>

    {/* Large decorative circle top-right */}
    <div
      style={{
        position: "absolute",
        top: -80,
        right: -80,
        width: 350,
        height: 350,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(11,125,186,0.08) 0%, transparent 70%)",
      }}
    />

    {/* Small decorative circle bottom-left */}
    <div
      style={{
        position: "absolute",
        bottom: -50,
        left: -50,
        width: 250,
        height: 250,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(11,125,186,0.06) 0%, transparent 70%)",
      }}
    />
  </>
);

// ── Top branded header bar with gradient ─────────────────
export const TopBar = ({ height = 50 }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height,
      background: `linear-gradient(135deg, #063f5e 0%, ${CW_BLUE} 50%, ${CW_BLUE_MID} 100%)`,
      display: "flex",
      alignItems: "center",
      paddingLeft: 24,
      paddingRight: 24,
      boxShadow: "0 3px 20px rgba(11,125,186,0.25)",
    }}
  >
    <Img
      src={staticFile("logo.png")}
      style={{ width: 110, height: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }}
    />
  </div>
);

// ── Decorative corner marks — adds professional framing ──
export const CornerMarks = ({ inset = 28, size = 40, thickness = 3, color = CW_BLUE, opacity = 0.18 }) => {
  const style = (top, right, bottom, left, rotDeg) => ({
    position: "absolute",
    top, right, bottom, left,
    width: size, height: size,
    opacity,
    transform: `rotate(${rotDeg}deg)`,
  });
  const L = (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} fill="none">
      <path d={`M 0 ${size} L 0 0 L ${size} 0`} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
    </svg>
  );
  return (
    <>
      <div style={style(inset + 50, undefined, undefined, inset, 0)}>{L}</div>
      <div style={style(inset + 50, inset, undefined, undefined, 90)}>{L}</div>
      <div style={style(undefined, undefined, inset, inset, 270)}>{L}</div>
      <div style={style(undefined, inset, inset, undefined, 180)}>{L}</div>
    </>
  );
};

// ── Bottom accent line ───────────────────────────────────
export const BottomAccentLine = ({ y = 62 }) => (
  <div
    style={{
      position: "absolute",
      bottom: y,
      left: "10%",
      right: "10%",
      height: 1,
      background: `linear-gradient(90deg, transparent, ${CW_BLUE}33, ${CW_BLUE}55, ${CW_BLUE}33, transparent)`,
    }}
  />
);

// ── Floating accent dots — small circles for visual richness ──
export const FloatingDots = () => (
  <>
    {/* Top-right cluster */}
    <div style={{ position: "absolute", top: 100, right: 65, width: 10, height: 10, borderRadius: "50%", backgroundColor: CW_BLUE, opacity: 0.1 }} />
    <div style={{ position: "absolute", top: 125, right: 90, width: 6, height: 6, borderRadius: "50%", backgroundColor: CW_BLUE_MID, opacity: 0.13 }} />
    <div style={{ position: "absolute", top: 80, right: 110, width: 8, height: 8, borderRadius: "50%", backgroundColor: CW_BLUE_LIGHT, opacity: 0.1 }} />
    {/* Bottom-left cluster */}
    <div style={{ position: "absolute", bottom: 100, left: 55, width: 9, height: 9, borderRadius: "50%", backgroundColor: CW_BLUE, opacity: 0.1 }} />
    <div style={{ position: "absolute", bottom: 130, left: 80, width: 6, height: 6, borderRadius: "50%", backgroundColor: CW_BLUE_MID, opacity: 0.12 }} />
    {/* Mid-right */}
    <div style={{ position: "absolute", top: "55%", right: 40, width: 12, height: 12, borderRadius: "50%", backgroundColor: CW_BLUE_PALE, opacity: 0.35 }} />
    {/* Mid-left */}
    <div style={{ position: "absolute", top: "40%", left: 30, width: 14, height: 14, borderRadius: "50%", backgroundColor: CW_BLUE_PALE, opacity: 0.3 }} />
  </>
);

// ── Side accent bar (decorative vertical line on right) ──
export const SideAccentBar = ({ side = "right" }) => (
  <div
    style={{
      position: "absolute",
      top: 80,
      [side]: 0,
      width: 4,
      height: 120,
      background: `linear-gradient(to bottom, ${CW_BLUE}44, transparent)`,
      borderRadius: 2,
    }}
  />
);

// ── Watermark — VISIBLE (bottom-right, larger) ──────────
export const Watermark = () => (
  <div
    style={{
      position: "absolute",
      bottom: 22,
      right: 36,
      display: "flex",
      alignItems: "center",
      gap: 10,
      opacity: 0.5,
    }}
  >
    <Img
      src={staticFile("logo.png")}
      style={{ width: 50, height: "auto", objectFit: "contain" }}
    />
    <span
      style={{
        fontSize: 18,
        color: CW_BLUE,
        fontFamily: FONT,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      Chatting Wizard School
    </span>
  </div>
);
