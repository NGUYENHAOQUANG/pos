import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    TouchableOpacity,
    Alert,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { Loading } from '@/shared/components/ui/Loading';
import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface HealthCheckItem {
    id: string;
    index: number;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    diagnosis: string;
    confidence: number; // 0-100
}

interface HealthCheckResult {
    id: number;
    totalCount: number;
    items: HealthCheckItem[];
    healthStatusSummary: string; // Summary string for display
    infectionRate: number; // percentage
}

export const ShrimpHealthCheckAIScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    const { pond: _pond } = (route.params as any) || {};

    // State for measurements history

    const [results, setResults] = useState<HealthCheckResult[]>([]);
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [_imageBase64, setImageBase64] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    // Show toast when new result arrives
    React.useEffect(() => {
        if (results.length > 0) {
            const latest = results[results.length - 1];
            const hasSick = latest.items.some(i => i.status !== 'HEALTHY');

            Toast.show({
                type: hasSick ? 'error' : 'success',
                text1: hasSick ? 'Phát hiện tôm bệnh !' : 'Tôm khỏe mạnh',
                visibilityTime: 3000,
            });
        }
    }, [results]);

    // Derived state for current/latest display
    const currentResult = results.length > 0 ? results[results.length - 1] : null;
    const previousResult = results.length > 1 ? results[results.length - 2] : null;

    const insets = useSafeAreaInsets();
    const countTimes = results.length;

    const isScreenLoading = isLoading;

    const handleImageSelect = (uri: string, base64?: string) => {
        _setImageUri(uri);
        if (base64) {
            setImageBase64(base64);
        }
    };

    const handleGetResult = () => {
        if (!imageUri) {
            Alert.alert('Chưa có hình ảnh', 'Vui lòng chọn hoặc chụp ảnh để kiểm tra.');
            return;
        }

        setIsLoading(true);
        // Simulate AI delay
        setTimeout(() => {
            setIsLoading(false);

            // Mock Data
            const mockCount = Math.floor(Math.random() * 20) + 5; // 5-25 shrimp

            // Generate Detailed Items
            const detailedItems: HealthCheckItem[] = Array.from({ length: mockCount }, (_, i) => {
                const rand = Math.random();
                let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
                let diagnosis = 'Khỏe mạnh';

                if (rand > 0.85) {
                    status = 'CRITICAL';
                    diagnosis = 'Đốm trắng';
                } else if (rand > 0.7) {
                    status = 'WARNING';
                    diagnosis = 'Mang đen';
                }

                return {
                    id: `${Date.now()}-${i}`,
                    index: i + 1,
                    status,
                    diagnosis,
                    confidence: Math.floor(Math.random() * 30) + 70,
                };
            });

            // Count issues
            const issuesCount = detailedItems.filter(i => i.status !== 'HEALTHY').length;
            const infectionRate = parseFloat(((issuesCount / mockCount) * 100).toFixed(2));

            // Generate Summary based on rules
            let summary = '';
            const firstSick = detailedItems.find(i => i.status !== 'HEALTHY');

            if (issuesCount > 0 && firstSick) {
                summary = `Tôm ${firstSick.index}: ${firstSick.diagnosis}... Xem thêm`;
            } else if (detailedItems.length > 0) {
                // All healthy
                summary = `Tôm ${detailedItems[0].index}: ${detailedItems[0].diagnosis}`;
            } else {
                summary = 'Chưa xác định';
            }

            const newResult: HealthCheckResult = {
                id: Date.now(),
                totalCount: mockCount,
                items: detailedItems,
                healthStatusSummary: summary,
                infectionRate: infectionRate,
            };

            setResults(prev => [...prev, newResult]);
        }, 1500);
    };

    const handleReset = () => {
        Alert.alert(
            'Kiểm tra lại',
            'Bạn có chắc chắn muốn kiểm tra lại không? Dữ liệu hiện tại sẽ bị xóa.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đồng ý',
                    onPress: () => {
                        _setImageUri(null);
                        setImageBase64(null);
                        setResults([]);
                    },
                },
            ]
        );
    };
    const handleShowDetails = () => {
        if (currentResult?.items && currentResult.items.length > 0) {
            setIsSheetVisible(true);
        } else {
            Alert.alert('Chưa có dữ liệu', 'Vui lòng lấy kết quả kiểm tra trước khi xem chi tiết.');
        }
    };

    const handleSave = () => {
        if (results.length > 0) {
            // Aggregate results
            const allItems = results.reduce<HealthCheckItem[]>((acc, r) => acc.concat(r.items), []);
            const totalCountAll = allItems.length;
            const sickCountAll = allItems.filter(i => i.status !== 'HEALTHY').length;

            // Cumulative Infection Rate
            const avgInfectionRate =
                totalCountAll > 0
                    ? parseFloat(((sickCountAll / totalCountAll) * 100).toFixed(2))
                    : 0;

            const isHealthy = sickCountAll === 0;
            const statusString = isHealthy ? 'Khỏe mạnh' : 'Nhiễm bệnh';

            const params = {
                aiHealthCheckResult: {
                    totalCount: totalCountAll,
                    infectionRate: avgInfectionRate,
                    status: statusString,
                    imageUri: imageUri, // Passing latest image
                    details: JSON.stringify(allItems), // Pass ALL items
                },
            };

            console.log('Sending AI Result:', params);

            navigation.navigate({
                name: 'ShrimpInspectionScreen',
                params,
                merge: true,
            } as any);
        } else {
            navigation.goBack();
        }
    };

    const getStatusColor = (status: 'HEALTHY' | 'WARNING' | 'CRITICAL') => {
        switch (status) {
            case 'HEALTHY':
                return '#4CAF50';
            case 'WARNING':
                return '#FF6E6E';
            case 'CRITICAL':
                return '#FF6E6E';
            default:
                return '#9E9E9E';
        }
    };

    const getStatusIcon = (status: 'HEALTHY' | 'WARNING' | 'CRITICAL') => {
        switch (status) {
            case 'HEALTHY':
                return 'checkmark-circle-outline';
            case 'WARNING':
                return 'alert-circle-outline';
            case 'CRITICAL':
                return 'close-circle-outline';
            default:
                return 'help-circle-outline';
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kiểm tra sức khỏe tôm bằng AI</Text>
                <View style={styles.headerSpacer} />
            </View>

            <Loading isLoading={isScreenLoading}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <SelectionInfoBox title="Kết quả kiểm tra từ AI">
                        {/* Total Count */}
                        <View>
                            <View style={styles.labelWrapper}>
                                <View style={styles.requiredWrapper}>
                                    <Text style={styles.required}>*</Text>
                                </View>
                                <Text style={styles.label}>
                                    Tổng số lượng tôm được kiểm tra - AI
                                </Text>
                            </View>
                            <View style={styles.readOnlyInput}>
                                <Text
                                    style={[
                                        styles.readOnlyText,
                                        !currentResult && styles.placeholderText,
                                    ]}
                                >
                                    {currentResult
                                        ? currentResult.totalCount.toString()
                                        : 'Kết quả số lượng tôm từ AI'}
                                </Text>
                                <Ionicons
                                    name="time-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                            <Text style={styles.helperText}>
                                Lần kiểm tra trước: {previousResult ? previousResult.totalCount : 0}
                            </Text>
                        </View>

                        {/* Health Status */}
                        <View>
                            <View style={styles.labelWrapper}>
                                <View style={styles.requiredWrapper}>
                                    <Text style={styles.required}>*</Text>
                                </View>
                                <Text style={styles.label}>Tình trạng tôm - AI</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.readOnlyInput}
                                onPress={handleShowDetails}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.readOnlyText,
                                        !currentResult && styles.placeholderText,
                                    ]}
                                >
                                    {currentResult
                                        ? currentResult.healthStatusSummary
                                        : 'Kết quả tình trạng tôm từ AI'}
                                </Text>
                                <Ionicons
                                    name="list-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Infection Rate */}
                        <View>
                            <View style={styles.readOnlyInputGray}>
                                <Text style={styles.label}>Trung bình tỉ lệ nhiễm bệnh</Text>
                                <Text style={styles.summaryValue}>
                                    {currentResult ? `${currentResult.infectionRate}%` : '-'}
                                </Text>
                            </View>
                            <Text style={styles.disclaimer}>
                                Kết quả được hệ thống tính tự động từ đầu ra của AI
                            </Text>
                        </View>

                        {/* Image Upload Area */}

                        <View>
                            <View>
                                <ImageUpload
                                    label="Hình ảnh xử lý"
                                    imageUri={imageUri}
                                    onImageSelect={handleImageSelect}
                                    onImageRemove={() => {
                                        _setImageUri(null);
                                        setImageBase64(null);
                                    }}
                                    returnBase64={true}
                                />

                                {/* Action Buttons */}
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.resetButton}
                                        onPress={handleReset}
                                    >
                                        <Text style={styles.resetButtonText}>Kiểm tra lại</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={handleGetResult}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            Lấy kết quả kiểm tra
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.countText}>Số lần kiểm tra: {countTimes}</Text>
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

            {/* Bottom Sheet Detail */}
            <Modal
                visible={isSheetVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsSheetVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => setIsSheetVisible(false)}>
                        <View style={StyleSheet.absoluteFill} />
                    </TouchableWithoutFeedback>
                    <Animated.View entering={SlideInDown.duration(300)} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIndicator} />
                            <Text style={styles.modalTitle}>
                                Chi tiết tình trạng tôm - Lần kiểm tra {countTimes}
                            </Text>
                        </View>
                        <ScrollView
                            style={styles.modalList}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.modalListContent}
                        >
                            {currentResult?.items.map(item => {
                                const color = getStatusColor(item.status);
                                return (
                                    <View key={item.id} style={[styles.cardContainer]}>
                                        <View style={styles.cardRow}>
                                            {/* Left: Index Badge */}
                                            <View
                                                style={[
                                                    styles.indexBadge,
                                                    { backgroundColor: color + '20' },
                                                ]}
                                            >
                                                <Text style={[styles.indexText, { color }]}>
                                                    {item.index}
                                                </Text>
                                            </View>

                                            {/* Center: Diagnosis */}
                                            <View style={styles.cardCenter}>
                                                <Text style={styles.diagnosisText}>
                                                    {item.diagnosis}
                                                </Text>
                                                <View style={styles.progressRow}>
                                                    <View style={styles.progressBarBackground}>
                                                        <View
                                                            style={[
                                                                styles.progressBarFill,
                                                                {
                                                                    width: `${item.confidence}%`,
                                                                    backgroundColor: color,
                                                                },
                                                            ]}
                                                        />
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.confidencePercent,
                                                            { color },
                                                        ]}
                                                    >
                                                        {item.confidence}%
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Right: Status Icon */}
                                            <View
                                                style={[
                                                    styles.statusIconContainer,
                                                    { backgroundColor: color + '15' },
                                                ]}
                                            >
                                                <Ionicons
                                                    name={getStatusIcon(item.status)}
                                                    size={20}
                                                    color={color}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
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
    readOnlyInputGray: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.gray[100], // Slightly gray background like in design
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        height: 44,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    readOnlyText: {
        fontSize: 14,
        color: colors.text,
    },
    placeholderText: {
        color: colors.textSecondary,
    },
    helperText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
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
        paddingVertical: spacing.sm,
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
        paddingBottom: spacing.sm,
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
        height: '60%', // Increased height for easier viewing
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
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        borderColor: colors.defaultBorder,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indexBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    indexText: {
        fontSize: 13,
        fontWeight: '700',
    },
    cardCenter: {
        flex: 1,
    },
    diagnosisText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBarBackground: {
        flex: 1,
        height: 6,
        backgroundColor: colors.gray[200],
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    confidencePercent: {
        fontSize: 11,
        fontWeight: '600',
        width: 32,
        textAlign: 'right',
    },
    statusIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
