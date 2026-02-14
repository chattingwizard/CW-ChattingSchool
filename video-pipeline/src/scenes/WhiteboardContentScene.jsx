/**
 * WhiteboardContentScene v2 — Main content scene.
 *
 * Supports multiple layouts:
 *   - "definition-cards"  — Term + definition cards
 *   - "summary-row"       — Compact summary cards + callouts
 *   - "icon-grid"         — 2x2 grid of icon cards
 *   - "flow-chain"        — Horizontal process flow diagram
 *   - (default)           — Synced narration display or bullet cards
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { WrittenText } from "../components/WrittenText";
import {
  DefinitionCard,
  SummaryCard,
  CalloutBox,
  FlowNode,
  FlowArrowConnector,
  IconGridCard,
  StatHighlight,
  QuoteBox,
  HighlightBox,
} from "../components/VisualElements";
import { NarrationDisplay } from "../components/NarrationDisplay";
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

// ── Trigger timing — find the frame when a word is spoken ─

function findTriggerFrame(wordTimestamps, trigger, fps) {
  if (!wordTimestamps || !trigger) return null;
  const lowerTrigger = trigger.toLowerCase().replace(/[^a-z0-9]/g, "");
  const match = wordTimestamps.find((wt) => {
    const cleanWord = wt.word.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanWord === lowerTrigger;
  });
  return match ? Math.round(match.start * fps) : null;
}

// ── Layout: Flow Chain ──────────────────────────────────

const FlowChainLayout = ({ visuals, wordTimestamps, fps, headingEndFrame }) => {
  const nodes = (visuals || []).filter((v) => v.type === "flow-node");
  const callouts = (visuals || []).filter((v) => v.type === "callout");
  const quotes = (visuals || []).filter((v) => v.type === "quote");
  const highlights = (visuals || []).filter((v) => v.type === "highlight-box");

  return (
    <div style={{ marginLeft: 16, marginRight: 16 }}>
      {/* Flow chain — horizontal */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          marginBottom: 20,
        }}
      >
        {nodes.map((node, i) => {
          const triggerFrame = findTriggerFrame(wordTimestamps, node.trigger, fps);
          const fallbackFrame = headingEndFrame + i * Math.round(2.2 * fps);
          const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

          return (
            <React.Fragment key={i}>
              <FlowNode
                icon={node.icon}
                label={node.label}
                value={node.value}
                color={node.color}
                startFrame={startFrame}
                index={i}
              />
              {i < nodes.length - 1 && (
                <FlowArrowConnector
                  startFrame={startFrame + 12}
                  color={node.color}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Highlight boxes (Your Cut emphasis) */}
      {highlights.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          nodes.length * Math.round(2.2 * fps) +
          Math.round(1.5 * fps);
        const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

        return (
          <HighlightBox
            key={`hl-${i}`}
            value={v.value}
            label={v.label}
            secondary={v.secondary}
            icon={v.icon}
            color={v.color}
            startFrame={startFrame}
          />
        );
      })}

      {/* Callouts below */}
      {callouts.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          nodes.length * Math.round(2.2 * fps) +
          Math.round(2 * fps);
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

      {/* Quotes below */}
      {quotes.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          nodes.length * Math.round(2.2 * fps) +
          Math.round(3 * fps);
        const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

        return (
          <QuoteBox
            key={`quote-${i}`}
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

// ── Layout: Icon Grid ───────────────────────────────────

const IconGridLayout = ({ visuals, wordTimestamps, fps, headingEndFrame }) => {
  const cards = (visuals || []).filter((v) => v.type === "icon-card");
  const callouts = (visuals || []).filter((v) => v.type === "callout");
  const quotes = (visuals || []).filter((v) => v.type === "quote");
  const highlights = (visuals || []).filter((v) => v.type === "highlight-box");
  const cols = 2;
  const rows = Math.ceil(cards.length / cols);

  return (
    <div style={{ marginLeft: 16, marginRight: 16 }}>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} style={{ display: "flex", gap: 18, marginBottom: 18 }}>
          {cards.slice(row * cols, (row + 1) * cols).map((card, col) => {
            const i = row * cols + col;
            const triggerFrame = findTriggerFrame(
              wordTimestamps,
              card.trigger,
              fps
            );
            const fallbackFrame = headingEndFrame + i * Math.round(1.8 * fps);
            const startFrame =
              triggerFrame !== null ? triggerFrame : fallbackFrame;

            return (
              <IconGridCard
                key={i}
                icon={card.icon}
                term={card.term}
                description={card.description}
                color={card.color}
                startFrame={startFrame}
              />
            );
          })}
        </div>
      ))}

      {/* Highlight boxes below grid */}
      {highlights.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          cards.length * Math.round(1.8 * fps) +
          Math.round(1.5 * fps);
        const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

        return (
          <HighlightBox
            key={`hl-${i}`}
            value={v.value}
            label={v.label}
            secondary={v.secondary}
            icon={v.icon}
            color={v.color}
            startFrame={startFrame}
          />
        );
      })}

      {/* Callouts below grid */}
      {callouts.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          cards.length * Math.round(1.8 * fps) +
          Math.round(2 * fps);
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

      {/* Quotes below callouts */}
      {quotes.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          cards.length * Math.round(1.8 * fps) +
          Math.round(3 * fps);
        const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

        return (
          <QuoteBox
            key={`quote-${i}`}
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

// ── Layout: Definition Cards ────────────────────────────

const DefinitionCardsLayout = ({
  visuals,
  wordTimestamps,
  fps,
  headingEndFrame,
}) => {
  const definitions = (visuals || []).filter((v) => v.type === "definition");
  const callouts = (visuals || []).filter((v) => v.type === "callout");
  const quotes = (visuals || []).filter((v) => v.type === "quote");
  const highlights = (visuals || []).filter((v) => v.type === "highlight-box");

  return (
    <div
      style={{ display: "flex", flexDirection: "column", marginLeft: 16, marginRight: 16 }}
    >
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

      {/* Highlight boxes */}
      {highlights.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          definitions.length * Math.round(2.5 * fps) +
          Math.round(1.5 * fps);
        const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

        return (
          <HighlightBox
            key={`hl-${i}`}
            value={v.value}
            label={v.label}
            secondary={v.secondary}
            icon={v.icon}
            color={v.color}
            startFrame={startFrame}
          />
        );
      })}

      {/* Callouts */}
      {callouts.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          definitions.length * Math.round(2.5 * fps) +
          Math.round(2 * fps);
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

      {/* Quotes */}
      {quotes.map((v, i) => {
        const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
        const fallbackFrame =
          headingEndFrame +
          definitions.length * Math.round(2.5 * fps) +
          Math.round(3 * fps);
        const startFrame = triggerFrame !== null ? triggerFrame : fallbackFrame;

        return (
          <QuoteBox
            key={`quote-${i}`}
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

// ── Layout: Summary Row ─────────────────────────────────

const SummaryRowLayout = ({
  visuals,
  wordTimestamps,
  fps,
  headingEndFrame,
}) => {
  const summaryCards = (visuals || []).filter((v) => v.type === "summary-card");
  const callouts = (visuals || []).filter((v) => v.type === "callout");

  return (
    <div style={{ marginLeft: 16, marginRight: 16 }}>
      <div style={{ display: "flex", gap: 18 }}>
        {summaryCards.map((v, i) => {
          const triggerFrame = findTriggerFrame(wordTimestamps, v.trigger, fps);
          const fallbackFrame = headingEndFrame + i * Math.round(1.5 * fps);
          const startFrame =
            triggerFrame !== null ? triggerFrame : fallbackFrame;

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
        const fallbackFrame =
          headingEndFrame +
          summaryCards.length * Math.round(1.5 * fps) +
          Math.round(3 * fps);
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

const BulletCardsLayout = ({
  points,
  bulletStartFrames,
  headingDurationFrames,
  framesPerWord,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginLeft: 16,
        marginRight: 16,
      }}
    >
      {points.map((point, i) => {
        const bulletStart =
          bulletStartFrames[i] || headingDurationFrames + i * 50;
        const cardOpacity = interpolate(
          frame,
          [bulletStart, bulletStart + 12],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const cardSlide = interpolate(
          frame,
          [bulletStart, bulletStart + 12],
          [15, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              backgroundColor: COLORS.card,
              borderLeft: `5px solid ${COLORS.primary}`,
              borderRadius: 12,
              padding: "16px 26px",
              opacity: cardOpacity,
              transform: `translateY(${cardSlide}px)`,
              boxShadow: `0 3px 12px ${COLORS.cardShadow}`,
            }}
          >
            <span
              style={{
                color: COLORS.text,
                fontSize: 30,
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              <WrittenText
                text={point}
                startFrame={bulletStart + 6}
                framesPerWord={framesPerWord}
              />
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
  sceneProgress,
  sectionLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingFPW = Math.max(2, Math.round(framesPerWord * 0.4));
  const headingWords = heading ? heading.split(" ").length : 0;
  const headingEndFrame = 5 + headingWords * headingFPW + 10;

  // Heading underline animation
  const underlineWidth = interpolate(
    frame,
    [headingEndFrame - 5, headingEndFrame + 8],
    [0, 260],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const renderContent = () => {
    if (layout === "flow-chain" && visuals) {
      return (
        <FlowChainLayout
          visuals={visuals}
          wordTimestamps={wordTimestamps}
          fps={fps}
          headingEndFrame={headingEndFrame}
        />
      );
    }
    if (layout === "icon-grid" && visuals) {
      return (
        <IconGridLayout
          visuals={visuals}
          wordTimestamps={wordTimestamps}
          fps={fps}
          headingEndFrame={headingEndFrame}
        />
      );
    }
    if (layout === "definition-cards" && visuals) {
      return (
        <DefinitionCardsLayout
          visuals={visuals}
          wordTimestamps={wordTimestamps}
          fps={fps}
          headingEndFrame={headingEndFrame}
        />
      );
    }
    if (layout === "summary-row" && visuals) {
      return (
        <SummaryRowLayout
          visuals={visuals}
          wordTimestamps={wordTimestamps}
          fps={fps}
          headingEndFrame={headingEndFrame}
        />
      );
    }

    // Default: Synced narration display
    if (wordTimestamps && wordTimestamps.length > 0) {
      return (
        <div style={{ marginLeft: 16, marginRight: 16 }}>
          <NarrationDisplay wordTimestamps={wordTimestamps} fontSize={38} />
        </div>
      );
    }

    // Fallback: bullet cards
    if (points.length > 0) {
      return (
        <BulletCardsLayout
          points={points}
          bulletStartFrames={bulletStartFrames}
          headingDurationFrames={headingDurationFrames}
          framesPerWord={framesPerWord}
        />
      );
    }

    return null;
  };

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <FontImport />
      <WarmBackground />
      <AnimatedBackground />
      <TopBar height={44} sectionLabel={sectionLabel || ""} />
      <CornerMarks />

      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "20px 56px 44px 48px",
        }}
      >
        {/* Heading */}
        {heading && (
          <div style={{ marginBottom: 26, marginLeft: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Accent dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: COLORS.primary,
                  opacity: interpolate(frame, [0, 8], [0, 0.7], {
                    extrapolateRight: "clamp",
                  }),
                  flexShrink: 0,
                }}
              />
              <h2
                style={{
                  color: COLORS.text,
                  fontSize: 42,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                <WrittenText
                  text={heading}
                  startFrame={5}
                  framesPerWord={headingFPW}
                />
              </h2>
            </div>
            {/* Animated underline */}
            <div
              style={{
                marginTop: 6,
                marginLeft: 24,
                height: 3,
                backgroundColor: COLORS.primary,
                borderRadius: 2,
                width: underlineWidth,
                opacity: 0.35,
              }}
            />
          </div>
        )}

        {renderContent()}
      </div>

      <Watermark />
      {typeof sceneProgress === "number" && (
        <ProgressBar progress={sceneProgress} />
      )}
    </AbsoluteFill>
  );
};
