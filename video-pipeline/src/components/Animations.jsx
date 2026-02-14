/**
 * Animation utilities for Chatting Wizard School videos.
 * Spring-based animations, stagger helpers, easing.
 */
import { spring, interpolate } from "remotion";

/**
 * Spring animation with delay support.
 * Returns 0 before delay, then springs from 0 → ~1.
 */
export function springTiming({ frame, fps, delay = 0, config = {} }) {
  if (frame < delay) return 0;
  return spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 14,
      stiffness: 180,
      mass: 0.6,
      ...config,
    },
  });
}

/**
 * Bouncy spring — more playful overshoot.
 */
export function bouncySpring({ frame, fps, delay = 0 }) {
  return springTiming({
    frame,
    fps,
    delay,
    config: { damping: 8, stiffness: 200, mass: 0.5 },
  });
}

/**
 * Gentle spring — smooth, no overshoot.
 */
export function gentleSpring({ frame, fps, delay = 0 }) {
  return springTiming({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 120, mass: 0.8 },
  });
}

/**
 * Calculate staggered delay for item at index.
 * @param {number} index - Item index
 * @param {number} gapFrames - Frames between each item
 * @param {number} baseDelay - Starting delay for first item
 */
export function staggerDelay(index, gapFrames = 8, baseDelay = 0) {
  return baseDelay + index * gapFrames;
}

/**
 * Simple fade in with delay.
 */
export function fadeIn(frame, delay = 0, duration = 10) {
  return interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Slide in from a direction.
 * Returns the offset in pixels (starts at `distance`, ends at 0).
 */
export function slideIn(frame, delay = 0, distance = 30, duration = 12) {
  return interpolate(frame, [delay, delay + duration], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Count up animation for numbers.
 * Returns a number from 0 to `target`.
 */
export function countUp(frame, delay = 0, target = 100, duration = 20) {
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.round(target * progress);
}
