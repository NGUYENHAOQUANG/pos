import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from '@/shared/components/typography/Text';

import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';
import { IconCamera } from '@/assets/icons';
import { Button } from '@/shared/components/buttons/Button';
import { AIImagePickerSheet } from '@/features/farm/components/ai-common/AIImagePickerSheet';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface CountingImagePickerSectionProps {
    onOpenCamera: () => void;
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
    const theme = useAppTheme();
    const styles = getStyles(theme);
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
            <View style={styles.emptyState}>
                <EmptyStateIcon width={160} height={160} />
                <Text style={styles.emptyTitle}>Chưa có hình ảnh</Text>
                <Text style={styles.emptySubtitle}>
                    Chụp ảnh chậu tôm hoặc chọn ảnh từ{'\n'}thư viện để bắt đầu kiểm đếm
                </Text>
            </View>

            <Button
                title={isProcessing ? 'Đang xử lý...' : 'Chụp hoặc chọn ảnh'}
                variant="outline"
                onPress={() => setSheetVisible(true)}
                disabled={isProcessing}
                renderLeftIcon={<IconCamera width={20} height={20} color={theme.text} />}
                style={styles.ctaButton}
                textStyle={styles.ctaLabel}
            />

            <AIImagePickerSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onOpenCamera={onOpenCamera}
                onOpenGallery={handleOpenGallery}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
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
            color: theme.text,
            marginTop: spacing.md,
            marginBottom: spacing.xs,
        },
        emptySubtitle: {
            fontSize: typography.fontSize.sm,
            color: theme.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
        ctaButton: {
            backgroundColor: theme.background,
            borderColor: theme.defaultBorder,
            borderRadius: 100,
            borderWidth: 1,
            height: 44,
            marginBottom: spacing.md,
        },
        ctaLabel: {
            color: theme.textSecondary,
            fontSize: typography.fontSize.base,
        },
    });
