import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { colors, spacing, typography } from '@/styles';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';
import { IconCamera } from '@/assets/icons';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import { CountingPickerSheet } from '@/features/farm/components/ai-counting-shrimp/CountingPickerSheet';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface CountingImagePickerSectionProps {
    /** Mở camera VisionCamera tùy chỉnh có crop frame */
    onOpenCamera: () => void;
    /** Trả về ảnh đã chọn từ thư viện (đã compress + base64) */
    onImagePicked: (
        uri: string,
        base64: string,
        dimensions?: { width: number; height: number }
    ) => void;
}

export const CountingImagePickerSection: React.FC<CountingImagePickerSectionProps> = ({
    onOpenCamera,
    onImagePicked,
}) => {
    const [sheetVisible, setSheetVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const processUri = async (uri: string, asset?: { width?: number; height?: number }) => {
        try {
            setIsProcessing(true);

            let finalUri = uri;
            const isPhAsset = uri.startsWith('ph://');
            let fileSize = 0;

            if (!isPhAsset) {
                try {
                    const stat = await RNFS.stat(uri);
                    fileSize = Number(stat.size);
                } catch {
                    // ignore stat errors
                }
            }

            if (isPhAsset || fileSize > MAX_FILE_SIZE) {
                const compressConfig = isPhAsset
                    ? { compressionMethod: 'auto', maxWidth: 30000, maxHeight: 30000, quality: 0.9 }
                    : { compressionMethod: 'auto' };
                finalUri = await ImageCompressor.compress(uri, compressConfig as any);
            }

            const base64String = await RNFS.readFile(finalUri, 'base64');
            const dimensions =
                asset?.width && asset?.height
                    ? { width: asset.width, height: asset.height }
                    : undefined;

            onImagePicked(finalUri, base64String, dimensions);
        } catch (error) {
            console.error('CountingImagePickerSection: processUri error', error);
            Alert.alert('Lỗi', 'Không thể xử lý ảnh này, vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenGallery = () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8 },
            (response: ImagePickerResponse) => {
                if (response.didCancel) {
                    return;
                }
                if (response.errorMessage) {
                    Alert.alert('Lỗi', response.errorMessage);
                    return;
                }
                const asset: Asset | undefined = response.assets?.[0];
                if (asset?.uri) {
                    processUri(asset.uri, { width: asset.width, height: asset.height });
                }
            }
        );
    };

    return (
        <View style={styles.container}>
            {/* Empty state illustration */}
            <View style={styles.emptyState}>
                <EmptyStateIcon width={160} height={160} />
                <Text style={styles.emptyTitle}>Chưa có hình ảnh</Text>
                <Text style={styles.emptySubtitle}>
                    Chụp ảnh chậu tôm hoặc chọn ảnh từ{'\n'}thư viện để bắt đầu kiểm đếm
                </Text>
            </View>

            {/* CTA button */}
            <OutlineButton
                label={isProcessing ? 'Đang xử lý...' : 'Chụp hoặc chọn ảnh'}
                onPress={() => setSheetVisible(true)}
                disabled={isProcessing}
                prefix={<IconCamera width={20} height={20} fill={colors.textSecondary} />}
                style={styles.ctaButton}
                labelStyle={styles.ctaLabel}
            />

            {/* Custom bottom sheet */}
            <CountingPickerSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onOpenCamera={onOpenCamera}
                onOpenGallery={handleOpenGallery}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    ctaButton: {
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: 100,
        borderWidth: 1,
        height: 44,
        marginBottom: spacing.md,
    },
    ctaLabel: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.base,
    },
});
