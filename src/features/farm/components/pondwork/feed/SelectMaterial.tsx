import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { borderRadius, colors, spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { DropDownSelectMaterial } from '@/features/farm/components/pondwork/feed/DropDownSelectMaterial';
import { Input, RequiredDot, InputFormat } from '@/shared/components/forms/Input';
import { Button } from '@/shared/components/buttons/Button';

interface SelectMaterialProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (data: { material: IMaterial; quantity: number; unit: string }) => void;
    materials: IMaterial[];
}

export const SelectMaterial: React.FC<SelectMaterialProps> = ({
    isVisible,
    onClose,
    onSave,
    materials,
}) => {
    const [selectedMaterial, setSelectedMaterial] = useState<IMaterial | undefined>();
    const [quantity, setQuantity] = useState('');
    const [selectedUnit, setSelectedUnit] = useState<string>('');

    // Reset form when modal closes
    useEffect(() => {
        if (!isVisible) {
            setSelectedMaterial(undefined);
            setQuantity('');
            setSelectedUnit('');
        }
    }, [isVisible]);

    // Initialize default unit when modal opens - REMOVED or Simplified
    // We strictly rely on material selection now as per request.

    // Auto-fill unit based on selected material
    useEffect(() => {
        if (selectedMaterial) {
            const targetUnit = selectedMaterial.unitName || selectedMaterial.unit || '';
            setSelectedUnit(String(targetUnit));
        } else {
            setSelectedUnit('');
        }
    }, [selectedMaterial]);

    const handleSave = () => {
        const parsedQuantity = parseFloat(quantity);
        if (selectedMaterial && quantity && selectedUnit && !isNaN(parsedQuantity)) {
            onSave({
                material: selectedMaterial,
                quantity: parsedQuantity,
                unit: selectedUnit,
            });
            setSelectedMaterial(undefined);
            setQuantity('');
            setSelectedUnit('');
            onClose();
        }
    };

    const handleCreateNewMaterial = () => {
        // Logic for creating new material - to be implemented or passed as prop
    };

    const handleImportMore = (_item: IMaterial) => {
        // Logic for importing more material
    };

    return (
        <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <KeyboardAvoidingView
                    style={styles.overlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.titleWrapper}>
                                    <Text style={styles.title}>Chọn vật tư</Text>
                                    <RequiredDot />
                                </View>
                                <TouchableOpacity
                                    onPress={onClose}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.content}>
                                {/* Material Selection */}
                                <View style={[styles.fieldGroup, { zIndex: 100 }]}>
                                    <View style={styles.labelWrapper}>
                                        <Text style={styles.label}>Chọn loại sản phẩm</Text>
                                        <RequiredDot />
                                    </View>
                                    <DropDownSelectMaterial
                                        data={materials}
                                        selectedItem={selectedMaterial}
                                        onSelect={setSelectedMaterial}
                                        onCreateNew={handleCreateNewMaterial}
                                        onImportMore={handleImportMore}
                                        placeholder="Chọn"
                                    />
                                </View>

                                {/* Quantity and Unit Row */}
                                <View style={styles.row}>
                                    {/* Quantity Input */}
                                    <View style={[styles.fieldGroup, styles.quantityContainer]}>
                                        <Input
                                            label="Số lượng"
                                            value={quantity}
                                            onChangeText={setQuantity}
                                            inputFormat={InputFormat.DECIMAL}
                                            maxDigits={6}
                                            keyboardType="decimal-pad"
                                            required
                                        />
                                    </View>

                                    {/* Unit Input - Disabled */}
                                    <View style={styles.quantityContainer}>
                                        <Input
                                            label="Đơn vị"
                                            placeholder="Đơn vị"
                                            value={selectedUnit}
                                            onChangeText={() => {}}
                                            editable={false}
                                            required
                                            disabled
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Footer Buttons */}
                            <View style={styles.footer}>
                                <Button
                                    title="Huỷ"
                                    variant="outline"
                                    onPress={onClose}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    title="Lưu"
                                    variant="primary"
                                    onPress={handleSave}
                                    disabled={!selectedMaterial || !quantity || !selectedUnit}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        width: '100%',
        zIndex: 1,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    content: {
        padding: spacing.md,
        gap: spacing.md,
        zIndex: 2,
    },
    fieldGroup: {
        gap: spacing.sm,
    },
    label: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 22,
    },
    required: {
        color: colors.error,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    quantityContainer: {
        flex: 1,
    },
    dropdown: {
        width: '100%',
    },
    unitContainer: {
        flex: 1,
    },
    unitDropdownWrapper: {
        height: 40,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        paddingTop: 0,
        zIndex: 1,
        gap: spacing.sm,
    },
});
