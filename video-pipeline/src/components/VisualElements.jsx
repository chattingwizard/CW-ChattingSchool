/**
 * Visual Elements Library — Chatting Wizard School v3
 *
 * UPGRADED: Animated counters, icon bounce, directional slides,
 * pulsating arrows, HighlightBox for emphasis.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { springTiming, bouncySpring } from "./Animations";
import { Icon } from "./Icons";
import { FONT, COLORS, lightenColor } from "./Brand";

// ─── Helper: Animated number counter ────────────────────

const AnimatedValue = ({ value, startFrame }) => {
  const frame = useCurrentFrame();

  const match = value.match(/^(\$?)([\d.]+)(%?)$/);
  if (!match) return <>{value}</>;

  const prefix = match[1];
  const target = parseFloat(match[2]);
  const suffix = match[3];
  const decimals = match[2].includes(".")
    ? (match[2].split(".")[1] || "").length
    : 0;

  const progress = interpolate(
    frame,
    [startFrame + 10, startFrame + 32],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const current = target * progress;
  const display =
    decimals > 0 ? current.toFixed(decimals) : Math.round(current);

  return (
    <>
      {prefix}
      {display}
      {suffix}
    </>
  );
};

// ─── Helper: Animated icon with bounce + rotation ───────

const BouncingIcon = ({ name, size, color, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounce = bouncySpring({ frame, fps, delay: startFrame + 6 });
  const iconScale = interpolate(bounce, [0, 0.5, 1], [0.3, 1.2, 1]);
  const iconRotation = interpolate(bounce, [0, 0.4, 1], [-20, 8, 0]);

  return (
    <div
      style={{
        transform: `scale(${iconScale}) rotate(${iconRotation}deg)`,
        display: "inline-flex",
      }}
    >
      <Icon name={name} size={size} color={color} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Flow Node — Animated counter + icon bounce + slide-in
// ─────────────────────────────────────────────────────────

export const FlowNode = ({
  icon,
  label,
  value,
  color = COLORS.primary,
  startFrame = 0,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = springTiming({ frame, fps, delay: startFrame });
  const opacity = progress;
  const scale = 0.55 + 0.45 * progress;
  // Slide from left — each node slides a bit less
  const slideX = interpolate(progress, [0, 1], [-50 - index * 10, 0]);
  const slideY = interpolate(progress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        width: 240,
        opacity,
        transform: `translateX(${slideX}px) translateY(${slideY}px) scale(${scale})`,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: `0 4px 20px ${COLORS.cardShadow}`,
        border: `1.5px solid ${COLORS.cardBorder}`,
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      {/* Color accent bar at top */}
      <div style={{ height: 5, backgroundColor: color }} />

      <div style={{ padding: "20px 14px 22px" }}>
        {/* Icon circle with bounce */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: lightenColor(color, 0.9),
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <BouncingIcon
            name={icon}
            size={26}
            color={color}
            startFrame={startFrame}
          />
        </div>

        {/* Value with animated counter */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: color,
            fontFamily: FONT,
            lineHeight: 1.2,
          }}
        >
          <AnimatedValue value={value} startFrame={startFrame} />
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: 17,
            fontWeight: 500,
            color: COLORS.textLight,
            fontFamily: FONT,
            marginTop: 4,
            lineHeight: 1.3,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Flow Arrow — Draw + subtle pulse after drawn
// ─────────────────────────────────────────────────────────

export const FlowArrowConnector = ({
  startFrame = 0,
  color = COLORS.primary,
}) => {
  const frame = useCurrentFrame();

  const drawProgress = interpolate(
    frame,
    [startFrame, startFrame + 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const headOpacity = interpolate(
    frame,
    [startFrame + 10, startFrame + 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle pulse after arrow is drawn
  const pulsePhase = frame > startFrame + 16
    ? Math.sin((frame - startFrame - 16) * 0.12) * 0.15 + 0.55
    : 0.5;

  return (
    <div
      style={{
        width: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={52} height={28} viewBox="0 0 52 28">
        <line
          x1="2"
          y1="14"
          x2="36"
          y2="14"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="34"
          strokeDashoffset={34 * (1 - drawProgress)}
          opacity={pulsePhase}
        />
        <polygon
          points="34,7 48,14 34,21"
          fill={color}
          opacity={headOpacity * pulsePhase}
        />
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Icon Grid Card — Bounce icon + slide from bottom
// ─────────────────────────────────────────────────────────

export const IconGridCard = ({
  icon,
  term,
  description,
  color = COLORS.primary,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = springTiming({ frame, fps, delay: startFrame });
  const opacity = progress;
  const scale = 0.75 + 0.25 * progress;
  // Slide up from below
  const slideY = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${slideY}px)`,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: "26px 18px 22px",
        textAlign: "center",
        boxShadow: `0 3px 16px ${COLORS.cardShadow}`,
        border: `1.5px solid ${COLORS.cardBorder}`,
        borderTop: `5px solid ${color}`,
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Icon with bounce animation */}
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          backgroundColor: lightenColor(color, 0.9),
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <BouncingIcon
          name={icon}
          size={30}
          color={color}
          startFrame={startFrame}
        />
      </div>

      {/* Term */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.text,
          fontFamily: FONT,
          marginBottom: 6,
        }}
      >
        {term}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 17,
          fontWeight: 400,
          color: COLORS.textLight,
          fontFamily: FONT,
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Stat Highlight — Bouncy big number
// ─────────────────────────────────────────────────────────

export const StatHighlight = ({
  value,
  label,
  color = COLORS.orange,
  startFrame = 0,
  size = "large",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = bouncySpring({ frame, fps, delay: startFrame });
  const scale = 0.4 + 0.6 * progress;
  const opacity = Math.min(progress * 1.5, 1);

  const isLarge = size === "large";
  const circleSize = isLarge ? 130 : 96;
  const fontSize = isLarge ? 40 : 28;

  return (
    <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center" }}>
      <div
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: lightenColor(color, 0.88),
          border: `4px solid ${color}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
          boxShadow: `0 4px 16px ${lightenColor(color, 0.6)}`,
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 800,
            color: color,
            fontFamily: FONT,
          }}
        >
          <AnimatedValue value={value} startFrame={startFrame} />
        </span>
      </div>
      {label && (
        <div
          style={{
            fontSize: isLarge ? 18 : 15,
            fontWeight: 500,
            color: COLORS.textLight,
            fontFamily: FONT,
            lineHeight: 1.3,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Highlight Box — Emphasis box with big value + secondary
// ─────────────────────────────────────────────────────────

export const HighlightBox = ({
  value,
  label,
  secondary,
  icon,
  color = COLORS.orange,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = bouncySpring({ frame, fps, delay: startFrame });
  const opacity = Math.min(progress * 1.5, 1);
  const scale = 0.5 + 0.5 * progress;

  // Secondary text fades in after main
  const secondaryOpacity = interpolate(
    frame,
    [startFrame + 22, startFrame + 38],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Glow pulse
  const glowPulse =
    frame > startFrame + 30
      ? 0.6 + Math.sin((frame - startFrame - 30) * 0.1) * 0.15
      : 0.5;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: 22,
        backgroundColor: lightenColor(color, 0.91),
        borderRadius: 18,
        padding: "20px 30px",
        marginTop: 16,
        border: `2.5px solid ${color}`,
        boxShadow: `0 4px 24px rgba(0,0,0,${glowPulse * 0.12})`,
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: lightenColor(color, 0.8),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BouncingIcon
            name={icon}
            size={30}
            color={color}
            startFrame={startFrame}
          />
        </div>
      )}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: color,
              fontFamily: FONT,
            }}
          >
            <AnimatedValue value={value} startFrame={startFrame} />
          </span>
          <span
            style={{
              fontSize: 19,
              fontWeight: 500,
              color: COLORS.textLight,
              fontFamily: FONT,
            }}
          >
            {label}
          </span>
        </div>
        {secondary && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: COLORS.text,
              fontFamily: FONT,
              marginTop: 4,
              opacity: secondaryOpacity,
            }}
          >
            {secondary}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Callout Box — Slide from right + pulse
// ─────────────────────────────────────────────────────────

export const CalloutBox = ({
  text,
  icon,
  color = COLORS.red,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = springTiming({ frame, fps, delay: startFrame });
  const opacity = progress;
  const scale = 0.88 + 0.12 * progress;
  // Slide from right
  const slideX = interpolate(progress, [0, 1], [60, 0]);

  // Subtle pulse after appear
  const pulse =
    frame > startFrame + 22
      ? interpolate(
          frame,
          [startFrame + 22, startFrame + 44, startFrame + 66],
          [1, 1.015, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      : 1;

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${slideX}px) scale(${scale * pulse})`,
        backgroundColor: lightenColor(color, 0.93),
        borderRadius: 18,
        padding: "24px 32px",
        marginTop: 20,
        display: "flex",
        alignItems: "center",
        gap: 20,
        border: `2.5px solid ${color}`,
        boxShadow: `0 3px 18px ${lightenColor(color, 0.7)}`,
      }}
    >
      {icon && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: lightenColor(color, 0.85),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BouncingIcon
            name={icon}
            size={28}
            color={color}
            startFrame={startFrame}
          />
        </div>
      )}
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.text,
          fontFamily: FONT,
          lineHeight: 1.35,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Definition Card
// ─────────────────────────────────────────────────────────

export const DefinitionCard = ({
  term,
  definition,
  icon,
  color = COLORS.primary,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = springTiming({ frame, fps, delay: startFrame });
  const opacity = progress;
  const translateX = interpolate(progress, [0, 1], [-35, 0]);
  const scale = 0.92 + 0.08 * progress;

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        backgroundColor: lightenColor(color, 0.94),
        borderRadius: 16,
        padding: "22px 28px",
        marginBottom: 14,
        boxShadow: `0 3px 14px rgba(0,0,0,0.05)`,
        borderLeft: `6px solid ${color}`,
        border: `1.5px solid ${lightenColor(color, 0.82)}`,
        borderLeftWidth: 6,
        borderLeftColor: color,
        borderLeftStyle: "solid",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 8,
        }}
      >
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: lightenColor(color, 0.85),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BouncingIcon
              name={icon}
              size={26}
              color={color}
              startFrame={startFrame}
            />
          </div>
        )}
        <span
          style={{
            fontSize: 38,
            fontWeight: 700,
            color,
            fontFamily: FONT,
            lineHeight: 1.2,
          }}
        >
          {term}
        </span>
      </div>
      <div
        style={{
          fontSize: 26,
          color: COLORS.text,
          fontFamily: FONT,
          fontWeight: 400,
          lineHeight: 1.45,
          paddingLeft: icon ? 62 : 0,
        }}
      >
        {definition}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Summary Card
// ─────────────────────────────────────────────────────────

export const SummaryCard = ({
  term,
  short,
  icon,
  color = COLORS.primary,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = springTiming({ frame, fps, delay: startFrame });
  const opacity = progress;
  const scale = 0.8 + 0.2 * progress;
  const slideY = interpolate(progress, [0, 1], [30, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${slideY}px)`,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: "22px 18px 18px",
        textAlign: "center",
        flex: 1,
        boxShadow: `0 3px 14px ${COLORS.cardShadow}`,
        borderTop: `5px solid ${color}`,
        border: `1.5px solid ${lightenColor(color, 0.75)}`,
        borderTopWidth: 5,
        borderTopColor: color,
        borderTopStyle: "solid",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: lightenColor(color, 0.88),
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BouncingIcon
            name={icon}
            size={28}
            color={color}
            startFrame={startFrame}
          />
        </div>
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color,
          fontFamily: FONT,
          marginBottom: 4,
        }}
      >
        {term}
      </div>
      <div
        style={{
          fontSize: 19,
          color: COLORS.textLight,
          fontFamily: FONT,
          fontWeight: 400,
          lineHeight: 1.35,
        }}
      >
        {short}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Quote Box
// ─────────────────────────────────────────────────────────

export const QuoteBox = ({
  text,
  icon,
  color = COLORS.gold,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = springTiming({ frame, fps, delay: startFrame });
  const opacity = progress;
  const scale = 0.85 + 0.15 * progress;
  const slideX = interpolate(progress, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${slideX}px) scale(${scale})`,
        background: `linear-gradient(135deg, ${lightenColor(color, 0.94)}, ${lightenColor(color, 0.88)})`,
        borderRadius: 20,
        padding: "34px 44px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        border: `2.5px solid ${color}`,
        boxShadow: `0 4px 24px ${lightenColor(color, 0.6)}`,
        marginTop: 16,
      }}
    >
      {icon && (
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            backgroundColor: lightenColor(color, 0.82),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BouncingIcon
            name={icon}
            size={32}
            color={color}
            startFrame={startFrame}
          />
        </div>
      )}
      <span
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: COLORS.text,
          fontFamily: FONT,
          lineHeight: 1.4,
          fontStyle: "italic",
        }}
      >
        &ldquo;{text}&rdquo;
      </span>
    </div>
  );
};
