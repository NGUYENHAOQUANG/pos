import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { borderRadius, colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

export interface AIHealthCheckResult {
    totalCount: number;
    infectionRate: number;
    status: string;
    imageUri?: string | null;
    items?: any[];
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

const intestineOptions = ['Đầy', 'Rỗng'];
const intestineColorOptions = ['Màu thức ăn', 'Màu đen', 'Bất thường'];
const stoolColorOptions = ['Màu thức ăn', 'Bất thường'];
const liverOptions = ['Bình thường', 'Bất thường'];

const renderRadioGroup = (options: string[], selected: string, onSelect: (val: string) => void) => (
    <View style={styles.radioGroup}>
        {options.map(option => (
            <TouchableOpacity
                key={option}
                style={styles.radioItem}
                onPress={() => onSelect(option)}
                activeOpacity={0.8}
            >
                <View style={[styles.radioOuter, selected === option && styles.radioOuterSelected]}>
                    {selected === option && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

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

    useEffect(() => {
        if (aiResult) {
            console.log('ShrimpInspectionObservationBox received aiResult:', aiResult);
        }
    }, [aiResult]);

    const handleViewDetails = () => {
        setIsModalVisible(true);
        onViewAIDetails?.();
    };

    // Parse status into a list if possible (e.g. "Disease A, Disease B")
    // For specific percentages found in the design, we would need more data from AI.
    // Currently mapping the total infection rate or splitting status.
    const diseases =
        aiResult?.status && aiResult.status !== 'Khỏe mạnh'
            ? aiResult.status.split(',').map(s => s.trim())
            : [];

    return (
        <SelectionInfoBox title="Quan sát mẫu">
            {/* AI Result Section */}
            <View style={styles.aiSection}>
                {aiResult ? (
                    <>
                        <Text style={styles.aiTitle}>Tình trạng tôm - AI</Text>
                        <View style={styles.aiResultBox}>
                            <View style={styles.aiResultRow}>
                                <Text style={styles.aiResultLabel}>
                                    Trung bình tỉ lệ nhiễm bệnh
                                </Text>
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
                            <TouchableOpacity
                                style={styles.viewDetailButton}
                                onPress={handleViewDetails}
                            >
                                <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.aiDisclaimer}>
                            Kết quả chẩn đoán tình trạng tôm từ AI
                        </Text>
                    </>
                ) : null}

                <TouchableOpacity style={styles.aiButton} onPress={onAICheckPress}>
                    <Text style={styles.aiButtonText}>Kiểm tra sức khỏe tôm bằng AI</Text>
                </TouchableOpacity>
            </View>

            {/* Đường ruột */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Đường ruột</Text>
                {renderRadioGroup(intestineOptions, intestine, onIntestineChange)}
            </View>

            {/* Màu đường ruột */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Màu đường ruột</Text>
                {renderRadioGroup(intestineColorOptions, intestineColor, onIntestineColorChange)}
            </View>

            {/* Màu phân */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Màu phân</Text>
                {renderRadioGroup(stoolColorOptions, stoolColor, onStoolColorChange)}
            </View>

            {/* Gan */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Gan</Text>
                {renderRadioGroup(liverOptions, liver, onLiverChange)}
            </View>

            {/* Detail Modal */}
            <Modal
                transparent
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Tỉ lệ nhiễm bệnh</Text>

                            <View style={styles.modalBody}>
                                {/* Show aggregated stats if available, otherwise show current record stats */}
                                {aiResult?.items && aiResult.items.length > 0 ? (
                                    Object.entries(
                                        aiResult.items.reduce(
                                            (acc: Record<string, number>, item: any) => {
                                                const diagnosis = item.diagnosis || 'Khỏe mạnh';
                                                acc[diagnosis] = (acc[diagnosis] || 0) + 1;
                                                return acc;
                                            },
                                            {}
                                        )
                                    )
                                        .filter(([diagnosis]) => diagnosis !== 'Khỏe mạnh')
                                        .map(([diagnosis, count]) => (
                                            <View key={diagnosis} style={styles.diseaseRow}>
                                                <Text style={styles.diseaseName}>{diagnosis}</Text>
                                                <Text style={styles.diseasePercent}>
                                                    {(
                                                        ((count as number) /
                                                            (aiResult.totalCount ||
                                                                aiResult.items!.length)) *
                                                        100
                                                    ).toFixed(2)}
                                                    %
                                                </Text>
                                            </View>
                                        ))
                                ) : diseases.filter(d => d !== 'Khỏe mạnh').length > 0 ? (
                                    diseases
                                        .filter(d => d !== 'Khỏe mạnh')
                                        .map((disease, index) => (
                                            <View key={index} style={styles.diseaseRow}>
                                                <Text style={styles.diseaseName}>{disease}</Text>
                                                <Text style={styles.diseasePercent}>
                                                    {diseases.filter(d => d !== 'Khỏe mạnh')
                                                        .length === 1
                                                        ? aiResult?.infectionRate
                                                        : '- '}
                                                    %
                                                </Text>
                                            </View>
                                        ))
                                ) : (
                                    <Text style={styles.noInfoText}>
                                        Không có thông tin chi tiết
                                    </Text>
                                )}
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalButtonPrimary}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={styles.modalButtonPrimaryText}>Quay lại</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </SelectionInfoBox>
    );
};

const styles = StyleSheet.create({
    aiSection: {
        marginBottom: spacing.md,
    },
    aiTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
        paddingBottom: spacing.xs,
    },
    aiResultBox: {
        borderWidth: 1,
        borderColor: colors.text,
        borderRadius: borderRadius.sm,
        padding: spacing.md,
        marginBottom: spacing.xs,
        backgroundColor: colors.gray[50],
    },
    aiResultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    aiResultLabel: {
        fontSize: 14,
        color: colors.text,
    },
    aiResultValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    statusBadgeGreen: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusTextGreen: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadgeRed: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusTextRed: {
        color: '#F44336',
        fontSize: 12,
        fontWeight: '600',
    },
    viewDetailButton: {
        alignSelf: 'center',
        backgroundColor: '#D32F2F',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 4,
        marginTop: spacing.xs,
    },
    viewDetailText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    aiDisclaimer: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    aiButton: {
        backgroundColor: colors.blue[50],
        paddingVertical: 12,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    inputGroup: {
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        height: 24,
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
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.lg,
    },
    modalBody: {
        width: '100%',
        marginBottom: spacing.lg,
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
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    modalButtonSecondary: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    modalButtonSecondaryText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    modalButtonPrimary: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    modalButtonPrimaryText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
});
