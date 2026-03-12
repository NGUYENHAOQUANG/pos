import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { Loading } from '@/shared/components/ui/Loading';

import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { Input } from '@/shared/components/forms/Input';
import { Button } from '@/shared/components/buttons/Button';
import { AIImageProcessingSection } from '@/features/farm/components/pondwork/AIImageProcessingSection';

import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import InfoIcon from '@/assets/Icon/information-circle.svg';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import { formatDecimalInput } from '@/shared/utils/formatters';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
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
    const [hasAnalyzedCurrent, setHasAnalyzedCurrent] = useState(false);
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

    const countTimes = measurements.length;
    const showAddMore = countTimes >= 2 || (countTimes === 1 && !hasAnalyzedCurrent);

    const previousAverageSizeCm = useMemo(() => {
        if (!previousMeasurement || previousMeasurement.sizes.length === 0) return 0;
        const total = previousMeasurement.sizes.reduce((sum, s) => sum + s, 0);
        return (total / previousMeasurement.sizes.length).toFixed(2);
    }, [previousMeasurement]);

    const previousSizePcsPerKg = useMemo(() => {
        if (!previousMeasurement || previousMeasurement.weight <= 0) return 0;
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
        setHasAnalyzedCurrent(false);
    };

    const handleGetCount = async () => {
        const weightVal = parseFloat(measuredWeight);
        if (isNaN(weightVal) || weightVal <= 0) {
            Toast.show(ToastMessages.ShrimpMeasurement.WEIGHT_REQUIRED);
            return;
        }

        if (!base64Image || !imageUri) {
            Toast.show(ToastMessages.ShrimpMeasurement.IMAGE_REQUIRED);
            return;
        }

        _setIsLoading(true);

        try {
            const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
            const payload = {
                base64Content: base64Image,
                fileName: fileName,
                contentType: 'image/jpeg',
                storageType: 'Azure',
            };

            // Step 1: Upload to get document ID
            const uploadResponse = await apiClient.post(
                API_ENDPOINTS.DOCUMENT.UPLOAD_BASE64,
                payload
            );
            const data = uploadResponse.data as any;

            // Get ID from Base64 response
            const documentIdStr = data?.data?.document?.id;

            if (!documentIdStr) {
                throw new Error('Could not retrieve document ID from uploaded image.');
            }

            estimateSize(
                { documentId: documentIdStr },
                {
                    onSuccess: data => {
                        let count = 0;
                        let sizes: number[] = [];
                        let newDetections: MeasurementDetectionBox[] = [];

                        // New format with results object
                        if (data.results && data.results.objects) {
                            count = data.results.count;
                            sizes = data.results.objects.map(obj => obj.lengthCm);

                            // Map to MeasurementDetectionBox
                            newDetections = data.results.objects.map(obj => ({
                                id: obj.id,
                                bbox: obj.bbox,
                                label: `${obj.lengthCm.toFixed(2)} cm`,
                                confidence: obj.confidence,
                            }));
                        } else {
                            // Old format or fallback
                            if (data.detections) {
                                count = data.detections.length;
                                const avgSize = data.averageSizeCm || 0;
                                sizes = Array(count).fill(avgSize);

                                if (data.detections.length > 0) {
                                    newDetections = data.detections.map(
                                        (d: {
                                            id: number;
                                            box: number[];
                                            score: number;
                                            className: string;
                                        }) => ({
                                            id: d.id,
                                            bbox: d.box,
                                            confidence: d.score,
                                            label: d.className,
                                        })
                                    );
                                }
                            } else {
                                // const _avgSize = data.averageSizeCm || 0;
                                // const _pcsPerKg = data.shrimpCountPerKg || 0;
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
                        setHasAnalyzedCurrent(true);
                        Toast.show({
                            type: 'success',
                            text1: 'Đã có kết quả đo từ AI!',
                            position: 'bottom',
                        });
                    },
                    onError: (error: any) => {
                        console.error('Estimate Size AI Error:', error);
                        const errorMessage =
                            error?.response?.data?.message || 'Đo kích thước bằng AI thất bại';
                        Toast.show({
                            type: 'error',
                            text1: 'Lỗi',
                            text2: errorMessage,
                        });
                    },
                    onSettled: () => {
                        _setIsLoading(false);
                    },
                }
            );
        } catch (error: any) {
            console.error('Base64 processing failed:', error);
            const errorMessage =
                error?.response?.data?.message || 'Không thể upload hình ảnh để xử lý';
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: errorMessage,
            });
            _setIsLoading(false);
        }
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
                    <SelectionInfoBox title="Hình ảnh xử lý" style={{ marginTop: 0 }}>
                        <AIImageProcessingSection
                            imageUri={imageUri}
                            imageDimensions={imageDimensions}
                            displayDimensions={displayDimensions}
                            onImageSelect={handleImageSelect}
                            onImageAreaLayout={size => setDisplayDimensions(size)}
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
                        </AIImageProcessingSection>
                    </SelectionInfoBox>
                    <SelectionInfoBox title="Thông tin nhập" style={{ marginTop: 0 }}>
                        <Input
                            label="Khối lượng tôm được đo (g)"
                            value={measuredWeight}
                            onChangeText={text => setMeasuredWeight(formatDecimalInput(text))}
                            placeholder="Nhập khối lượng tôm được đo"
                            keyboardType="numeric"
                            required
                        />
                    </SelectionInfoBox>

                    <SelectionInfoBox title="Kết quả đo từ AI" style={{ marginTop: 0 }}>
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>
                                    Tổng số lượng tôm được đo - AI
                                </Text>
                                <Text style={styles.summaryValue}>
                                    {aiCount !== null ? aiCount.toString() : '-'}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Lần kiểm tra trước</Text>
                                <Text style={styles.summaryValue}>
                                    {previousMeasurement ? previousMeasurement.count : '-'}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Kích thước tôm</Text>
                                {sizeShrimp1 !== null && currentMeasurement ? (
                                    <TouchableOpacity
                                        style={[styles.statusPill, styles.statusPillNormal]}
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
                                        <Text
                                            style={[styles.statusText, styles.statusTextNormal]}
                                            numberOfLines={1}
                                        >
                                            Tôm 1: {sizeShrimp1.toFixed(2)} cm... Xem thêm
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.summaryValue}>-</Text>
                                )}
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Trung bình kích thước tôm</Text>
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
                            {measurements.length > 1 && (
                                <>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            TBKTT (cm) lần đo trước
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {previousAverageSizeCm}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            CT (con/kg) lần đo trước
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {previousSizePcsPerKg}
                                        </Text>
                                    </View>
                                </>
                            )}

                            {countTimes > 0 && (
                                <>
                                    <View style={styles.infoBox}>
                                        <InfoIcon width={20} height={20} style={styles.infoIcon} />
                                        <Text style={styles.infoText}>
                                            Bạn có thể chụp thêm hình để đo thêm nếu cần.
                                        </Text>
                                    </View>

                                    {showAddMore && (
                                        <OutlineButton
                                            label="Đo thêm"
                                            onPress={handleGetCount}
                                            labelStyle={styles.addMoreText}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    </SelectionInfoBox>
                </ScrollView>
            </Loading>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={styles.checkCountRow}>
                    <Text style={styles.checkCountLabel}>Số lần đo</Text>
                    <Text style={styles.checkCountValue}>{countTimes}</Text>
                </View>
                <View style={styles.buttonRow}>
                    {countTimes === 0 ? (
                        <Button
                            title="Bắt đầu đo"
                            variant="primary"
                            onPress={handleGetCount}
                            style={styles.flexButton}
                            disabled={!imageUri}
                        />
                    ) : (
                        <>
                            <Button
                                title="Đo lại"
                                variant="outline"
                                onPress={handleReset}
                                style={[styles.flexButton, { borderColor: colors.border }]}
                                textStyle={{ color: colors.textSecondary }}
                            />
                            <Button
                                title="Lấy kết quả đo"
                                variant="primary"
                                onPress={handleSave}
                                style={styles.flexButton}
                                disabled={measurements.length === 0}
                            />
                        </>
                    )}
                </View>
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
        paddingHorizontal: 0,
        paddingTop: 8,
        paddingBottom: 100,
        gap: 8,
    },
    summaryContainer: {
        gap: 12,
        paddingVertical: spacing.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 24,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginLeft: spacing.md,
    },
    infoBox: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 8,
        marginVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: colors.border,
        borderWidth: 1,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        lineHeight: 20,
        flex: 1,
    },
    addMoreText: {
        color: colors.textSecondary,
    },
    statusPill: {
        borderRadius: 100,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderWidth: 1,
        marginLeft: spacing.md,
        maxWidth: '60%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusPillNormal: {
        backgroundColor: colors.green[50],
        borderColor: colors.green[200],
    },
    statusTextNormal: {
        color: colors.green[600],
    },
    imageContainer: {
        height: 300,
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },

    checkCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: 12,
    },
    checkCountLabel: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    checkCountValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: spacing.md,
    },
    flexButton: {
        flex: 1,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 16,
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
