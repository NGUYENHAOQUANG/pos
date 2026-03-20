import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { borderRadius, colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { Button } from '@/shared/components/buttons/Button';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { IconAICheck, IconAICheckOrange } from '@/assets/icons';

export interface AIHealthCheckResult {
    totalCount: number;
    infectionRate: number;
    status: string;
    imageUri?: string | null;
    items?: any[];
    details?: string;
}

interface ShrimpInspectionObservationBoxProps {
    intestine: string;
    onIntestineChange: (value: string) => void;
    intestineColor: string;
    onIntestineColorChange: (value: string) => void;
    stoolColor: string;
    onStoolColorChange: (value: string) => void;
    liver: string;
    onLiverChange: (value: string) => void;
    onAICheckPress?: () => void;
    aiResult?: AIHealthCheckResult | null;
    onViewAIDetails?: () => void;
}

const intestineOptions = [
    { label: 'Đầy', value: 'Đầy' },
    { label: 'Rỗng', value: 'Rỗng' },
];
const intestineColorOptions = [
    { label: 'Màu thức ăn', value: 'Màu thức ăn' },
    { label: 'Màu đen', value: 'Màu đen' },
    { label: 'Bất thường', value: 'Bất thường' },
];
const stoolColorOptions = [
    { label: 'Màu thức ăn', value: 'Màu thức ăn' },
    { label: 'Bất thường', value: 'Bất thường' },
];
const liverOptions = [
    { label: 'Bình thường', value: 'Bình thường' },
    { label: 'Bất thường', value: 'Bất thường' },
];

export const ShrimpInspectionObservationBox: React.FC<ShrimpInspectionObservationBoxProps> = ({
    intestine,
    onIntestineChange,
    intestineColor,
    onIntestineColorChange,
    stoolColor,
    onStoolColorChange,
    liver,
    onLiverChange,
    onAICheckPress,
    aiResult,
    onViewAIDetails,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (isModalVisible) {
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
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [isModalVisible, slideAnim]);

    useEffect(() => {}, [aiResult]);

    const handleViewDetails = () => {
        setIsModalVisible(true);
        onViewAIDetails?.();
    };

    return (
        <SelectionInfoBox title="Quan sát mẫu">
            {/* AI Result Section */}
            <View style={styles.aiSection}>
                {aiResult ? (
                    <View style={styles.aiResultBox}>
                        <View style={styles.aiResultHeader}>
                            <IconAICheckOrange width={20} height={20} fill={colors.primaryOrange} />
                            <Text style={styles.aiResultTitle}>
                                Kết quả chuẩn đoán tình trạng tôm từ AI
                            </Text>
                        </View>

                        <View style={styles.aiResultRow}>
                            <Text style={styles.aiResultLabel}>Trung bình nhiễm bệnh</Text>
                            <Text style={styles.aiResultValue}>{aiResult.infectionRate}%</Text>
                        </View>

                        <View style={styles.aiResultRow}>
                            <Text style={styles.aiResultLabel}>Tình trạng tôm</Text>
                            {aiResult.status === 'Khỏe mạnh' ? (
                                <View style={styles.statusBadgeGreen}>
                                    <Text style={styles.statusTextGreen}>Khỏe mạnh</Text>
                                </View>
                            ) : (
                                <View style={styles.statusBadgeRed}>
                                    <Text style={styles.statusTextRed}>Nhiễm bệnh</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={styles.viewDetailLink} onPress={handleViewDetails}>
                            <Text style={styles.viewDetailLinkText}>Xem chi tiết</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
                <Button
                    title="Kiểm tra tôm bằng AI"
                    variant="outline"
                    onPress={onAICheckPress || (() => {})}
                    renderLeftIcon={
                        <IconAICheck width={20} height={20} fill={colors.textSecondary} />
                    }
                    fullWidth
                />
            </View>

            {/* Đường ruột */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Đường ruột</Text>
                <RadioButton
                    options={intestineOptions}
                    value={intestine}
                    onValueChange={onIntestineChange}
                    containerStyle={styles.radioGroup}
                    itemStyle={styles.radioItem}
                    gap={0}
                />
            </View>

            {/* Màu đường ruột */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Màu đường ruột</Text>
                <RadioButton
                    options={intestineColorOptions}
                    value={intestineColor}
                    onValueChange={onIntestineColorChange}
                    containerStyle={styles.radioGroup}
                    itemStyle={styles.radioItem}
                    gap={0}
                />
            </View>

            {/* Màu phân */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Màu phân</Text>
                <RadioButton
                    options={stoolColorOptions}
                    value={stoolColor}
                    onValueChange={onStoolColorChange}
                    containerStyle={styles.radioGroup}
                    itemStyle={styles.radioItem}
                    gap={0}
                />
            </View>

            {/* Gan */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Gan</Text>
                <RadioButton
                    options={liverOptions}
                    value={liver}
                    onValueChange={onLiverChange}
                    containerStyle={styles.radioGroup}
                    itemStyle={styles.radioItem}
                    gap={0}
                />
            </View>

            {/* Detail Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.modalContainer,
                                    {
                                        transform: [{ translateY: slideAnim }],
                                    },
                                ]}
                            >
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Tỉ lệ nhiễm bệnh</Text>
                                    <TouchableOpacity
                                        onPress={() => setIsModalVisible(false)}
                                        style={styles.closeButton}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <CloseIcon width={16} height={16} fill={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalBody}>
                                    {(() => {
                                        const diseaseGroups: Record<string, number> = {};
                                        let total = 0;

                                        if (aiResult?.items && aiResult.items.length > 0) {
                                            total = aiResult.totalCount || aiResult.items.length;
                                            aiResult.items.forEach((item: any) => {
                                                const diagnosis = item.diagnosis || 'Khỏe mạnh';
                                                diseaseGroups[diagnosis] =
                                                    (diseaseGroups[diagnosis] || 0) + 1;
                                            });
                                        } else if (aiResult) {
                                            if (aiResult.status === 'Khỏe mạnh') {
                                                diseaseGroups['Khỏe mạnh'] = 1;
                                                total = 1;
                                            } else {
                                                const statusList = aiResult.status
                                                    .split(',')
                                                    .map(s => s.trim());
                                                statusList.forEach(s => {
                                                    diseaseGroups[s] = 1;
                                                });
                                                total = statusList.length;
                                            }
                                        }

                                        const entries = Object.entries(diseaseGroups);
                                        if (entries.length > 0) {
                                            return entries.map(([name, count]) => (
                                                <View key={name} style={styles.diseaseRow}>
                                                    <Text style={styles.diseaseName}>{name}</Text>
                                                    <Text style={styles.diseasePercent}>
                                                        {name === 'Khỏe mạnh' &&
                                                        aiResult?.infectionRate === 0
                                                            ? '100%'
                                                            : `${((count / total) * 100).toFixed(
                                                                  2
                                                              )}%`}
                                                    </Text>
                                                </View>
                                            ));
                                        }

                                        return (
                                            <Text style={styles.noInfoText}>
                                                Không có thông tin chi tiết
                                            </Text>
                                        );
                                    })()}
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SelectionInfoBox>
    );
};

const styles = StyleSheet.create({
    aiSection: {
        marginBottom: spacing.md,
    },
    aiResultBox: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        backgroundColor: colors.white,
    },
    aiResultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    aiResultTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    aiResultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    aiResultLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    aiResultValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    statusBadgeGreen: {
        backgroundColor: colors.green[50],
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.green[100],
    },
    statusTextGreen: {
        color: colors.green[600],
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadgeRed: {
        backgroundColor: colors.red[50],
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.red[200],
    },
    statusTextRed: {
        color: colors.red[600],
        fontSize: 12,
        fontWeight: '600',
    },
    viewDetailLink: {
        alignSelf: 'center',
        marginTop: spacing.xs,
    },
    viewDetailLinkText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    inputGroup: {
        gap: spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    radioGroup: {
        flexWrap: 'wrap',
    },
    radioItem: {
        width: '48%',
        paddingVertical: 6,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    radioOuterSelected: {
        borderColor: colors.primaryOrange,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryOrange,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: 40,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        width: '100%',
    },
    diseaseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    diseaseName: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    diseasePercent: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    noInfoText: {
        textAlign: 'center',
        color: colors.textSecondary,
    },
});
