import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { DropdownMaterial, DropdownOption } from '../material/DropdownMaterialGroup';
import { colors, spacing, borderRadius } from '@/styles';
import { numericStringSchema } from '@/shared/utils/validation';

interface InventoryMaterialInputProps {
    materialName: string; // This is actually the ID or formatted value, but we might need label for display
    selectedMaterialId?: string; // Add explicit ID prop
    oldStock: number;
    newStock: string;
    onMaterialSelect: (val: string) => void;
    onNewStockChange: (val: string) => void;
    materialOptions?: DropdownOption[];
    onDropdownOpen?: () => void;
}

export const InventoryMaterialInput: React.FC<InventoryMaterialInputProps> = ({
    materialName, // ID or Value
    selectedMaterialId,
    oldStock,
    newStock,
    onMaterialSelect,
    onNewStockChange,
    materialOptions = [],
    onDropdownOpen,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const diff = newStock ? Number(newStock) - oldStock : 0;
    // Check if we have a selection (either by name prop being used as value, or explicit ID)
    const hasSelectedMaterial = !!materialName || !!selectedMaterialId;
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vật tư điều chỉnh</Text>
            <View style={styles.divider} />
            <View style={hasSelectedMaterial ? styles.dropdownWithMargin : styles.dropdownNoMargin}>
                <DropdownMaterial
                    value={selectedMaterialId || materialName} // Use ID preference
                    placeholder="Chọn vật tư"
                    options={materialOptions} // Now objects
                    onChange={onMaterialSelect} // Returns ID (value)
                    showAllOption={false}
                    isOpen={isDropdownOpen}
                    onToggle={() => {
                        const nextState = !isDropdownOpen;
                        setIsDropdownOpen(nextState);
                        if (nextState) {
                            onDropdownOpen?.();
                        }
                    }}
                    inline={false}
                />
            </View>

            {hasSelectedMaterial && (
                <View style={styles.inputContainer}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Tồn kho cũ:</Text>
                            <Text style={styles.oldStockValue}>{oldStock} Kg</Text>
                        </View>

                        <View style={styles.dividerVertical} />

                        <View style={styles.col}>
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>Tồn kho mới
                            </Text>
                            <View style={styles.stockInputWrapper}>
                                <TextInput
                                    style={styles.stockInput}
                                    keyboardType="numeric"
                                    value={newStock}
                                    onChangeText={text => {
                                        const normalizedText = text.replace(/,/g, '.');
                                        if (numericStringSchema.safeParse(normalizedText).success) {
                                            onNewStockChange(normalizedText);
                                        }
                                    }}
                                />
                                <Text style={styles.unit}>Kg</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.footer}>
                        <Text style={styles.footerLabel}>Tổng chênh lệch:</Text>
                        <Text
                            style={[
                                styles.footerValue,
                                diff < 0 ? styles.footerValueNegative : styles.footerValuePositive,
                            ]}
                        >
                            {diff > 0 ? `${diff}` : diff}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: { elevation: 1 },
        }),
    },
    title: {
        fontSize: 15,
        fontWeight: '600',

        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginVertical: 14,
        marginHorizontal: -spacing.md,
    },
    inputContainer: {
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    col: {
        flex: 1,
    },
    dividerVertical: {
        width: 1,
        height: '100%',
        backgroundColor: colors.gray[100],
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
    oldStockValue: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text,
        marginTop: 4,
    },
    stockInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        height: 40,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
    },
    stockInput: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        padding: 0,
        height: '100%',
    },
    unit: {
        color: colors.textTertiary,
        fontSize: 14,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 14,
        color: colors.text,
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    dropdownWithMargin: {
        marginBottom: 16,
        zIndex: 10,
    },
    dropdownNoMargin: {
        marginBottom: 0,
        zIndex: 10,
    },
    footerValueNegative: {
        color: colors.red[900],
    },
    footerValuePositive: {
        color: colors.success,
    },
});
