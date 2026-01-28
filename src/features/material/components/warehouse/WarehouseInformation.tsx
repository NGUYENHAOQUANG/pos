import React, { useState } from 'react';
import { View, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { CollapseHead } from '../CollapseHead';
import { colors, spacing } from '@/styles';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import {
    DropdownMaterial,
    DropdownOption,
} from '@/features/material/components/material/DropdownMaterialGroup';

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
