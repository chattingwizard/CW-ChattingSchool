import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DrawnCheckmark } from "../components/DrawnPath";
import { WrittenText } from "../components/WrittenText";
import { FONT, CW_BLUE, TEXT_COLOR, TEXT_LIGHT, CARD_BG, BORDER_COLOR, FontImport, BrandedBackground, TopBar, Watermark, CornerMarks, BottomAccentLine, FloatingDots } from "../components/Brand";

export const WhiteboardOutroScene = ({
  title,
  subtitle,
  framesPerWord = 6,
}) => {
  const frame = useCurrentFrame();
  const headingFPW = Math.max(2, Math.round(framesPerWord * 0.5));

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cardScale = interpolate(frame, [0, 15], [0.9, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <FontImport />
      <BrandedBackground />
      <TopBar height={50} />

      {/* Decorative elements */}
      <CornerMarks />
      <FloatingDots />
      <BottomAccentLine />

      {/* True vertical center below top bar */}
      <div
        style={{
          position: "absolute",
          top: 50,
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
            backgroundColor: CARD_BG,
            borderRadius: 24,
            padding: "50px 80px 60px",
            boxShadow: "0 8px 40px rgba(11,125,186,0.15), 0 2px 10px rgba(0,0,0,0.05)",
            border: `2px solid ${BORDER_COLOR}`,
            borderTop: `6px solid ${CW_BLUE}`,
          }}
        >
          <svg style={{ width: 100, height: 100, marginBottom: 20, overflow: "visible" }}>
            <DrawnCheckmark x={10} y={10} size={80} startFrame={5} duration={18} stroke={CW_BLUE} strokeWidth={5} />
          </svg>

          <h2 style={{ color: TEXT_COLOR, fontSize: 48, fontWeight: 700, margin: 0 }}>
            <WrittenText text={title || "Lesson Complete!"} startFrame={15} framesPerWord={headingFPW} />
          </h2>

          {subtitle && (
            <p
              style={{
                color: TEXT_LIGHT,
                fontSize: 26,
                fontWeight: 500,
                marginTop: 16,
                opacity: interpolate(frame, [35, 55], [0, 1], {
                  extrapolateLeft: "clamp", extrapolateRight: "clamp",
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
    </AbsoluteFill>
  );
};
