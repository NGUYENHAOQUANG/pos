import { useState, useCallback, useRef } from 'react';
import { Alert, Image, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import {
    Camera,
    useCameraDevice,
    useCameraFormat,
    useFrameProcessor,
} from 'react-native-vision-camera';
import { useSharedValue, Worklets } from 'react-native-worklets-core';
import * as Cropper from 'vision-camera-cropper';
import type { CropRegion } from 'vision-camera-cropper';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { SQUARE_LEFT_PCT, SQUARE_TOP_PCT, SQUARE_W, SQUARE_H } from '@/shared/constants';
import type { CapturedImage } from '@/shared/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type { CapturedImage };

interface UseCameraCaptureOptions {
    onImageCaptured: (img: CapturedImage) => void;
    onImageChange: () => void;
}

export function useCameraCapture({ onImageCaptured, onImageChange }: UseCameraCaptureOptions) {
    const [showCamera, setShowCamera] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [lastPhotoThumb, setLastPhotoThumb] = useState<string | null>(null);

    const cameraRef = useRef<Camera>(null);
    const device = useCameraDevice('back');
    const format = useCameraFormat(device, [
        { videoResolution: { width: 1920, height: 1080 } },
        { fps: 30 },
    ]);

    // Shared values cho frame processor
    const shouldTake = useSharedValue(false);
    const cropRegionShared = useSharedValue<CropRegion>({
        left: SQUARE_LEFT_PCT,
        top: SQUARE_TOP_PCT,
        width: SQUARE_W,
        height: SQUARE_H,
    });

    // Callback từ worklet về JS thread
    const onCapturedJS = Worklets.createRunOnJS(
        useCallback(
            async (base64: string) => {
                try {
                    onImageChange();
                    setShowCamera(false);

                    const tmpUri = `data:image/jpeg;base64,${base64}`;
                    Image.getSize(
                        tmpUri,
                        (w, h) => {
                            // Lưu ra file tạm để hiển thị
                            const path = `${
                                RNFS.TemporaryDirectoryPath
                            }/shrimp_capture_${Date.now()}.jpg`;
                            RNFS.writeFile(path, base64, 'base64')
                                .then(() => {
                                    const uri = `file://${path}`;
                                    setLastPhotoThumb(uri);
                                    onImageCaptured({ uri, base64, width: w, height: h });
                                })
                                .catch(err => console.error('write temp file:', err));
                        },
                        err => console.error('getSize error:', err)
                    );

                    Toast.show({ type: 'success', text1: 'Đã chụp ảnh!', position: 'bottom' });
                } catch (err) {
                    console.error('onCapturedJS error:', err);
                    Alert.alert('Lỗi', 'Không thể xử lý ảnh.');
                }
            },
            [onImageChange, onImageCaptured]
        )
    );

    // Frame processor: crop trong worklet
    const frameProcessor = useFrameProcessor(
        frame => {
            'worklet';
            if (shouldTake.value) {
                shouldTake.value = false;
                const cropResult = Cropper.crop(frame, {
                    cropRegion: cropRegionShared.value,
                    includeImageBase64: true,
                    saveAsFile: false,
                });
                if (cropResult.base64) {
                    onCapturedJS(cropResult.base64);
                }
            }
        },
        [shouldTake, cropRegionShared]
    );

    // Mở camera: xin permission trước
    const openCamera = useCallback(async () => {
        let granted = hasPermission;
        if (!granted) {
            const status = await Camera.requestCameraPermission();
            granted = status === 'granted';
            setHasPermission(granted);
        }
        if (!granted) {
            Alert.alert(
                'Cần quyền Camera',
                'Vui lòng cấp quyền camera trong cài đặt để sử dụng tính năng này.',
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Cài đặt', onPress: () => Linking.openSettings() },
                ]
            );
            return;
        }
        setShowCamera(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPermission]);

    const closeCamera = useCallback(() => setShowCamera(false), []);

    const takePhoto = useCallback(() => {
        shouldTake.value = true;
    }, [shouldTake]);

    // Chọn từ gallery
    const pickFromGallery = useCallback(async () => {
        launchImageLibrary({ mediaType: 'photo' as MediaType, quality: 0.8 }, async response => {
            if (response.didCancel) {
                return;
            }
            if (response.errorMessage) {
                Alert.alert('Lỗi', response.errorMessage);
                return;
            }
            const asset = response.assets?.[0];
            if (!asset?.uri) {
                return;
            }

            try {
                let finalUri = asset.uri;
                const isPhAsset = asset.uri.startsWith('ph://');
                let fileSize = 0;

                if (!isPhAsset) {
                    try {
                        const stat = await RNFS.stat(asset.uri);
                        fileSize = Number(stat.size);
                    } catch {
                        // ignore stat error
                    }
                }

                if (isPhAsset || fileSize > MAX_FILE_SIZE) {
                    const cfg = isPhAsset
                        ? {
                              compressionMethod: 'auto',
                              maxWidth: 30000,
                              maxHeight: 30000,
                              quality: 0.9,
                          }
                        : { compressionMethod: 'auto' };
                    finalUri = await ImageCompressor.compress(asset.uri, cfg as any);
                }

                const base64 = await RNFS.readFile(finalUri, 'base64');
                const width = asset.width ?? 1;
                const height = asset.height ?? 1;

                onImageChange();
                setLastPhotoThumb(finalUri);
                onImageCaptured({ uri: finalUri, base64, width, height });
            } catch (err) {
                console.error('pickFromGallery error:', err);
                Alert.alert('Lỗi', 'Không thể tải ảnh từ thư viện.');
            }
        });
    }, [onImageChange, onImageCaptured]);

    const toggleFlash = useCallback(() => setIsFlashOn(v => !v), []);

    return {
        // State
        showCamera,
        isFlashOn,
        lastPhotoThumb,
        device,
        format,
        cameraRef,
        hasPermission,
        frameProcessor,
        // Actions
        openCamera,
        closeCamera,
        takePhoto,
        pickFromGallery,
        toggleFlash,
    };
}
