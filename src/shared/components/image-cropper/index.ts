/**
 * @file index.ts
 * @description Barrel export for the shared image-cropper module.
 *
 * Usage:
 *   import { ImageCropperView } from '@/shared/components/image-cropper';
 *   import type { CropRegion, ImageCropperViewProps } from '@/shared/components/image-cropper';
 *
 * Example:
 *   <ImageCropperView
 *       onCrop={(uri, region) => {
 *           // region = { x, y, width, height } in image pixels
 *           // pass to your backend or local crop util
 *       }}
 *       onClose={() => navigation.goBack()}
 *       title="Chọn vùng cắt"
 *   />
 */

// Main component
export { ImageCropperView } from '@/shared/components/image-cropper/ImageCropperView';

// Sub-component (if consumer needs to embed overlay independently)
export { CropOverlay } from '@/shared/components/image-cropper/CropOverlay';

// Hook
export { useImageCropper } from '@/shared/components/image-cropper/useImageCropper';

// Types
export type { ImageCropperViewProps } from '@/shared/components/image-cropper/ImageCropperView';
export type { CropOverlayProps } from '@/shared/components/image-cropper/CropOverlay';
export type { CropRegion, PickedImage } from '@/shared/components/image-cropper/useImageCropper';
