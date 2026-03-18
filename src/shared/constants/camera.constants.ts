/**
 * @file camera.constants.ts
 * @description Camera crop-region constants.
 *
 * Coordinate space: portrait frame 1080×1920 (vision-camera-cropper).
 * A square crop window with 16dp margin on each side is centred
 * both horizontally and vertically.
 */
import { Dimensions } from 'react-native';

/** Native camera frame width (px) */
export const FRAME_W = 1080;

/** Native camera frame height (px) */
export const FRAME_H = 1920;

// ── Square crop window (16dp margin each side) ───────────────────────────────
const CROP_MARGIN = 24; // dp on each side
const SCREEN_W = Dimensions.get('window').width;
const SQUARE_W_PCT = ((SCREEN_W - CROP_MARGIN * 2) / SCREEN_W) * 100;
const SQUARE_PX = (SQUARE_W_PCT / 100) * FRAME_W;

/** Crop window width  – percentage of frame width */
export const SQUARE_W = SQUARE_W_PCT;

/** Crop window height – percentage of frame height */
export const SQUARE_H = (SQUARE_PX / FRAME_H) * 100;

/** Left offset of crop window – percentage of frame width */
export const SQUARE_LEFT_PCT = (100 - SQUARE_W) / 2;

/** Top  offset of crop window – percentage of frame height */
export const SQUARE_TOP_PCT = (100 - SQUARE_H) / 2;
