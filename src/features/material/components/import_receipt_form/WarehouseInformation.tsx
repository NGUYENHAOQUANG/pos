import React, { useState } from 'react';
import { View, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { borderRadius, colors, spacing } from '@/styles';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { DropdownSupplierItem } from '@/features/material/components/import_receipt_form/DropdownSupplierItem';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WarehouseInformationProps {
    date: Date;
    onDateChange: (date: Date) => void;
    supplier: string;
    onSupplierChange: (supplierId: string) => void;
    supplierDisplayValue?: string;
    children?: React.ReactNode;
}

export const WarehouseInformation: React.FC<WarehouseInformationProps> = React.memo(
    ({ date, onDateChange, supplier, onSupplierChange, supplierDisplayValue, children }) => {
        const [isExpanded, setIsExpanded] = useState(true);

        const toggleExpand = React.useCallback(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsExpanded(prev => !prev);
        }, []);

        const handleSupplierChange = React.useCallback(
            (supplierId: string) => onSupplierChange(supplierId),
            [onSupplierChange]
        );

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

                        {/* Supplier Dropdown */}
                        <DropdownSupplierItem
                            label="Nhà cung cấp"
                            required
                            value={supplier}
                            onChange={handleSupplierChange}
                            placeholder="Nhập nhà cung cấp"
                            displayValue={supplierDisplayValue}
                            useAutoScroll={true}
                        />

                        {children}
                    </View>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    cardContainer: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 10,
    },

    content: {
        gap: spacing.md,
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
});
