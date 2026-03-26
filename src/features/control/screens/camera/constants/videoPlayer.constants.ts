import { Dimensions } from 'react-native';

// Auto-hide controls after 5s of inactivity
export const CONTROLS_TIMEOUT = 5000;

// Seek 10s per double-tap
export const SEEK_STEP = 10;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

// Landscape dimensions for gesture calculations
export const LANDSCAPE_W = Math.max(SCREEN_W, SCREEN_H);
export const LANDSCAPE_H = Math.min(SCREEN_W, SCREEN_H);
