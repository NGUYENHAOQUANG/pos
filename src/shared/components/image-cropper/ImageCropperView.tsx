/**
 * @file ImageCropperView.tsx
 * @description Full-screen image cropper with pinch-to-zoom + pan.
 *
 * UX pattern (like native photo editors):
 *   - A fixed square overlay with grid sits centred on screen
 *   - User can pinch-to-zoom and pan/drag the image beneath the overlay
 *   - "Cắt ảnh" button crops the visible region within the overlay
 *
 * The `onCrop` callback receives:
 *   - uri:    original image URI
 *   - region: { x, y, width, height } in **image pixels** (not display pixels)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    Platform,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';
import { CropOverlay } from '@/shared/components/image-cropper/CropOverlay';
import { useImageCropper } from '@/shared/components/image-cropper/useImageCropper';
import type { CropRegion } from '@/shared/components/image-cropper/useImageCropper';
import ImageEditor from '@react-native-community/image-editor';

const { width: SCREEN_W } = Dimensions.get('window');
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

// Crop square takes 85% of screen width
const CROP_SIZE = Math.floor(SCREEN_W * 0.85);

export interface ImageCropperViewProps {
    onCrop: (uri: string, region: CropRegion) => void;
    onClose?: () => void;
    title?: string;
    initialUri?: string;
    initialUriSize?: { width: number; height: number };
}

export const ImageCropperView: React.FC<ImageCropperViewProps> = ({
    onCrop,
    onClose,
    title = 'Cắt ảnh',
    initialUri,
    initialUriSize,
}) => {
    const insets = useSafeAreaInsets();
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // ── Image cropper hook ───────────────────────────────────────────────────
    const { pickedImage, isLoading, pickImage, loadUri, reset } = useImageCropper();

    // Auto-load when initialUri is provided
    React.useEffect(() => {
        if (initialUri) {
            loadUri(initialUri, initialUriSize?.width, initialUriSize?.height);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUri]);

    // ── Animated values for image transform ──────────────────────────────────
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // ── Compute image display dimensions (fit to crop area initially) ────────
    const imageLayout = useMemo(() => {
        if (!pickedImage || containerSize.width === 0) return null;

        const { naturalWidth, naturalHeight } = pickedImage;
        const imageAspect = naturalWidth / naturalHeight;

        // Image should initially fill the crop square (cover mode)
        let dispW: number;
        let dispH: number;

        if (imageAspect > 1) {
            // Landscape: height = CROP_SIZE, width = CROP_SIZE * aspect
            dispH = CROP_SIZE;
            dispW = CROP_SIZE * imageAspect;
        } else {
            // Portrait or square: width = CROP_SIZE, height = CROP_SIZE / aspect
            dispW = CROP_SIZE;
            dispH = CROP_SIZE / imageAspect;
        }

        return { dispW, dispH };
    }, [pickedImage, containerSize.width]);

    // ── Clamp translation so image covers the crop square ────────────────────
    function clampTranslation(tx: number, ty: number, s: number, dispW: number, dispH: number) {
        'worklet';
        const scaledW = dispW * s;
        const scaledH = dispH * s;

        // How much the image extends beyond the crop square on each side
        const maxTx = Math.max(0, (scaledW - CROP_SIZE) / 2);
        const maxTy = Math.max(0, (scaledH - CROP_SIZE) / 2);

        const clampedTx = Math.min(Math.max(tx, -maxTx), maxTx);
        const clampedTy = Math.min(Math.max(ty, -maxTy), maxTy);
        return { x: clampedTx, y: clampedTy };
    }

    // ── Gestures ─────────────────────────────────────────────────────────────
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            'worklet';
            savedScale.value = scale.value;
        })
        .onUpdate(e => {
            'worklet';
            const newScale = Math.min(Math.max(savedScale.value * e.scale, MIN_ZOOM), MAX_ZOOM);
            scale.value = newScale;
        })
        .onEnd(() => {
            'worklet';
            // If zoomed out too far, spring back
            if (scale.value < MIN_ZOOM) {
                scale.value = withSpring(MIN_ZOOM, { damping: 20, stiffness: 200 });
            }
            // Clamp translation after zoom
            if (imageLayout) {
                const clamped = clampTranslation(
                    translateX.value,
                    translateY.value,
                    scale.value,
                    imageLayout.dispW,
                    imageLayout.dispH
                );
                translateX.value = withSpring(clamped.x, { damping: 20, stiffness: 200 });
                translateY.value = withSpring(clamped.y, { damping: 20, stiffness: 200 });
            }
        });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            'worklet';
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        })
        .onUpdate(e => {
            'worklet';
            if (!imageLayout) return;
            const rawTx = savedTranslateX.value + e.translationX;
            const rawTy = savedTranslateY.value + e.translationY;
            const clamped = clampTranslation(
                rawTx,
                rawTy,
                scale.value,
                imageLayout.dispW,
                imageLayout.dispH
            );
            translateX.value = clamped.x;
            translateY.value = clamped.y;
        })
        .onEnd(() => {
            'worklet';
            if (!imageLayout) return;
            const clamped = clampTranslation(
                translateX.value,
                translateY.value,
                scale.value,
                imageLayout.dispW,
                imageLayout.dispH
            );
            translateX.value = withSpring(clamped.x, { damping: 20, stiffness: 200 });
            translateY.value = withSpring(clamped.y, { damping: 20, stiffness: 200 });
        });

    // Double tap to reset zoom
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            'worklet';
            if (scale.value > 1) {
                // Reset to 1x
                scale.value = withSpring(1, { damping: 20, stiffness: 200 });
                translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
                translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
            } else {
                // Zoom to 2x
                scale.value = withSpring(2, { damping: 20, stiffness: 200 });
            }
        });

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

    const imageAnimStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    // ── Crop calculation ─────────────────────────────────────────────────────
    const handleCrop = useCallback(() => {
        if (!pickedImage || !imageLayout) return;

        const { naturalWidth, naturalHeight } = pickedImage;
        const { dispW, dispH } = imageLayout;

        // Current scale and translation
        const s = scale.value;
        const tx = translateX.value;
        const ty = translateY.value;

        // The image is displayed at dispW x dispH, centred in the container.
        // After transform: scaled by s, translated by (tx, ty).
        // The crop square is centred in the container, at (containerCX, containerCY).
        // We need to find which part of the original image falls within the crop square.

        // Centre of the container
        const containerCX = containerSize.width / 2;
        const containerCY = containerSize.height / 2;

        // Centre of the image (in container coords, after transform)
        // Image is initially centred, so imageCX = containerCX + tx, imageCY = containerCY + ty
        // After scaling (around its own centre), the top-left of the scaled image is:
        //   imgLeft = containerCX + tx - (dispW * s) / 2
        //   imgTop  = containerCY + ty - (dispH * s) / 2

        const imgLeft = containerCX + tx - (dispW * s) / 2;
        const imgTop = containerCY + ty - (dispH * s) / 2;

        // The crop square in container coords:
        const cropLeft = (containerSize.width - CROP_SIZE) / 2;
        const cropTop = (containerSize.height - CROP_SIZE) / 2;

        // Offset of crop square within the scaled image:
        const offsetXInScaled = cropLeft - imgLeft;
        const offsetYInScaled = cropTop - imgTop;

        // Convert to original image pixels:
        const pixelsPerDisplayPx = naturalWidth / (dispW * s);
        const pixelsPerDisplayPyY = naturalHeight / (dispH * s);

        const cropX = Math.max(0, Math.round(offsetXInScaled * pixelsPerDisplayPx));
        const cropY = Math.max(0, Math.round(offsetYInScaled * pixelsPerDisplayPyY));
        const cropW = Math.round(CROP_SIZE * pixelsPerDisplayPx);
        const cropH = Math.round(CROP_SIZE * pixelsPerDisplayPyY);

        // Clamp to image bounds
        const region: CropRegion = {
            x: Math.min(cropX, naturalWidth - cropW),
            y: Math.min(cropY, naturalHeight - cropH),
            width: Math.min(cropW, naturalWidth),
            height: Math.min(cropH, naturalHeight),
        };

        // Use ImageEditor to actually crop the image
        const doCrop = async () => {
            try {
                const result = await ImageEditor.cropImage(pickedImage.uri, {
                    offset: { x: region.x, y: region.y },
                    size: { width: region.width, height: region.height },
                });
                onCrop(result.uri, region);
            } catch (err) {
                console.error('Crop failed:', err);
                // Fallback: send original
                onCrop(pickedImage.uri, region);
            }
        };
        doCrop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickedImage, imageLayout, containerSize, onCrop]);

    const handleReset = useCallback(() => {
        reset();
        scale.value = 1;
        savedScale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reset]);

    return (
        <GestureHandlerRootView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={colors.black} />

            {/* ── Top bar ── */}
            <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
                {onClose ? (
                    <TouchableOpacity style={styles.iconBtn} onPress={onClose} activeOpacity={0.7}>
                        <Ionicons name="close" size={26} color={colors.white} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconBtn} />
                )}

                <Text style={styles.topTitle}>{title}</Text>

                {pickedImage ? (
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={handleReset}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={22} color={colors.white} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconBtn} />
                )}
            </View>

            {/* ── Main content ── */}
            <View
                style={styles.content}
                onLayout={e => {
                    const { width, height } = e.nativeEvent.layout;
                    if (width > 0 && height > 0) {
                        setContainerSize({ width, height });
                    }
                }}
            >
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : pickedImage && imageLayout ? (
                    <>
                        {/* Pannable / zoomable image */}
                        <GestureDetector gesture={composedGesture}>
                            <Animated.View style={styles.imageWrapper}>
                                <Animated.Image
                                    source={{ uri: pickedImage.uri }}
                                    style={[
                                        {
                                            width: imageLayout.dispW,
                                            height: imageLayout.dispH,
                                        },
                                        imageAnimStyle,
                                    ]}
                                    resizeMode="cover"
                                />
                            </Animated.View>
                        </GestureDetector>

                        {/* Fixed overlay on top */}
                        {containerSize.width > 0 && (
                            <CropOverlay
                                containerWidth={containerSize.width}
                                containerHeight={containerSize.height}
                                cropSize={CROP_SIZE}
                            />
                        )}
                    </>
                ) : initialUri ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <View style={styles.center}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="image-outline" size={64} color={colors.gray[400]} />
                        </View>
                        <Text style={styles.emptyTitle}>Chưa chọn ảnh</Text>
                        <Text style={styles.emptySubtitle}>
                            Chọn ảnh từ thư viện để bắt đầu cắt
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Bottom bar ── */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {pickedImage ? (
                    <>
                        {!initialUri && (
                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={pickImage}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="images-outline" size={20} color={colors.white} />
                                <Text style={styles.secondaryBtnText}>Đổi ảnh</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={handleCrop}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="checkmark" size={20} color={colors.white} />
                            <Text style={styles.primaryBtnText}>Cắt ảnh</Text>
                        </TouchableOpacity>
                    </>
                ) : initialUri ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={pickImage}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="images-outline" size={20} color={colors.white} />
                        <Text style={styles.primaryBtnText}>Chọn ảnh từ thư viện</Text>
                    </TouchableOpacity>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.black,
    },

    // Top bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 12,
        backgroundColor: colors.cameraOverlay,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cameraIconBg,
    },
    topTitle: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '600',
    },

    // Content
    content: {
        flex: 1,
        overflow: 'hidden',
    },
    imageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    // Empty state
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.gray[900],
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '600',
    },
    emptySubtitle: {
        color: colors.gray[400],
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },

    // Bottom bar
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 24,
        paddingTop: 20,
        backgroundColor: colors.cameraOverlay,
    },
    primaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.primary,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    primaryBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 52,
        paddingHorizontal: 20,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: colors.white,
        backgroundColor: colors.cameraButtonBg,
    },
    secondaryBtnText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '500',
    },
});
