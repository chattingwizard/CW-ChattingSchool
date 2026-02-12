import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { WrittenText } from "../components/WrittenText";
import { DefinitionCard, SummaryCard, CalloutBox } from "../components/VisualElements";
import { NarrationDisplay } from "../components/NarrationDisplay";
import { FONT, CW_BLUE, TEXT_COLOR, CARD_BG, BORDER_COLOR, FontImport, BrandedBackground, TopBar, Watermark, CornerMarks, BottomAccentLine, FloatingDots, SideAccentBar } from "../components/Brand";

// ── Trigger timing ──────────────────────────────────────

function findTriggerFrame(wordTimestamps, trigger, fps) {
  if (!wordTimestamps || !trigger) return null;
  const lowerTrigger = trigger.toLowerCase();
  const match = wordTimestamps.find((wt) => {
    const cleanWord = wt.word.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanWord === lowerTrigger;
  });
  return match ? Math.round(match.start * fps) : null;
}

// ── Layout: Definition Cards ────────────────────────────

const DefinitionCardsLayout = ({ visuals, wordTimestamps, fps, headingEndFrame }) => {
  const definitions = (visuals || []).filter((v) => v.type === "definition");

  return (
    <div style={{ display: "flex", flexDirection: "column", marginLeft: 20, marginRight: 20 }}>
      {definitions.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame = headingEndFrame + i * Math.round(2.5 * fps);
        const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

        return (
          <DefinitionCard
            key={i}
            term={v.term}
            definition={v.definition}
            icon={v.icon}
            color={v.color}
            startFrame={startFrame}
          />
        );
      })}
    </div>
  );
};

// ── Layout: Summary Row ─────────────────────────────────

const SummaryRowLayout = ({ visuals, wordTimestamps, fps, headingEndFrame }) => {
  const summaryCards = (visuals || []).filter((v) => v.type === "summary-card");
  const callouts = (visuals || []).filter((v) => v.type === "callout");

  return (
    <div style={{ marginLeft: 20, marginRight: 20 }}>
      <div style={{ display: "flex", gap: 18 }}>
        {summaryCards.map((v, i) => {
          const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
          const fallbackFrame = headingEndFrame + i * Math.round(1.5 * fps);
          const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

          return (
            <SummaryCard
              key={i}
              term={v.term}
              short={v.short}
              icon={v.icon}
              color={v.color}
              startFrame={startFrame}
            />
          );
        })}
      </div>

      {callouts.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame = headingEndFrame + summaryCards.length * Math.round(1.5 * fps) + Math.round(3 * fps);
        const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

        return (
          <CalloutBox
            key={`callout-${i}`}
            text={v.text}
            icon={v.icon}
            color={v.color}
            startFrame={startFrame}
          />
        );
      })}
    </div>
  );
};

// ── Layout: Bullet Cards (fallback) ─────────────────────

const BulletCardsLayout = ({ points, bulletStartFrames, headingDurationFrames, framesPerWord }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginLeft: 20 }}>
      {points.map((point, i) => {
        const bulletStart = bulletStartFrames[i] || (headingDurationFrames + i * 50);
        const cardOpacity = interpolate(
          frame,
          [bulletStart, bulletStart + 12],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              backgroundColor: CARD_BG,
              borderLeft: `5px solid ${CW_BLUE}`,
              borderRadius: 14,
              padding: "18px 28px",
              opacity: cardOpacity,
              boxShadow: "0 4px 16px rgba(11,125,186,0.1)",
            }}
          >
            <span style={{ color: TEXT_COLOR, fontSize: 32, lineHeight: 1.5, fontWeight: 500 }}>
              <WrittenText text={point} startFrame={bulletStart + 6} framesPerWord={framesPerWord} />
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Scene Component ────────────────────────────────

export const WhiteboardContentScene = ({
  heading,
  points = [],
  layout,
  visuals,
  narration,
  framesPerWord = 8,
  bulletStartFrames = [],
  headingDurationFrames = 45,
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingFPW = Math.max(2, Math.round(framesPerWord * 0.4));
  const headingWords = heading ? heading.split(" ").length : 0;
  const headingEndFrame = 5 + headingWords * headingFPW + 10;

  const renderContent = () => {
    // Special visual layouts (definition cards, summary row) keep their designs
    if (layout === "definition-cards" && visuals) {
      return <DefinitionCardsLayout visuals={visuals} wordTimestamps={wordTimestamps} fps={fps} headingEndFrame={headingEndFrame} />;
    }
    if (layout === "summary-row" && visuals) {
      return <SummaryRowLayout visuals={visuals} wordTimestamps={wordTimestamps} fps={fps} headingEndFrame={headingEndFrame} />;
    }

    // DEFAULT: Synced narration display — what you see = what you hear
    if (wordTimestamps && wordTimestamps.length > 0) {
      return (
        <div style={{ marginLeft: 20, marginRight: 20 }}>
          <NarrationDisplay wordTimestamps={wordTimestamps} fontSize={40} />
        </div>
      );
    }

    // Fallback: bullet cards (only if no wordTimestamps)
    if (points.length > 0) {
      return <BulletCardsLayout points={points} bulletStartFrames={bulletStartFrames} headingDurationFrames={headingDurationFrames} framesPerWord={framesPerWord} />;
    }
    return null;
  };

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <FontImport />
      <BrandedBackground />
      <TopBar height={50} />

      {/* Decorative elements */}
      <CornerMarks />
      <FloatingDots />
      <BottomAccentLine />
      <SideAccentBar side="right" />

      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          width: 5,
          height: 180,
          background: `linear-gradient(to bottom, ${CW_BLUE}, transparent)`,
          opacity: 0.35,
          borderRadius: "0 2px 2px 0",
        }}
      />

      {/* Main content area — VERTICALLY CENTERED below top bar */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "20px 60px 50px 50px",
        }}
      >
        {/* Heading */}
        {heading && (
          <div style={{ position: "relative", marginBottom: 24, marginLeft: 20 }}>
            <div
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 14,
                padding: "14px 28px 18px",
                display: "inline-block",
                boxShadow: "0 4px 20px rgba(11,125,186,0.12)",
                border: `1.5px solid ${BORDER_COLOR}`,
                borderLeft: `6px solid ${CW_BLUE}`,
              }}
            >
              <h2
                style={{
                  color: TEXT_COLOR,
                  fontSize: 42,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                <WrittenText text={heading} startFrame={5} framesPerWord={headingFPW} />
              </h2>
            </div>
          </div>
        )}

        {renderContent()}
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};
