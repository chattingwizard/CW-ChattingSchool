import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";

export const OutroScene = ({ title, subtitle }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #1a1a3e 0%, #0f0f1a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Checkmark circle */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6c63ff, #00c6ff)",
          marginBottom: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 0 40px rgba(108, 99, 255, 0.3)",
        }}
      >
        <span style={{ fontSize: 42, color: "#fff" }}>&#10003;</span>
      </div>

      <h2
        style={{
          color: "#ffffff",
          fontSize: 48,
          fontWeight: 700,
          margin: 0,
        }}
      >
        {title || "End of Lesson"}
      </h2>

      <p
        style={{
          color: "#8888bb",
          fontSize: 28,
          marginTop: 16,
          letterSpacing: 2,
        }}
      >
        {subtitle || "Chatting Wizard School"}
      </p>
    </AbsoluteFill>
  );
};
