/**
 * @file AIImagePickerSheet.tsx
 * @description Bottom sheet chọn nguồn ảnh (camera / thư viện) dùng chung cho
 *              tất cả các tính năng AI: kiểm đếm, sức khoẻ tôm, đo kích thước.
 *
 * Đây là phiên bản generic của CountingPickerSheet — title/subtitle có thể
 * tuỳ chỉnh qua props để phù hợp từng feature.
 */
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    Animated,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    launchImageLibrary,
    type Asset,
    type ImagePickerResponse,
} from 'react-native-image-picker';
import { colors, spacing, borderRadius, typography } from '@/styles';
import { ImageCropperView } from '@/shared/components/image-cropper';
import type { CropRegion } from '@/shared/components/image-cropper';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface AIImagePickerSheetProps {
    visible: boolean;
    onClose: () => void;
    /** Mở camera VisionCamera tùy chỉnh có crop frame */
    onOpenCamera: () => void;
    /**
     * Callback sau khi user chọn ảnh từ thư viện và crop xong.
     * Nhận uri gốc và region đã crop tính bằng pixel thật.
     */
    onOpenGallery: (uri: string, region: CropRegion) => void;
    /** Tiêu đề bottom sheet */
    title?: string;
    /** Mô tả phụ bên dưới tiêu đề */
    subtitle?: string;
}

export function AIImagePickerSheet({
    visible,
    onClose,
    onOpenCamera,
    onOpenGallery,
    title = 'Chọn ảnh',
    subtitle = 'Ảnh sẽ được đưa vào AI để phân tích',
}: AIImagePickerSheetProps) {
    const insets = useSafeAreaInsets();
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [cropperVisible, setCropperVisible] = React.useState(false);
    // URI + size do native picker trả về, được truyền thẳng vào ImageCropperView
    const [selectedAsset, setSelectedAsset] = React.useState<{
        uri: string;
        width?: number;
        height?: number;
    } | null>(null);

    React.useEffect(() => {
        if (visible) {
            slideAnim.setValue(SCREEN_HEIGHT);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const handleCamera = () => {
        onClose();
        setTimeout(onOpenCamera, 300);
    };

    // Đóng bottom sheet → mở native gallery picker → sau khi chọn mới mở cropper
    const handleGallery = () => {
        onClose();
        setTimeout(() => {
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
        }, 300);
    };

    // Sau khi crop xong → đóng cropper → trả kết quả về consumer
    const handleCropDone = (uri: string, region: CropRegion) => {
        setCropperVisible(false);
        setSelectedAsset(null);
        onOpenGallery(uri, region);
    };

    const handleCropperClose = () => {
        setCropperVisible(false);
        setSelectedAsset(null);
    };

    return (
        <>
            {/* ── Bottom sheet ── */}
            <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
                <Pressable style={styles.backdrop} onPress={onClose}>
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                paddingBottom: Math.max(insets.bottom, spacing.lg),
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Pressable onPress={e => e.stopPropagation()}>
                            {/* Handle & title */}
                            <View style={styles.header}>
                                <View style={styles.indicator} />
                                <Text style={styles.title}>{title}</Text>
                                <Text style={styles.subtitle}>{subtitle}</Text>
                            </View>

                            {/* Options */}
                            <View style={styles.options}>
                                {/* Camera */}
                                <TouchableOpacity
                                    style={styles.optionCard}
                                    onPress={handleCamera}
                                    activeOpacity={0.75}
                                >
                                    <View style={[styles.iconBox, styles.iconBoxCamera]}>
                                        <Ionicons name="camera" size={26} color={colors.primary} />
                                    </View>
                                    <View style={styles.optionText}>
                                        <Text style={styles.optionTitle}>Chụp ảnh mới</Text>
                                        <Text style={styles.optionDesc}>
                                            Camera có khung căn chỉnh &amp; tự động cắt ảnh
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={18}
                                        color={colors.gray[400]}
                                    />
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                {/* Gallery → ImageCropperView */}
                                <TouchableOpacity
                                    style={styles.optionCard}
                                    onPress={handleGallery}
                                    activeOpacity={0.75}
                                >
                                    <View style={[styles.iconBox, styles.iconBoxGallery]}>
                                        <Ionicons name="images" size={26} color={colors.info} />
                                    </View>
                                    <View style={styles.optionText}>
                                        <Text style={styles.optionTitle}>Chọn từ thư viện</Text>
                                        <Text style={styles.optionDesc}>
                                            Chọn ảnh &amp; cắt vùng hình vuông tuỳ ý
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={18}
                                        color={colors.gray[400]}
                                    />
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>

            {/* ── ImageCropperView full-screen (sibling Modal, không lồng vào trong) ── */}
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
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.sm,
        overflow: 'hidden',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray[300],
        borderRadius: 2,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    options: {
        marginHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    iconBoxCamera: {
        backgroundColor: colors.primary + '15',
    },
    iconBoxGallery: {
        backgroundColor: colors.info + '15',
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
        marginBottom: 2,
    },
    optionDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        lineHeight: 17,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 50 + spacing.md * 2,
    },
});
