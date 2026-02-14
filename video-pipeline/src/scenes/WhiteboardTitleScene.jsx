/**
 * WhiteboardTitleScene v2 — Opening title card.
 * Clean, warm design with animated title and drawn underline.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { WrittenText } from "../components/WrittenText";
import { DrawnUnderline } from "../components/DrawnPath";
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

export const WhiteboardTitleScene = ({
  title,
  subtitle,
  framesPerWord = 6,
  sceneProgress,
  sectionLabel,
}) => {
  const frame = useCurrentFrame();

  const titleWords = title ? title.split(" ").length : 0;
  const headingFPW = Math.max(2, Math.round(framesPerWord * 0.4));
  const titleEndFrame = 5 + titleWords * headingFPW + 5;

  const subtitleOpacity = interpolate(
    frame,
    [titleEndFrame + 5, titleEndFrame + 25],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const subtitleSlide = interpolate(
    frame,
    [titleEndFrame + 5, titleEndFrame + 25],
    [10, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", width: "76%" }}>
          {/* Title card */}
          <div
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 20,
              padding: "44px 60px 50px",
              boxShadow: `0 6px 32px ${COLORS.cardShadow}, 0 2px 8px rgba(0,0,0,0.04)`,
              position: "relative",
              border: `1.5px solid ${COLORS.cardBorder}`,
            }}
          >
            <h1
              style={{
                color: COLORS.text,
                fontSize: 58,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              <WrittenText
                text={title || ""}
                startFrame={5}
                framesPerWord={headingFPW}
              />
            </h1>

            {/* Drawn underline */}
            <svg
              style={{
                position: "absolute",
                bottom: 34,
                left: "50%",
                transform: "translateX(-50%)",
                width: 420,
                height: 20,
                overflow: "visible",
              }}
            >
              <DrawnUnderline
                x={0}
                y={10}
                width={420}
                startFrame={titleEndFrame}
                duration={15}
                stroke={COLORS.primary}
                strokeWidth={3.5}
              />
            </svg>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p
              style={{
                color: COLORS.textLight,
                fontSize: 24,
                fontWeight: 600,
                marginTop: 24,
                opacity: subtitleOpacity,
                transform: `translateY(${subtitleSlide}px)`,
                letterSpacing: 1,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <Watermark />
      {typeof sceneProgress === "number" && (
        <ProgressBar progress={sceneProgress} />
      )}
    </AbsoluteFill>
  );
};
