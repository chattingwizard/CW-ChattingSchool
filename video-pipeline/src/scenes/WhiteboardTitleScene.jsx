import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { WrittenText } from "../components/WrittenText";
import { DrawnUnderline } from "../components/DrawnPath";

const FONT = '"Patrick Hand", "Segoe Print", cursive';
const BG = "#f7f3eb";

export const WhiteboardTitleScene = ({
  title,
  subtitle,
  framesPerWord = 6,
}) => {
  const frame = useCurrentFrame();

  const titleWords = title ? title.split(" ").length : 0;
  // Heading uses faster speed (half the narration framesPerWord)
  const headingFPW = Math.max(2, Math.round(framesPerWord * 0.4));
  const titleEndFrame = 5 + titleWords * headingFPW + 5;

  const subtitleOpacity = interpolate(
    frame,
    [titleEndFrame + 5, titleEndFrame + 25],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Decorative circles animation
  const decoOpacity = interpolate(frame, [titleEndFrame, titleEndFrame + 20], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>
      {/* Colored top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "linear-gradient(90deg, #2563eb, #7c3aed, #dc2626)",
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

      {/* Decorative colored circles */}
      <svg
        style={{ position: "absolute", top: 50, right: 80, width: 200, height: 200, opacity: decoOpacity }}
      >
        <circle cx="40" cy="40" r="25" fill="none" stroke="#2563eb22" strokeWidth="2" />
        <circle cx="120" cy="80" r="15" fill="#dc262611" stroke="none" />
        <circle cx="70" cy="130" r="35" fill="none" stroke="#7c3aed18" strokeWidth="1.5" />
      </svg>

      <svg
        style={{ position: "absolute", bottom: 80, left: 60, width: 150, height: 150, opacity: decoOpacity }}
      >
        <circle cx="30" cy="50" r="20" fill="#16a34a0d" stroke="#16a34a22" strokeWidth="1.5" />
        <circle cx="100" cy="90" r="12" fill="none" stroke="#2563eb22" strokeWidth="2" />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          width: "75%",
        }}
      >
        {/* Title background panel */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: "40px 60px 50px",
            boxShadow: "0 4px 30px rgba(0,0,0,0.06)",
            position: "relative",
            border: "2px solid #e8e3d8",
          }}
        >
          <h1
            style={{
              color: "#2d2d2d",
              fontSize: 68,
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            <WrittenText text={title || ""} startFrame={5} framesPerWord={headingFPW} />
          </h1>

          {/* Drawn underline */}
          <svg
            style={{
              position: "absolute",
              bottom: 35,
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
              stroke="#2563eb"
              strokeWidth={3.5}
            />
          </svg>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              color: "#7c7c78",
              fontSize: 30,
              fontWeight: 400,
              marginTop: 30,
              opacity: subtitleOpacity,
              letterSpacing: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom branding */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          right: 36,
          color: "#b8b4aa",
          fontSize: 16,
          fontFamily: FONT,
        }}
      >
        Chatting Wizard School
      </div>
    </AbsoluteFill>
  );
};
