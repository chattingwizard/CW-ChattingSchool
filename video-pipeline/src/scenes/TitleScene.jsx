import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const TitleScene = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(progress, [0, 1], [60, 0]);

  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [20, 50], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Accent line animation
  const lineWidth = interpolate(frame, [5, 40], [0, 120], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 50%, #0f0f1a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          width: lineWidth,
          height: 4,
          backgroundColor: "#6c63ff",
          borderRadius: 2,
          marginBottom: 30,
        }}
      />

      {/* Title */}
      <h1
        style={{
          color: "#ffffff",
          fontSize: 72,
          fontWeight: 700,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          margin: 0,
          padding: "0 80px",
          letterSpacing: -1,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            color: "#8888bb",
            fontSize: 32,
            fontWeight: 400,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 24,
            letterSpacing: 2,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Bottom gradient line */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          width: "70%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #6c63ff44, transparent)",
          opacity: titleOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
