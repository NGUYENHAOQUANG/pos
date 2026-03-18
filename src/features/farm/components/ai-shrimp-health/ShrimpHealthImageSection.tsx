import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import { IconCamera, IconAICheck } from '@/assets/icons';
import { colors } from '@/styles';
import {
    ShrimpHealthBoundingBoxOverlay,
    HealthDetectionBox,
} from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';
import { useAIImageDimensions } from '@/features/farm/hooks/useAIImageDimensions';

interface Props {
    imageUri: string | null;
    detections: HealthDetectionBox[];
    imageDimensions: { width: number; height: number };
    displayDimensions: { width: number; height: number };
    onImageSelect: (
        uri: string,
        base64?: string,
        file?: any,
        dimensions?: { width: number; height: number }
    ) => void;
    onImageRemove: () => void;
    onImageAreaLayout: (size: { width: number; height: number }) => void;
    onGetResultPress: () => void;
}

export const ShrimpHealthImageSection: React.FC<Props> = ({
    imageUri,
    detections,
    imageDimensions,
    displayDimensions,
    onImageSelect,
    onImageRemove,
    onImageAreaLayout,
    onGetResultPress,
}) => {
    const { aspectRatio, overlayHeight } = useAIImageDimensions(imageDimensions, displayDimensions);

    return (
        <View>
            <View
                onLayout={event => {
                    const { width, height } = event.nativeEvent.layout;
                    onImageAreaLayout({ width, height });
                }}
            >
                <ImageUpload
                    imageUri={imageUri}
                    onImageSelect={onImageSelect}
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

                <OutlineButton
                    label="Chụp lại"
                    onPress={onImageRemove}
                    prefix={<IconCamera width={20} height={20} fill={colors.textSecondary} />}
                    style={styles.retakeButton}
                    labelStyle={styles.retakeButtonText}
                />

                <OutlineButton
                    label="Kiểm tra"
                    onPress={onGetResultPress}
                    prefix={<IconAICheck width={20} height={20} fill={colors.primaryOrange} />}
                    style={styles.aiButton}
                    labelStyle={styles.aiButtonText}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    retakeButton: {
        marginTop: 12,
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: 100,
        borderWidth: 1.5,
    },
    retakeButtonText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    aiButton: {
        marginTop: 12,
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: 100,
        borderWidth: 1.5,
    },
    aiButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
});
