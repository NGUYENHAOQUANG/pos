import React, { useState } from 'react';
import { View, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { borderRadius, colors, spacing } from '@/styles';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { DropdownMaterial, DropdownOption } from '@/features/material/components/DropdownMaterial';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WarehouseInformationProps {
    date: Date;
    onDateChange: (date: Date) => void;
    supplier: string;
    onSupplierChange: (text: string) => void;
    supplierOptions?: DropdownOption[];
    children?: React.ReactNode;
}

export const WarehouseInformation: React.FC<WarehouseInformationProps> = ({
    date,
    onDateChange,
    supplier,
    onSupplierChange,
    supplierOptions = [],
    children,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

                    {/* Supplier Dropdown */}
                    <DropdownMaterial
                        label="Nhà cung cấp"
                        required
                        value={supplier}
                        options={supplierOptions}
                        onChange={onSupplierChange}
                        placeholder="Chọn nhà cung cấp"
                        showAllOption={false}
                        isOpen={isDropdownOpen}
                        onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                        inline={false}
                        useAutoScroll={true}
                    />

                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        margin: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 10,
    },

    content: {
        gap: spacing.md,
        paddingHorizontal: 12,
        paddingTop: spacing.md,
        paddingBottom: 12,
    },
});
