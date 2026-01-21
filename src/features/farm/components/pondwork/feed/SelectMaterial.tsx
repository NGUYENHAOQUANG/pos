import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { DropDownSelectMaterial } from '@/features/farm/components/pondwork/feed/DropDownSelectMaterial';
import { FarmInput } from '@/features/farm/components/pondwork/FarmInput';

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
        if (selectedMaterial && quantity && selectedUnit) {
            onSave({
                material: selectedMaterial,
                quantity: parseFloat(quantity),
                unit: selectedUnit,
            });
            // Reset form
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
                                <Text style={styles.title}>Chọn vật tư</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.content}>
                                {/* Material Selection */}
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>
                                        <Text style={styles.required}>* </Text>
                                        Chọn loại sản phẩm
                                    </Text>
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
                                        <FarmInput
                                            label="Số lượng"
                                            value={quantity}
                                            onChangeText={text => {
                                                let sanitized = text.replace(/[^0-9.]/g, '');
                                                const parts = sanitized.split('.');
                                                if (parts.length > 2) {
                                                    sanitized =
                                                        parts[0] + '.' + parts.slice(1).join('');
                                                }
                                                setQuantity(sanitized);
                                            }}
                                            keyboardType="decimal-pad"
                                            required
                                        />
                                    </View>

                                    {/* Unit Input - Disabled */}
                                    <View style={styles.quantityContainer}>
                                        <FarmInput
                                            label="Đơn vị"
                                            value={selectedUnit}
                                            onChangeText={() => {}}
                                            editable={false}
                                            required
                                            style={{
                                                backgroundColor: colors.gray[100],
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Footer Buttons */}
                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelButtonText}>Huỷ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.saveButton,
                                        (!selectedMaterial || !quantity || !selectedUnit) &&
                                            styles.disabledButton,
                                    ]}
                                    onPress={handleSave}
                                    disabled={!selectedMaterial || !quantity || !selectedUnit}
                                >
                                    <Text style={styles.saveButtonText}>Lưu</Text>
                                </TouchableOpacity>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        width: '100%',
        maxWidth: 400,
        zIndex: 1,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
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
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.sm,
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
        justifyContent: 'flex-end',
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray[100],
        zIndex: 1,
        gap: spacing.sm,
    },
    cancelButton: {
        height: 40,
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray[300],
        backgroundColor: colors.white,
    },
    cancelButtonText: {
        fontFamily: 'Nunito Sans',
        fontSize: 16,
        fontWeight: '400',
        fontStyle: 'normal',
        lineHeight: 24,
        color: colors.text,
    },
    saveButton: {
        height: 40,
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing.sm,
        backgroundColor: colors.primary,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: colors.gray[400],
    },
    saveButtonText: {
        fontFamily: 'Nunito Sans',
        fontSize: 16,
        fontWeight: '400',
        fontStyle: 'normal',
        lineHeight: 24,
        color: colors.white,
    },
});
