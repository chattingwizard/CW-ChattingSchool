import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const ContentScene = ({ heading, points = [], text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingProgress = spring({ frame, fps, config: { damping: 200 } });
  const headingOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const headingX = interpolate(headingProgress, [0, 1], [-40, 0]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0f0f1a 0%, #151530 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 120px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* Heading */}
      {heading && (
        <h2
          style={{
            color: "#ffffff",
            fontSize: 52,
            fontWeight: 700,
            opacity: headingOpacity,
            transform: `translateX(${headingX}px)`,
            marginBottom: 50,
            borderLeft: "5px solid #6c63ff",
            paddingLeft: 30,
            margin: 0,
            marginBottom: 50,
            lineHeight: 1.3,
          }}
        >
          {heading}
        </h2>
      )}

      {/* Bullet points */}
      {points.map((point, i) => {
        const delay = 10 + i * 12;
        const pointOpacity = interpolate(
          frame,
          [delay, delay + 20],
          [0, 1],
          { extrapolateRight: "clamp" }
        );
        const pointProgress = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: { damping: 200 },
        });
        const pointY = interpolate(pointProgress, [0, 1], [30, 0]);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              opacity: pointOpacity,
              transform: `translateY(${pointY}px)`,
              marginBottom: 28,
              marginLeft: 35,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6c63ff, #00c6ff)",
                marginRight: 24,
                marginTop: 12,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "#e0e0e8",
                fontSize: 34,
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              {point}
            </span>
          </div>
        );
      })}

      {/* Plain text (when no bullets) */}
      {text && points.length === 0 && (
        <p
          style={{
            color: "#e0e0e8",
            fontSize: 34,
            fontWeight: 400,
            lineHeight: 1.7,
            opacity: headingOpacity,
            marginLeft: 35,
            marginTop: 0,
          }}
        >
          {text}
        </p>
      )}

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 120,
          right: 120,
          height: 2,
          background: "linear-gradient(90deg, #6c63ff33, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};
