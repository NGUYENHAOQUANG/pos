import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { DropdownMaterial } from '../material/DropdownMaterialGroup';
import { CollapseHead } from '../CollapseHead';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface MaterialItem {
    id: string;
    materialName: string;
    quantity: string;
    price: string;
}

interface AddWarehouseMaterialProps {
    materials: MaterialItem[];
    onUpdateMaterial: (id: string, field: keyof MaterialItem, value: string) => void;
    onAddMaterial: () => void;
    materialOptions?: { label: string; value: string; unit: string }[];
}

export const AddWarehouseMaterial: React.FC<AddWarehouseMaterialProps> = ({
    materials,
    onUpdateMaterial,
    onAddMaterial,
    materialOptions = [],
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('vi-VN') + ' đ';
    };

    const materialNames = materialOptions.map(opt => opt.label);

    const handleToggleDropdown = (id: string) => {
        if (activeDropdownId === id) {
            setActiveDropdownId(null);
        } else {
            setActiveDropdownId(id);
        }
    };

    return (
        <View style={styles.mainMaterialCard}>
            <CollapseHead title="Vật tư nhập kho" isExpanded={isExpanded} onToggle={toggleExpand} />

            {isExpanded && (
                <View style={styles.mainContent}>
                    {materials.map((item, index) => {
                        const itemTotal =
                            (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
                        const displayTotal =
                            itemTotal > 0
                                ? formatCurrency(itemTotal)
                                : 'Vui lòng nhập số lượng và đơn giá';
                        const isDropdownOpen = activeDropdownId === item.id;

                        return (
                            <View
                                key={item.id}
                                style={[
                                    styles.materialWrapper,
                                    isDropdownOpen ? styles.zIndexHigh : styles.zIndexNormal,
                                ]}
                            >
                                <View style={styles.materialCard}>
                                    <View style={styles.materialHeader}>
                                        <Text style={styles.materialHeaderTitle}>
                                            Vật tư {index + 1}
                                        </Text>
                                    </View>

                                    <View style={styles.content}>
                                        <View style={[styles.inputGroup, styles.zIndexMedium]}>
                                            <DropdownMaterial
                                                label="Tên vật tư"
                                                required
                                                value={item.materialName}
                                                options={
                                                    materialNames.length > 0
                                                        ? materialNames
                                                        : [
                                                              'CP 09 – Thức ăn tôm giai đoạn 2',
                                                              'Biozeus Probiotics',
                                                              'Vôi',
                                                              'Khoáng',
                                                          ]
                                                }
                                                onChange={val =>
                                                    onUpdateMaterial(item.id, 'materialName', val)
                                                }
                                                placeholder="Chọn vật tư"
                                                showAllOption={false}
                                                isOpen={isDropdownOpen}
                                                onToggle={() => handleToggleDropdown(item.id)}
                                            />
                                        </View>

                                        <View style={[styles.row, styles.zIndexNormal]}>
                                            <View style={styles.halfWidth}>
                                                <View style={styles.labelContainer}>
                                                    <Text style={styles.required}>* </Text>
                                                    <Text style={styles.label}>Số lượng</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <TextInput
                                                        style={styles.innerInput}
                                                        placeholder="Nhập số lượng"
                                                        placeholderTextColor={colors.textSecondary}
                                                        value={item.quantity}
                                                        onChangeText={val => {
                                                            if (/^\d*\.?\d*$/.test(val)) {
                                                                onUpdateMaterial(
                                                                    item.id,
                                                                    'quantity',
                                                                    val
                                                                );
                                                            }
                                                        }}
                                                        keyboardType="numeric"
                                                    />
                                                    <Text style={styles.unitText}>
                                                        {materialOptions.find(
                                                            opt => opt.value === item.materialName
                                                        )?.unit || ''}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.halfWidth}>
                                                <View style={styles.labelContainer}>
                                                    <Text style={styles.required}>* </Text>
                                                    <Text style={styles.label}>Đơn giá (đ)</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <TextInput
                                                        style={styles.innerInput}
                                                        placeholder="Nhập đơn giá"
                                                        placeholderTextColor={colors.textSecondary}
                                                        value={item.price}
                                                        onChangeText={val =>
                                                            onUpdateMaterial(item.id, 'price', val)
                                                        }
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.footer}>
                                            <Text style={styles.footerLabel}>Thành tiền:</Text>
                                            <Text
                                                style={[
                                                    styles.footerValue,
                                                    !itemTotal && styles.placeholderText,
                                                ]}
                                            >
                                                {displayTotal}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={onAddMaterial}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={24} color={colors.textSecondary} />
                        <Text style={styles.addButtonText}>Thêm vật tư</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainMaterialCard: {
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
        zIndex: 1,
    },
    mainContent: {
        padding: spacing.md,
        zIndex: 2,
    },
    materialWrapper: {
        marginBottom: spacing.md,
    },
    materialCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    materialHeader: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
    },
    materialHeaderTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    content: {
        padding: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    labelContainer: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    required: {
        fontSize: 14,
        color: colors.error || '#FF4D4F',
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
    },
    innerInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: colors.text,
        padding: 0,
    },
    unitText: {
        fontSize: 15,
        color: colors.text,
        marginLeft: spacing.xs,
        flexShrink: 0,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    footerLabel: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '400',
    },
    footerValue: {
        fontSize: 15,
        color: '#FF4D4F',
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
        marginLeft: spacing.md,
    },
    placeholderText: {
        color: colors.textSecondary || '#999',
        fontWeight: '400',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: borderRadius.md,
        marginTop: spacing.xs,
        zIndex: 1,
    },
    addButtonText: {
        fontSize: 15,
        color: colors.text,
        marginLeft: spacing.xs,
        fontWeight: '500',
    },
    zIndexHigh: {
        zIndex: 100,
    },
    zIndexMedium: {
        zIndex: 20,
    },
    zIndexNormal: {
        zIndex: 10,
    },
});
