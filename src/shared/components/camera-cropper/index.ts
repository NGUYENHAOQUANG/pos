/**
 * @file index.ts
 * @description Barrel export for the shared camera module.
 *
 * Usage:
 *   import { CameraView, CameraOverlay, CameraBottomBar } from '@/shared/components/camera';
 *   import { SQUARE_W, SQUARE_H, FRAME_W, FRAME_H }      from '@/shared/constants';
 *   import type { CapturedImage }                         from '@/shared/types';
 */

// Components
export { CameraView } from '@/shared/components/camera-cropper/CameraView';
export { CameraOverlay } from '@/shared/components/camera-cropper/CameraOverlay';
export { CameraBottomBar } from '@/shared/components/camera-cropper/CameraBottomBar';

// Prop types
export type { CameraViewProps } from '@/shared/components/camera-cropper/CameraView';
export type { CameraOverlayProps } from '@/shared/components/camera-cropper/CameraOverlay';
export type { CameraBottomBarProps } from '@/shared/components/camera-cropper/CameraBottomBar';
