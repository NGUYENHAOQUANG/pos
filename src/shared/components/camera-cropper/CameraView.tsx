/**
 * @file CameraView.tsx
 * @description Full-screen camera preview screen.
 *              Composed of the native Camera, CameraOverlay (mask + controls)
 *              and CameraBottomBar (shutter + gallery).
 *
 *              Pressing the gallery button opens the native image picker,
 *              then shows ImageCropperView for square cropping before
 *              returning the result via onGallery.
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Modal } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    launchImageLibrary,
    type ImagePickerResponse,
    type Asset,
} from 'react-native-image-picker';
import { colors } from '@/styles';
import { CameraOverlay } from '@/shared/components/camera-cropper/CameraOverlay';
import { CameraBottomBar } from '@/shared/components/camera-cropper/CameraBottomBar';
import { ImageCropperView } from '@/shared/components/image-cropper';
import type { CropRegion } from '@/shared/components/image-cropper';

export interface CameraViewProps {
    cameraRef: React.RefObject<Camera | null>;
    device: ReturnType<typeof import('react-native-vision-camera').useCameraDevice>;
    format: ReturnType<typeof import('react-native-vision-camera').useCameraFormat>;
    frameProcessor: ReturnType<typeof import('react-native-vision-camera').useFrameProcessor>;
    isFlashOn: boolean;
    lastPhotoThumb: string | null;
    hasPermission: boolean;
    onClose: () => void;
    onToggleFlash: () => void;
    onCapture: () => void;
    /**
     * Called after user picks an image from gallery and crops it.
     * Receives the cropped image URI, optional base64,
     * optional file info, and optional dimensions.
     */
    onGallery: (
        uri: string,
        base64?: string,
        file?: { fileName: string; type: string },
        dimensions?: { width: number; height: number }
    ) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
    cameraRef,
    device,
    format,
    frameProcessor,
    isFlashOn,
    lastPhotoThumb,
    hasPermission,
    onClose,
    onToggleFlash,
    onCapture,
    onGallery,
}) => {
    const insets = useSafeAreaInsets();

    // ── Gallery → Cropper state ──
    const [cropperVisible, setCropperVisible] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<{
        uri: string;
        width?: number;
        height?: number;
    } | null>(null);

    // Open native gallery picker
    const handleGalleryPress = useCallback(() => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 1, selectionLimit: 1 },
            (response: ImagePickerResponse) => {
                if (response.didCancel || response.errorCode) return;
                const asset: Asset | undefined = response.assets?.[0];
                if (!asset?.uri) return;

                setSelectedAsset({
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                });
                setCropperVisible(true);
            }
        );
    }, []);

    // After crop is done
    const handleCropDone = useCallback(
        (croppedUri: string, region: CropRegion) => {
            setCropperVisible(false);
            setSelectedAsset(null);

            onGallery(croppedUri, undefined, undefined, {
                width: region.width,
                height: region.height,
            });
        },
        [onGallery]
    );

    const handleCropperClose = useCallback(() => {
        setCropperVisible(false);
        setSelectedAsset(null);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="black" />

            <View style={styles.preview}>
                {device && hasPermission ? (
                    <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        format={format}
                        isActive={!cropperVisible}
                        frameProcessor={frameProcessor}
                        pixelFormat="yuv"
                        torch={isFlashOn ? 'on' : 'off'}
                    />
                ) : (
                    <View style={styles.placeholder} />
                )}

                <CameraOverlay
                    paddingTop={insets.top}
                    isFlashOn={isFlashOn}
                    onClose={onClose}
                    onToggleFlash={onToggleFlash}
                />
            </View>

            <CameraBottomBar
                lastPhotoThumb={lastPhotoThumb}
                paddingBottom={Math.max(insets.bottom, 20)}
                onGalleryPress={handleGalleryPress}
                onCapturePress={onCapture}
            />

            {/* ── ImageCropperView modal ── */}
            <Modal
                visible={cropperVisible}
                animationType="slide"
                statusBarTranslucent
                onRequestClose={handleCropperClose}
            >
                <ImageCropperView
                    onCrop={handleCropDone}
                    onClose={handleCropperClose}
                    title="Cắt ảnh"
                    initialUri={selectedAsset?.uri}
                    initialUriSize={
                        selectedAsset?.width && selectedAsset?.height
                            ? { width: selectedAsset.width, height: selectedAsset.height }
                            : undefined
                    }
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    preview: {
        flex: 1,
    },
    placeholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.gray[900],
    },
});
