import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { WrittenText } from "../components/WrittenText";
import { DrawnUnderline } from "../components/DrawnPath";
import { FONT, CW_BLUE, CW_BLUE_MID, TEXT_COLOR, TEXT_LIGHT, CARD_BG, BORDER_COLOR, FontImport, BrandedBackground, TopBar, Watermark, CornerMarks, BottomAccentLine, FloatingDots } from "../components/Brand";

export const WhiteboardTitleScene = ({
  title,
  subtitle,
  framesPerWord = 6,
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

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <FontImport />
      <BrandedBackground />
      <TopBar height={54} />

      {/* Decorative elements */}
      <CornerMarks />
      <FloatingDots />
      <BottomAccentLine />

      {/* Center content — true vertical center accounting for top bar */}
      <div
        style={{
          position: "absolute",
          top: 54,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
      <div
        style={{
          textAlign: "center",
          width: "78%",
        }}
      >
        {/* Title panel — strong white card on blue bg */}
        <div
          style={{
            backgroundColor: CARD_BG,
            borderRadius: 22,
            padding: "44px 64px 54px",
            boxShadow: "0 8px 40px rgba(11,125,186,0.15), 0 2px 10px rgba(0,0,0,0.05)",
            position: "relative",
            border: `2px solid ${BORDER_COLOR}`,
          }}
        >
          <h1
            style={{
              color: TEXT_COLOR,
              fontSize: 62,
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            <WrittenText text={title || ""} startFrame={5} framesPerWord={headingFPW} />
          </h1>

          {/* Drawn underline in CW blue */}
          <svg
            style={{
              position: "absolute",
              bottom: 38,
              left: "50%",
              transform: "translateX(-50%)",
              width: 500,
              height: 20,
              overflow: "visible",
            }}
          >
            <DrawnUnderline
              x={0}
              y={10}
              width={500}
              startFrame={titleEndFrame}
              duration={15}
              stroke={CW_BLUE}
              strokeWidth={4}
            />
          </svg>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              color: TEXT_LIGHT,
              fontSize: 26,
              fontWeight: 600,
              marginTop: 28,
              opacity: subtitleOpacity,
              letterSpacing: 1,
              textShadow: "0 1px 3px rgba(255,255,255,0.6)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};
