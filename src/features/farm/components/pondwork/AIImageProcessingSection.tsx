import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import { IconCamera } from '@/assets/icons';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';
import { colors, typography, borderRadius, spacing } from '@/styles';

interface Props {
    imageUri: string | null;
    imageDimensions: { width: number; height: number };
    displayDimensions: { width: number; height: number };
    onImageSelect: (
        uri: string,
        base64?: string,
        file?: any,
        dimensions?: { width: number; height: number }
    ) => void;
    onImageAreaLayout: (size: { width: number; height: number }) => void;
    onTakePhoto?: () => void;
    onOpenPickerSheet?: () => void;
    children?: React.ReactNode;
}

export const AIImageProcessingSection: React.FC<Props> = ({
    imageUri,
    imageDimensions,
    displayDimensions: _displayDimensions,
    onImageSelect,
    onImageAreaLayout,
    onTakePhoto,
    onOpenPickerSheet,
    children,
}) => {
    const defaultAspectRatio =
        imageDimensions.width > 0 && imageDimensions.height > 0
            ? imageDimensions.width / imageDimensions.height
            : 1;

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <EmptyStateIcon width={160} height={160} />
            <Text style={styles.emptyStateText}>
                {'Chưa có hình ảnh để AI phân tích\nvui lòng chụp ảnh'}
            </Text>
        </View>
    );

    const renderBottomButton = (openPicker: () => void) => (
        <View
            style={[styles.bottomButtonContainer, imageUri ? styles.bottomButtonWithImage : null]}
        >
            <OutlineButton
                label="Chụp hoặc chọn ảnh"
                onPress={onOpenPickerSheet ?? openPicker}
                prefix={<IconCamera width={20} height={20} fill={colors.textSecondary} />}
                style={styles.emptyStateButton}
                labelStyle={styles.emptyStateButtonText}
            />
        </View>
    );

    const imageUploadNode = (
        <ImageUpload
            imageUri={imageUri}
            onImageSelect={onImageSelect}
            onTakePhoto={onTakePhoto}
            returnBase64={true}
            aspectRatio={imageUri ? defaultAspectRatio : undefined}
            customEmptyState={renderEmptyState}
            bottomContent={renderBottomButton}
            uploadStyle={
                !imageUri
                    ? { ...styles.emptyUploadContainer, aspectRatio: undefined as any }
                    : styles.imageUploadContainer
            }
            disablePressContainer={!imageUri || !!onOpenPickerSheet}
        >
            {children}
        </ImageUpload>
    );

    return (
        <View>
            <View
                onLayout={event => {
                    const { width, height } = event.nativeEvent.layout;
                    onImageAreaLayout({ width, height });
                }}
            >
                {imageUri && onOpenPickerSheet ? (
                    <TouchableOpacity onPress={onOpenPickerSheet} activeOpacity={0.85}>
                        {imageUploadNode}
                    </TouchableOpacity>
                ) : (
                    imageUploadNode
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    emptyUploadContainer: {
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    imageUploadContainer: {
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
        lineHeight: 20,
    },
    emptyStateButtonWrapper: {
        width: '100%',
    },
    emptyStateButton: {
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: 100,
        borderWidth: 1,
        height: 44,
    },
    emptyStateButtonText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.base,
        fontWeight: '500',
    },
    bottomButtonContainer: {
        width: '100%',
    },
    bottomButtonWithImage: {
        marginTop: spacing.md,
    },
});
