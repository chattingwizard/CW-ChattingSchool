/**
 * WhiteboardOutroScene v2 — Lesson ending / recall question.
 * Clean design with animated checkmark.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DrawnCheckmark } from "../components/DrawnPath";
import { WrittenText } from "../components/WrittenText";
import {
  FONT,
  COLORS,
  FontImport,
  WarmBackground,
  TopBar,
  Watermark,
  CornerMarks,
  ProgressBar,
  AnimatedBackground,
} from "../components/Brand";

export const WhiteboardOutroScene = ({
  title,
  subtitle,
  framesPerWord = 6,
  sceneProgress,
  sectionLabel,
}) => {
  const frame = useCurrentFrame();
  const headingFPW = Math.max(2, Math.round(framesPerWord * 0.5));

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardScale = interpolate(frame, [0, 15], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <FontImport />
      <WarmBackground />
      <AnimatedBackground />
      <TopBar height={44} sectionLabel={sectionLabel || ""} />
      <CornerMarks />

      {/* Centered content */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 22,
              padding: "46px 76px 54px",
              boxShadow: `0 6px 32px ${COLORS.cardShadow}, 0 2px 8px rgba(0,0,0,0.04)`,
              border: `1.5px solid ${COLORS.cardBorder}`,
              borderTop: `5px solid ${COLORS.primary}`,
            }}
          >
            <svg
              style={{
                width: 90,
                height: 90,
                marginBottom: 18,
                overflow: "visible",
              }}
            >
              <DrawnCheckmark
                x={8}
                y={8}
                size={74}
                startFrame={5}
                duration={18}
                stroke={COLORS.green}
                strokeWidth={5}
              />
            </svg>

            <h2
              style={{
                color: COLORS.text,
                fontSize: 44,
                fontWeight: 700,
                margin: 0,
              }}
            >
              <WrittenText
                text={title || "Lesson Complete!"}
                startFrame={15}
                framesPerWord={headingFPW}
              />
            </h2>

            {subtitle && (
              <p
                style={{
                  color: COLORS.textLight,
                  fontSize: 24,
                  fontWeight: 500,
                  marginTop: 14,
                  opacity: interpolate(frame, [35, 55], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <Watermark />
      {typeof sceneProgress === "number" && (
        <ProgressBar progress={sceneProgress} />
      )}
    </AbsoluteFill>
  );
};
