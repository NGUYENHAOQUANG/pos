import React from 'react';
import { View } from 'react-native';

import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import {
    ShrimpHealthBoundingBoxOverlay,
    HealthDetectionBox,
} from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';
import { AIActionButtonsWithCount } from '@/features/farm/components/ai-common/AIActionButtonsWithCount';

interface Props {
    imageUri: string | null;
    detections: HealthDetectionBox[];
    imageDimensions: { width: number; height: number };
    displayDimensions: { width: number; height: number };
    countTimes: number;
    onImageSelect: (
        uri: string,
        base64?: string,
        file?: any,
        dimensions?: { width: number; height: number }
    ) => void;
    onImageRemove: () => void;
    onImageAreaLayout: (size: { width: number; height: number }) => void;
    onResetPress: () => void;
    onGetResultPress: () => void;
}

export const ShrimpHealthImageSection: React.FC<Props> = ({
    imageUri,
    detections,
    imageDimensions,
    displayDimensions,
    countTimes,
    onImageSelect,
    onImageRemove,
    onImageAreaLayout,
    onResetPress,
    onGetResultPress,
}) => {
    const aspectRatio =
        imageDimensions.width > 0 && imageDimensions.height > 0
            ? imageDimensions.width / imageDimensions.height
            : 1;
    const overlayHeight =
        imageDimensions.width > 0 && imageDimensions.height > 0
            ? displayDimensions.width / (imageDimensions.width / imageDimensions.height)
            : displayDimensions.width;

    return (
        <View>
            <View
                onLayout={event => {
                    const { width, height } = event.nativeEvent.layout;
                    onImageAreaLayout({ width, height });
                }}
            >
                <ImageUpload
                    label="Hình ảnh xử lý"
                    imageUri={imageUri}
                    onImageSelect={onImageSelect}
                    onImageRemove={onImageRemove}
                    returnBase64={true}
                    aspectRatio={aspectRatio}
                >
                    {imageUri && detections.length > 0 && (
                        <ShrimpHealthBoundingBoxOverlay
                            detections={detections}
                            displayWidth={displayDimensions.width}
                            displayHeight={overlayHeight}
                            originalWidth={imageDimensions.width}
                            originalHeight={imageDimensions.height}
                        />
                    )}
                </ImageUpload>

                <AIActionButtonsWithCount
                    count={countTimes}
                    countLabel="Số lần kiểm tra"
                    primaryLabel="Kiểm tra lại"
                    secondaryLabel="Lấy kết quả kiểm tra"
                    onPrimaryPress={onResetPress}
                    onSecondaryPress={onGetResultPress}
                />
            </View>
        </View>
    );
};
