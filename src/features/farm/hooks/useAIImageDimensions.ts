/**
 * @file useAIImageDimensions.ts
 * @description Tính toán aspectRatio và overlayHeight từ imageDimensions / displayDimensions.
 *              Dùng chung cho tất cả AI image sections (counting, health, measure).
 * @author Kindy
 * @created 2026-03-15
 */

interface Dimensions {
    width: number;
    height: number;
}

export function useAIImageDimensions(imageDimensions: Dimensions, displayDimensions: Dimensions) {
    const hasImage = imageDimensions.width > 0 && imageDimensions.height > 0;

    /** Tỷ lệ khung hình ảnh gốc */
    const aspectRatio = hasImage ? imageDimensions.width / imageDimensions.height : 1;

    /** Chiều cao display (px) tương ứng với displayDimensions.width theo aspectRatio gốc */
    const overlayHeight = hasImage
        ? displayDimensions.width / aspectRatio
        : displayDimensions.width;

    return { aspectRatio, overlayHeight };
}
