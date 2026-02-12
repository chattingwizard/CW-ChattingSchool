import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DrawnCheckmark } from "../components/DrawnPath";
import { WrittenText } from "../components/WrittenText";

const FONT = '"Patrick Hand", "Segoe Print", cursive';
const BG = "#f7f3eb";

export const WhiteboardOutroScene = ({
  title,
  subtitle,
  framesPerWord = 6,
}) => {
  const frame = useCurrentFrame();

  const headingFPW = Math.max(2, Math.round(framesPerWord * 0.5));

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardScale = interpolate(frame, [0, 15], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(90deg, #16a34a, #2563eb)",
        }}
      />

      {/* Grid lines */}
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

      {/* Center card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${cardScale})`,
          opacity: cardOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 24,
            padding: "50px 80px 60px",
            boxShadow: "0 4px 30px rgba(0,0,0,0.06)",
            border: "2px solid #e0dbd0",
            borderTop: "5px solid #16a34a",
          }}
        >
          {/* Drawn checkmark */}
          <svg
            style={{
              width: 100,
              height: 100,
              marginBottom: 20,
              overflow: "visible",
            }}
          >
            <DrawnCheckmark
              x={10}
              y={10}
              size={80}
              startFrame={5}
              duration={18}
              stroke="#16a34a"
              strokeWidth={5}
            />
          </svg>

          <h2
            style={{
              color: "#2d2d2d",
              fontSize: 50,
              fontWeight: 400,
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
                color: "#7c7c78",
                fontSize: 28,
                marginTop: 16,
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
