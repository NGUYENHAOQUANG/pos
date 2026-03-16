/**
 * @file camera.constants.ts
 * @description Camera crop-region constants.
 *
 * Coordinate space: portrait frame 1080×1920 (vision-camera-cropper).
 * A square crop window occupying 70% of the frame width is centred
 * both horizontally and vertically.
 */

/** Native camera frame width (px) */
export const FRAME_W = 1080;

/** Native camera frame height (px) */
export const FRAME_H = 1920;

// ── Square crop window ────────────────────────────────────────────────────────
const SQUARE_W_PCT = 70;
const SQUARE_PX = (SQUARE_W_PCT / 100) * FRAME_W; // 756 px

/** Crop window width  – percentage of frame width  (= 70) */
export const SQUARE_W = SQUARE_W_PCT;

/** Crop window height – percentage of frame height (≈ 39.375) */
export const SQUARE_H = (SQUARE_PX / FRAME_H) * 100;

/** Left offset of crop window – percentage of frame width  (= 15) */
export const SQUARE_LEFT_PCT = (100 - SQUARE_W) / 2;

/** Top  offset of crop window – percentage of frame height (≈ 30.3) */
export const SQUARE_TOP_PCT = (100 - SQUARE_H) / 2;
