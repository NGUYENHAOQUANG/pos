import React, { useState } from 'react';
import { View, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { DetailRow } from '@/features/material/components/DetailRow';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing, borderRadius } from '@/styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InventoryGeneralInfoProps {
    date: Date;
    note: string;
    onDateChange: (date: Date) => void;
    onNoteChange: (text: string) => void;
    createdDate?: string;
    warehouseName?: string;
    creatorName?: string;
}

export const InventoryGeneralInfo: React.FC<InventoryGeneralInfoProps> = ({
    date,
    note,
    onDateChange,
    onNoteChange,
    createdDate = '',
    warehouseName = '',
    creatorName = '---',
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.container}>
            <CollapseHead title="Chi tiết" isExpanded={isExpanded} onToggle={toggleExpand} />

            <View style={styles.body}>
                {/* Read-only info rows */}
                <DetailRow label="Kho" value={warehouseName || '---'} />
                <DetailRow label="Ngày tạo phiếu" value={createdDate} />
                <DetailRow label="Người tạo phiếu" value={creatorName} />

                {/* Date Input */}
                <DateInputButton
                    label="Ngày kiểm kê"
                    required
                    date={date}
                    onDateChange={onDateChange}
                    dateOnly
                    formatOptions={{ showCurrentLabel: false }}
                />

                {/* Input: Ghi chú */}
                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>Ghi chú lý do điều chỉnh</Text>
                    </View>

                    <TextInput
                        style={styles.textArea}
                        placeholder="Nhập ghi chú"
                        placeholderTextColor={theme.borderSubtle}
                        value={note}
                        onChangeText={onNoteChange}
                        multiline
                        textAlignVertical="top"
                        maxLength={2000}
                    />
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            marginHorizontal: spacing.md,
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.border,
            zIndex: 10,
            marginBottom: spacing.sm,
        },
        body: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md,
            gap: spacing.md,
        },
        inputContainer: {
            gap: 6,
        },
        labelContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            lineHeight: 20,
        },
        textArea: {
            minHeight: 104,
            maxHeight: 160,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 24,
            color: theme.text,
            textAlignVertical: 'top',
        },
    });
