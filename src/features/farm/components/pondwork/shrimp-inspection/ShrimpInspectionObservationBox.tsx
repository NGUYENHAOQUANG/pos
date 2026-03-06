import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { borderRadius, colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { RadioButton } from '@/shared/components/forms/RadioButton';

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

    useEffect(() => {}, [aiResult]);

    const handleViewDetails = () => {
        setIsModalVisible(true);
        onViewAIDetails?.();
    };

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
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.fullScreenModal}>
                    <HeaderSection
                        title="Tỉ lệ nhiễm bệnh"
                        onBack={() => setIsModalVisible(false)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalBody}>
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
                                                {diseases.filter(d => d !== 'Khỏe mạnh').length ===
                                                1
                                                    ? aiResult?.infectionRate
                                                    : '- '}
                                                %
                                            </Text>
                                        </View>
                                    ))
                            ) : (
                                <Text style={styles.noInfoText}>Không có thông tin chi tiết</Text>
                            )}
                        </View>
                    </View>
                </View>
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
        backgroundColor: colors.status.activeBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusTextGreen: {
        color: colors.status.activeText,
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadgeRed: {
        backgroundColor: colors.status.warningBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusTextRed: {
        color: colors.status.warningText,
        fontSize: 12,
        fontWeight: '600',
    },
    viewDetailButton: {
        alignSelf: 'center',
        backgroundColor: colors.status.warningText,
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
        marginBottom: spacing.xs,
    },
    // Modal Styles
    fullScreenModal: {
        flex: 1,
        backgroundColor: colors.white,
    },
    modalContent: {
        flex: 1,
        padding: spacing.md,
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
});
