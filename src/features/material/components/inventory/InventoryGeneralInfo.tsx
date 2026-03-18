import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import CalenderIcon from '@/assets/Icon/Calender.svg';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { colors, spacing, borderRadius } from '@/styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InventoryGeneralInfoProps {
    date: string;
    note: string;
    onDatePress: () => void;
    onNoteChange: (text: string) => void;
    materialGroup?: string;
    createdDate?: string;
    warehouseName?: string;
    creatorName?: string;
}

export const InventoryGeneralInfo: React.FC<InventoryGeneralInfoProps> = ({
    date,
    note,
    onDatePress,
    onNoteChange,
    // materialGroup = '---',
    createdDate = '',
    warehouseName = '',
    creatorName = '---',
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.container}>
            <CollapseHead
                title="Chi tiết"
                isExpanded={isExpanded}
                onToggle={toggleExpand}
                showIcon={true}
            />

            <View style={styles.body}>
                {/* Read-only info rows */}
                <InfoRow label="Kho" value={warehouseName || '---'} />
                <InfoRow label="Ngày tạo phiếu:" value={createdDate} />
                <InfoRow label="Người tạo phiếu:" value={creatorName} />
                {/* <InfoRow label="Nhóm vật tư" value={materialGroup} isLast /> */}

                {/* Input: Ngày kiểm kê (Bấm vào để chọn ngày) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <Text style={styles.required}>* </Text>Ngày kiểm kê
                    </Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={onDatePress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.inputText}>{date}</Text>
                        <CalenderIcon width={20} height={20} />
                    </TouchableOpacity>
                </View>

                {/* Input: Ghi chú */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ghi chú lý do điều chỉnh</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Nhập ghi chú"
                        placeholderTextColor={colors.gray[300]}
                        multiline
                        textAlignVertical="top"
                        value={note}
                        onChangeText={onNoteChange}
                    />
                </View>
            </View>
        </View>
    );
};

// Helper Component cho dòng thông tin
const InfoRow = ({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) => (
    <View style={[styles.row, isLast && styles.rowNoMargin]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        margin: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 10,
        marginBottom: spacing.md,
    },
    body: {
        padding: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        textAlign: 'right',
    },
    inputGroup: {
        marginTop: 16,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
        fontWeight: '400',
    },
    required: {
        color: colors.red[900],
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
    },
    inputText: {
        fontSize: 14,
        color: colors.text,
    },
    textArea: {
        height: 80,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        padding: 12,
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.white,
    },
    rowNoMargin: {
        marginBottom: 0,
    },
});
