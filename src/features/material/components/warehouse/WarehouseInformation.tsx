import React, { useState } from 'react';
import { View, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { CollapseHead } from '../CollapseHead';
import { colors, spacing } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WarehouseInformationProps {
    date: Date;
    onDateChange: (date: Date) => void;
    supplier: string;
    onSupplierChange: (text: string) => void;
}

export const WarehouseInformation: React.FC<WarehouseInformationProps> = ({
    date,
    onDateChange,
    supplier,
    onSupplierChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.cardContainer}>
            <CollapseHead
                title="Thông tin nhập kho"
                isExpanded={isExpanded}
                onToggle={toggleExpand}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {/* Date Input */}
                    <DateInputButton
                        label="Ngày nhập"
                        required
                        date={date}
                        onDateChange={onDateChange}
                        dateOnly
                        formatOptions={{ showCurrentLabel: false }}
                    />

                    {/* Supplier Input */}
                    <Input
                        label="Nhà cung cấp"
                        required
                        placeholder="Nhập nhà cung cấp"
                        value={supplier}
                        onChangeText={onSupplierChange}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white,
        marginBottom: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },

    content: {
        padding: spacing.md,
        gap: 12,
    },
});
