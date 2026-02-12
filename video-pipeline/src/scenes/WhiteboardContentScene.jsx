import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { WrittenText } from "../components/WrittenText";
import { DrawnCircle, DrawnUnderline } from "../components/DrawnPath";

const FONT = '"Patrick Hand", "Segoe Print", cursive';
const BG = "#f7f3eb";

const PANEL_COLORS = [
  { bg: "#e8f4fd", border: "#bdd9f0", accent: "#2563eb" },
  { bg: "#e8f8e8", border: "#b8e8b8", accent: "#16a34a" },
  { bg: "#f3e8fd", border: "#d4b8f0", accent: "#7c3aed" },
  { bg: "#fff3e0", border: "#f0d8a8", accent: "#d97706" },
  { bg: "#fde8e8", border: "#f0b8b8", accent: "#dc2626" },
];

export const WhiteboardContentScene = ({
  heading,
  points = [],
  text,
  framesPerWord = 8,
  bulletStartFrames = [],
  headingDurationFrames = 45,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingFPW = Math.max(2, Math.round(framesPerWord * 0.4));

  // Fallback bullet timing if not provided
  const effectiveBulletStarts = bulletStartFrames.length > 0
    ? bulletStartFrames
    : points.map((_, i) => headingDurationFrames + 10 + i * 50);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>
      {/* Colored top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(90deg, #2563eb, #7c3aed)",
        }}
      />

      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 0,
          width: 6,
          bottom: 0,
          backgroundColor: "#2563eb",
          opacity: 0.3,
        }}
      />

      {/* Subtle grid lines */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        preserveAspectRatio="none"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={`${(i + 1) * 5.5}%`}
            x2="100%"
            y2={`${(i + 1) * 5.5}%`}
            stroke="#e8e3d8"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "60px 100px 60px 80px",
          height: "100%",
        }}
      >
        {/* Heading area */}
        {heading && (
          <div
            style={{
              position: "relative",
              marginBottom: 36,
              marginLeft: 20,
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 14,
                padding: "18px 32px 24px",
                display: "inline-block",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1.5px solid #e0dbd0",
                position: "relative",
              }}
            >
              <h2
                style={{
                  color: "#2d2d2d",
                  fontSize: 50,
                  fontWeight: 400,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                <WrittenText
                  text={heading}
                  startFrame={5}
                  framesPerWord={headingFPW}
                />
              </h2>

              <svg
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 32,
                  width: Math.min(heading.length * 24, 700),
                  height: 15,
                  overflow: "visible",
                }}
              >
                <DrawnUnderline
                  x={0}
                  y={8}
                  width={Math.min(heading.length * 24, 700)}
                  startFrame={5 + heading.split(" ").length * headingFPW + 3}
                  duration={12}
                  stroke="#2563eb"
                  strokeWidth={2.5}
                />
              </svg>
            </div>
          </div>
        )}

        {/* Bullet points as colored cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginLeft: 20 }}>
          {points.map((point, i) => {
            const bulletStart = effectiveBulletStarts[i] || (headingDurationFrames + i * 50);
            const colors = PANEL_COLORS[i % PANEL_COLORS.length];

            const cardOpacity = interpolate(
              frame,
              [bulletStart, bulletStart + 12],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            const cardProgress = spring({
              frame: Math.max(0, frame - bulletStart),
              fps,
              config: { damping: 200 },
            });
            const cardY = interpolate(cardProgress, [0, 1], [25, 0]);
            const cardScale = interpolate(cardProgress, [0, 1], [0.97, 1]);

            return (
              <div
                key={i}
                style={{
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: 16,
                  padding: "18px 28px",
                  display: "flex",
                  alignItems: "flex-start",
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px) scale(${cardScale})`,
                  position: "relative",
                  borderLeft: `5px solid ${colors.accent}`,
                }}
              >
                {/* Drawn bullet circle */}
                <svg
                  style={{
                    width: 28,
                    height: 28,
                    marginRight: 18,
                    marginTop: 6,
                    flexShrink: 0,
                    overflow: "visible",
                  }}
                >
                  <DrawnCircle
                    cx={14}
                    cy={14}
                    r={10}
                    startFrame={bulletStart + 3}
                    duration={8}
                    stroke={colors.accent}
                    strokeWidth={2.5}
                  />
                </svg>

                {/* Bullet text — synced to narration speed */}
                <span
                  style={{
                    color: "#2d2d2d",
                    fontSize: 34,
                    lineHeight: 1.5,
                  }}
                >
                  <WrittenText
                    text={point}
                    startFrame={bulletStart + 6}
                    framesPerWord={framesPerWord}
                  />
                </span>
              </div>
            );
          })}
        </div>

        {/* Plain text (when no bullets) */}
        {text && points.length === 0 && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "24px 32px",
              marginLeft: 20,
              border: "1.5px solid #e0dbd0",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <p
              style={{
                color: "#2d2d2d",
                fontSize: 34,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <WrittenText
                text={text}
                startFrame={headingDurationFrames + 5}
                framesPerWord={framesPerWord}
              />
            </p>
          </div>
        )}
      </div>

      {/* Bottom branding */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 36,
          color: "#b8b4aa",
          fontSize: 16,
          fontFamily: FONT,
        }}
      >
        Chatting Wizard School
      </div>

      {/* Decorative corner element */}
      <svg
        style={{
          position: "absolute",
          bottom: 50,
          left: 30,
          width: 60,
          height: 60,
          opacity: 0.15,
        }}
      >
        <circle cx="20" cy="20" r="12" fill="none" stroke="#2563eb" strokeWidth="1.5" />
        <circle cx="45" cy="40" r="8" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
      </svg>
    </AbsoluteFill>
  );
};
