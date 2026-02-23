import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { Loading } from '@/shared/components/ui/Loading';
import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { Input } from '@/shared/components/forms/Input';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { formatDecimalInput } from '@/shared/utils/formatters';
import { useEstimateShrimpSize } from '@/features/farm/hooks/useAI';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    ShrimpMeasurementBoundingBoxOverlay,
    MeasurementDetectionBox,
} from '@/features/farm/components/boderbox/ShrimpMeasurementBoundingBoxOverlay';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type MeasureShrimpSizeAIScreenRouteProp = RouteProp<AppStackParamList, 'MeasureShrimpSizeAIScreen'>;

export const MeasureShrimpSizeAIScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<MeasureShrimpSizeAIScreenRouteProp>();
    const { pondId } = route.params || {};

    // Store action to save AI result
    const setLatestAIMeasurement = useFarmStore(state => state.setLatestAIMeasurement);

    // Use the hook
    const { mutate: estimateSize, isPending: isAnalyzing } = useEstimateShrimpSize();

    // State for measurements history
    interface Measurement {
        id: number;
        count: number;
        weight: number;
        sizes: number[];
        pcsPerKg: number;
    }

    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [measuredWeight, setMeasuredWeight] = useState<string>('');
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [isLoading, _setIsLoading] = useState(false);
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);

    const [detections, setDetections] = useState<MeasurementDetectionBox[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });

    // Derived state for current/latest display
    const currentMeasurement =
        measurements.length > 0 ? measurements[measurements.length - 1] : null;
    const previousMeasurement =
        measurements.length > 1 ? measurements[measurements.length - 2] : null;

    const previousAverageSizeCm = useMemo(() => {
        if (!previousMeasurement || previousMeasurement.sizes.length === 0) return 0;
        const total = previousMeasurement.sizes.reduce((sum, s) => sum + s, 0);
        return (total / previousMeasurement.sizes.length).toFixed(2);
    }, [previousMeasurement]);

    const previousSizePcsPerKg = useMemo(() => {
        if (!previousMeasurement || previousMeasurement.weight <= 0) return 0;
        console.log('previousMeasurement', previousMeasurement);
        return Math.round((1000 * previousMeasurement.count) / previousMeasurement.weight);
    }, [previousMeasurement]);

    const aiCount = currentMeasurement?.count ?? null;
    // Rule: Kích thước tôm có id là #1
    const sizeShrimp1 =
        currentMeasurement?.sizes && currentMeasurement.sizes.length > 0
            ? currentMeasurement.sizes[0]
            : null;

    const insets = useSafeAreaInsets();

    // Rule: Trung bình kích thước tôm (cm) = Tổng kích thước <tất cả lần đo> / tổng số lượng tôm được đo <tất cả lần đo>
    const averageSizeCm = useMemo(() => {
        if (measurements.length === 0) return null;
        let totalSizeSum = 0;
        let totalCount = 0;
        measurements.forEach(m => {
            totalSizeSum += m.sizes.reduce((sum, s) => sum + s, 0);
            totalCount += m.count;
        });
        if (totalCount === 0) return 0;
        return parseFloat((totalSizeSum / totalCount).toFixed(2));
    }, [measurements]);

    // Rule: Cỡ tôm (con/kg) = 1000 * Số lượng tôm được đo / Khối lượng tôm được đo
    const sizePcsPerKg = useMemo(() => {
        if (measurements.length === 0) return null;
        let totalCount = 0;
        let totalWeight = 0;
        measurements.forEach(m => {
            totalCount += m.count;
            totalWeight += m.weight;
        });
        if (totalWeight === 0) return 0;
        return Math.round((1000 * totalCount) / totalWeight);
    }, [measurements]);

    // Count times is just the length of history
    const countTimes = measurements.length;

    // Include isAnalyzing in loading state
    const isScreenLoading = isLoading || isAnalyzing;

    const handleImageSelect = async (
        uri: string,
        base64?: string,
        _file?: any,
        dimensions?: { width: number; height: number }
    ) => {
        _setImageUri(uri);
        if (base64) {
            setBase64Image(base64);
        }
        if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
            setImageDimensions(dimensions);
        }
        setDetections([]); // Clear previous detections
    };

    const handleGetCount = () => {
        const weightVal = parseFloat(measuredWeight);
        if (isNaN(weightVal) || weightVal <= 0) {
            Toast.show(ToastMessages.ShrimpMeasurement.WEIGHT_REQUIRED);
            return;
        }

        if (!base64Image) {
            Toast.show(ToastMessages.ShrimpMeasurement.IMAGE_REQUIRED);
            return;
        }

        estimateSize(
            { image_base: base64Image },
            {
                onSuccess: data => {
                    let count = 0;
                    let sizes: number[] = [];
                    let newDetections: MeasurementDetectionBox[] = [];

                    // New format with results object
                    if (data.results && data.results.objects) {
                        count = data.results.count;
                        sizes = data.results.objects.map(obj => obj.length_cm);

                        // Map to MeasurementDetectionBox
                        newDetections = data.results.objects.map(obj => ({
                            id: obj.id,
                            bbox: obj.bbox,
                            label: `${obj.length_cm.toFixed(2)} cm`,
                            confidence: obj.confidence,
                        }));
                    } else {
                        // Old format or fallback
                        if (data.detections) {
                            count = data.detections.length;
                            const avgSize = data.average_size_cm || 0;
                            sizes = Array(count).fill(avgSize);

                            if (data.detections.length > 0) {
                                newDetections = data.detections.map(
                                    (d: {
                                        id: number;
                                        box: number[];
                                        score: number;
                                        class_name: string;
                                    }) => ({
                                        id: d.id,
                                        bbox: d.box,
                                        confidence: d.score,
                                        label: d.class_name,
                                    })
                                );
                            }
                        } else {
                            // const _avgSize = data.average_size_cm || 0;
                            // const _pcsPerKg = data.shrimp_count_per_kg || 0;
                        }
                    }

                    // Calculate pcsPerKg locally
                    const pcsPerKg = weightVal > 0 ? Math.round((1000 * count) / weightVal) : 0;

                    const newMeasurement: Measurement = {
                        id: Date.now(),
                        count: count,
                        weight: weightVal,
                        sizes: sizes,
                        pcsPerKg: pcsPerKg,
                    };

                    setMeasurements(prev => [...prev, newMeasurement]);
                    setDetections(newDetections);
                    setMeasuredWeight('');
                },
            }
        );
    };

    const handleReset = () => {
        setIsResetModalVisible(true);
    };

    const confirmReset = () => {
        setIsResetModalVisible(false);
        _setImageUri(null);
        setMeasurements([]);
        setMeasuredWeight('');
        setDetections([]);
        Toast.show(ToastMessages.ShrimpMeasurement.RESET_SUCCESS);
    };

    const handleSave = () => {
        if (sizePcsPerKg !== null && averageSizeCm !== null) {
            // Save to store if we have a pondId
            if (pondId && aiCount !== null) {
                setLatestAIMeasurement(pondId, {
                    averageSizeCm,
                    sizePcsPerKg,
                    aiCount,
                    timestamp: Date.now(),
                });
            }

            navigation.navigate({
                name: 'MeasureShrimpSizeScreen',
                params: {
                    aiShrimpSize: sizePcsPerKg.toString(),
                },
                merge: true,
            } as any);
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đo kích thước & cỡ tôm bằng AI</Text>
                <View style={styles.headerSpacer} />
            </View>

            <Loading isLoading={isScreenLoading}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <SelectionInfoBox title="Thông tin nhập">
                        <Input
                            label="Khối lượng tôm được đo (g)"
                            value={measuredWeight}
                            onChangeText={text => setMeasuredWeight(formatDecimalInput(text))}
                            placeholder="Nhập khối lượng tôm được đo"
                            keyboardType="numeric"
                            required
                        />
                    </SelectionInfoBox>

                    <SelectionInfoBox title="Kết quả đo từ AI">
                        <View>
                            <View style={styles.labelWrapper}>
                                <View style={styles.requiredWrapper}>
                                    <Text style={styles.required}>*</Text>
                                </View>
                                <Text style={styles.label}>Tổng số lượng tôm được đo - AI</Text>
                            </View>
                            <View style={styles.readOnlyInput}>
                                <Text style={styles.readOnlyText}>
                                    {aiCount !== null
                                        ? aiCount.toString()
                                        : 'Kết quả số lượng tôm được đo từ AI'}
                                </Text>
                            </View>
                            <Text style={styles.helperText}>
                                Lần đo trước: {previousMeasurement ? previousMeasurement.count : 0}
                            </Text>
                        </View>
                        <View>
                            <View style={styles.labelWrapper}>
                                <View style={styles.requiredWrapper}>
                                    <Text style={styles.required}>*</Text>
                                </View>
                                <Text style={styles.label}>Kích thước tôm (cm) - AI</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.readOnlyInput}
                                onPress={() => {
                                    if (
                                        currentMeasurement?.sizes &&
                                        currentMeasurement.sizes.length > 0
                                    ) {
                                        setIsSheetVisible(true);
                                    } else {
                                        Toast.show(ToastMessages.ShrimpMeasurement.NO_DATA);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.readOnlyText}>
                                    {sizeShrimp1 !== null
                                        ? `Tôm 1: ${sizeShrimp1.toFixed(2)} cm... Xem thêm`
                                        : 'Kết quả kích thước tôm (cm) từ AI'}
                                </Text>
                                <Ionicons
                                    name="list-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <View style={styles.summaryBox}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>
                                        Trung bình kích thước tôm (cm)
                                    </Text>
                                    <Text style={styles.summaryValue}>
                                        {averageSizeCm !== null ? averageSizeCm : '-'}
                                    </Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Cỡ tôm (con/kg)</Text>
                                    <Text style={styles.summaryValue}>
                                        {sizePcsPerKg !== null ? sizePcsPerKg : '-'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.disclaimer}>
                                Kết quả được hệ thống tính tự động từ khối lượng và số lượng tôm
                                được đo
                            </Text>
                            {measurements.length > 1 && (
                                <View style={styles.previousStatsContainer}>
                                    <Text style={styles.previousStatsText}>
                                        • TBKTT (cm) lần đo trước: {previousAverageSizeCm}
                                    </Text>
                                    <Text style={styles.previousStatsText}>
                                        • CT (con/kg) lần đo trước: {previousSizePcsPerKg}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View>
                            <View
                                onLayout={event => {
                                    const { width, height } = event.nativeEvent.layout;
                                    setDisplayDimensions({ width, height });
                                }}
                            >
                                <ImageUpload
                                    label="Hình ảnh xử lý"
                                    imageUri={imageUri}
                                    onImageSelect={handleImageSelect}
                                    onImageRemove={() => {
                                        _setImageUri(null);
                                        setDetections([]);
                                        setImageDimensions({ width: 1, height: 1 });
                                    }}
                                    returnBase64={true}
                                    aspectRatio={
                                        imageDimensions.width > 0 && imageDimensions.height > 0
                                            ? imageDimensions.width / imageDimensions.height
                                            : 1
                                    }
                                >
                                    {imageUri && detections.length > 0 && (
                                        <ShrimpMeasurementBoundingBoxOverlay
                                            detections={detections}
                                            displayWidth={displayDimensions.width}
                                            displayHeight={
                                                displayDimensions.width /
                                                (imageDimensions.width / imageDimensions.height)
                                            }
                                            originalWidth={imageDimensions.width}
                                            originalHeight={imageDimensions.height}
                                        />
                                    )}
                                </ImageUpload>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                    <Text style={styles.resetButtonText}>Đo lại</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleGetCount}
                                >
                                    <Text style={styles.actionButtonText}>Lấy kết quả đo</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.countText}>Số lần đo: {countTimes}</Text>
                        </View>
                    </SelectionInfoBox>
                </ScrollView>
            </Loading>

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle="Lưu và Quay lại"
                    secondaryTitle="Hủy"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={navigation.goBack}
                    secondaryType="default"
                />
            </View>

            <Modal
                visible={isSheetVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsSheetVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsSheetVisible(false)}
                >
                    <Animated.View entering={SlideInDown.duration(300)} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIndicator} />
                            <Text style={styles.modalTitle}>
                                Danh sách kích thước tôm - Lần đo {countTimes}
                            </Text>
                        </View>
                        <ScrollView
                            style={styles.modalList}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.modalListContent}
                        >
                            {currentMeasurement?.sizes.map((size, index) => (
                                <Animated.View key={index} style={styles.modalItem}>
                                    <Text style={styles.modalItemLabel}>Tôm {index + 1}</Text>
                                    <Text style={styles.modalItemValue}>{size.toFixed(2)} cm</Text>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>

            <ConfirmationModal
                visible={isResetModalVisible}
                onConfirm={confirmReset}
                onCancel={() => setIsResetModalVisible(false)}
                type="measure_reset"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollContent: {
        padding: 0,
        paddingBottom: 100,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 24,
    },
    requiredWrapper: {
        width: 7,
        marginRight: 4,
    },
    required: {
        color: colors.error,
    },
    readOnlyInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        height: 44,
        backgroundColor: colors.white,
    },
    readOnlyText: {
        fontSize: 14,
        color: colors.text,
    },
    helperText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    summaryBox: {
        backgroundColor: colors.blue[50], // Light purple/blue background
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.blue[200],
        padding: spacing.md,
        marginTop: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.text,
    },
    summaryValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    disclaimer: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
    previousStatsContainer: {
        marginTop: spacing.xs,
        alignItems: 'flex-start',
        paddingHorizontal: spacing.md,
    },
    previousStatsText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    imageContainer: {
        height: 300,
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: 34,
    },
    resetButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    countText: {
        fontSize: 16,
        color: colors.text,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: spacing.sm, // Add padding for bottom
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        height: '60%',
        paddingBottom: spacing.xl,
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    modalIndicator: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray[300],
        borderRadius: 2,
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    modalList: {
        flex: 1,
    },
    modalListContent: {
        padding: spacing.md,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    modalItemLabel: {
        fontSize: 16,
        color: colors.text,
    },
    modalItemValue: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
