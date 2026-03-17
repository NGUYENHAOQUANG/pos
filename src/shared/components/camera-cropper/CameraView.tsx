/**
 * @file CameraView.tsx
 * @description Full-screen camera preview screen.
 *              Composed of the native Camera, CameraOverlay (mask + controls)
 *              and CameraBottomBar (shutter + gallery).
 */
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles';
import { CameraOverlay } from '@/shared/components/camera-cropper/CameraOverlay';
import { CameraBottomBar } from '@/shared/components/camera-cropper/CameraBottomBar';

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
    onGallery: () => void;
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
                        isActive
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
                onGalleryPress={onGallery}
                onCapturePress={onCapture}
            />
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
