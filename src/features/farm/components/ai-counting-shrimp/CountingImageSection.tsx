import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import { DotingOverlay, DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';
import { useAIImageDimensions } from '@/features/farm/hooks/useAIImageDimensions';

export interface CountingImageSectionProps {
    imageUri: string | null;
    detections: DetectionDot[];
    imageDimensions: { width: number; height: number };
    displayDimensions: { width: number; height: number };
    onImageSelect: (
        uri: string,
        base64?: string,
        file?: { fileName: string; type: string },
        dimensions?: { width: number; height: number }
    ) => void;
    onImageRemove: () => void;
    onLayoutDisplay: (width: number, height: number) => void;
}

export const CountingImageSection: React.FC<CountingImageSectionProps> = ({
    imageUri,
    detections,
    imageDimensions,
    displayDimensions,
    onImageSelect,
    onImageRemove,
    onLayoutDisplay,
}) => {
    const { aspectRatio, overlayHeight } = useAIImageDimensions(imageDimensions, displayDimensions);

    return (
        <View
            style={styles.imageWrapper}
            onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                onLayoutDisplay(width, height);
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
                    <DotingOverlay
                        detections={detections}
                        displayWidth={displayDimensions.width}
                        displayHeight={overlayHeight}
                        originalWidth={imageDimensions.width}
                        originalHeight={imageDimensions.height}
                    />
                )}
            </ImageUpload>
        </View>
    );
};

const styles = StyleSheet.create({
    imageWrapper: {
        width: '100%',
        position: 'relative',
    },
});
