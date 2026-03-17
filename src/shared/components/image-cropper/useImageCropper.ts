/**
 * @file useImageCropper.ts
 * @description Hook managing image picker state for the ImageCropperView.
 *
 * Responsibilities:
 *   - Pick image from gallery via react-native-image-picker
 *   - Load an external URI (when parent already has the image)
 *   - Track pickedImage state (uri + natural dimensions)
 *   - Reset state
 *
 * The actual cropping is handled by ImageCropperView using
 * @react-native-community/image-editor with computed pixel coords.
 */

import { useState, useCallback } from 'react';
import {
    launchImageLibrary,
    type ImagePickerResponse,
    type Asset,
} from 'react-native-image-picker';
import { Image } from 'react-native';

// ── Types ────────────────────────────────────────────────────────────────────

/** Pixel-accurate crop region (in original image coordinates) */
export interface CropRegion {
    /** Pixel offset from left of the full image */
    x: number;
    /** Pixel offset from top of the full image */
    y: number;
    /** Width of the crop area in pixels */
    width: number;
    /** Height of the crop area in pixels */
    height: number;
}

/** Info about the image that was picked / loaded */
export interface PickedImage {
    uri: string;
    naturalWidth: number;
    naturalHeight: number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useImageCropper() {
    const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ── Pick from gallery ──────────────────────────────────────────────────
    const pickImage = useCallback(() => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 1,
                includeBase64: false,
                selectionLimit: 1,
            },
            (response: ImagePickerResponse) => {
                if (response.didCancel || response.errorCode) {
                    return;
                }

                const asset: Asset | undefined = response.assets?.[0];
                if (!asset?.uri) return;

                const uri = asset.uri;

                if (asset.width && asset.height) {
                    setPickedImage({
                        uri,
                        naturalWidth: asset.width,
                        naturalHeight: asset.height,
                    });
                } else {
                    // Fallback: measure from Image API
                    setIsLoading(true);
                    Image.getSize(
                        uri,
                        (naturalWidth, naturalHeight) => {
                            setPickedImage({ uri, naturalWidth, naturalHeight });
                            setIsLoading(false);
                        },
                        () => {
                            setPickedImage({ uri, naturalWidth: 1, naturalHeight: 1 });
                            setIsLoading(false);
                        }
                    );
                }
            }
        );
    }, []);

    // ── Load a URI directly (no picker dialog) ─────────────────────────────
    const loadUri = useCallback((uri: string, width?: number, height?: number) => {
        if (width && height) {
            setPickedImage({ uri, naturalWidth: width, naturalHeight: height });
        } else {
            setIsLoading(true);
            Image.getSize(
                uri,
                (naturalWidth, naturalHeight) => {
                    setPickedImage({ uri, naturalWidth, naturalHeight });
                    setIsLoading(false);
                },
                () => {
                    setPickedImage({ uri, naturalWidth: 1, naturalHeight: 1 });
                    setIsLoading(false);
                }
            );
        }
    }, []);

    // ── Reset ──────────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        setPickedImage(null);
    }, []);

    return {
        pickedImage,
        isLoading,
        pickImage,
        loadUri,
        reset,
    };
}
