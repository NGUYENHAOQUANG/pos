import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { DropdownMaterial } from './DropdownMaterial';
import { CollapseHead } from '../CollapseHead';
import { UnitOfMeasure } from './UnitOfMeasure';
import { UnitOfUse } from './UnitOfUse';
import { colors, spacing, borderRadius } from '@/styles';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AddMaterialProps {
    // Basic Info
    name?: string;
    onNameChange?: (text: string) => void;
    group?: string;
    onGroupChange?: (value: string) => void;
    unit?: string;
    onUnitChange?: (value: string) => void;
    groupOptions?: string[];
    unitOptions?: string[];

    // Advanced Info
    usage?: string;
    onUsageChange?: (text: string) => void;
    unitOfUse?: string;
    onUnitOfUseChange?: (value: string) => void;
    dosage?: string;
    onDosageChange?: (text: string) => void;
    manufacturer?: string;
    onManufacturerChange?: (text: string) => void;
}

export const AddMaterial: React.FC<AddMaterialProps> = ({
    name,
    onNameChange,
    group,
    onGroupChange,
    unit,
    onUnitChange,
    groupOptions = [],
    unitOptions = [],
    usage,
    onUsageChange,
    unitOfUse,
    onUnitOfUseChange,
    dosage,
    onDosageChange,
    manufacturer,
    onManufacturerChange,
}) => {
    const [isBasicExpanded, setIsBasicExpanded] = useState(true);
    const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

    const toggleBasicExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsBasicExpanded(!isBasicExpanded);
    };

    const toggleAdvancedExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsAdvancedExpanded(!isAdvancedExpanded);
    };

    return (
        <View>
            {/* Basic Info Section */}
            <View style={[styles.sectionContainer, { zIndex: 20 }]}>
                <CollapseHead
                    title="Thông tin cơ bản"
                    isExpanded={isBasicExpanded}
                    onToggle={toggleBasicExpand}
                />

                {isBasicExpanded && (
                    <View style={styles.content}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.required}>* </Text>
                                <Text style={styles.label}>Tên vật tư</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập tên vật tư"
                                placeholderTextColor={colors.textSecondary || '#999'}
                                value={name}
                                onChangeText={onNameChange}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <DropdownMaterial
                                    label="Nhóm vật tư"
                                    required
                                    value={group}
                                    options={groupOptions && groupOptions.length > 0 ? groupOptions : undefined}
                                    onChange={onGroupChange}
                                    placeholder="Chọn nhóm vật tư"
                                    dropdownStyle={{ marginTop: -12 }}
                                    showAllOption={false}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <UnitOfMeasure
                                    label="Đơn vị tính"
                                    required
                                    value={unit}
                                    options={unitOptions}
                                    onChange={onUnitChange}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Advanced Info Section */}
            <View style={[styles.sectionContainer, { zIndex: 10 }]}>
                <CollapseHead
                    title="Thông tin nâng cao (không bắt buộc)"
                    isExpanded={isAdvancedExpanded}
                    onToggle={toggleAdvancedExpand}
                />

                {isAdvancedExpanded && (
                    <View style={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Công dụng</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Nhập công dụng"
                                placeholderTextColor={colors.textSecondary || '#999'}
                                value={usage}
                                onChangeText={onUsageChange}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <UnitOfUse
                                    label="Đơn vị sử dụng"
                                    value={unitOfUse}
                                    options={unitOptions}
                                    onChange={onUnitOfUseChange}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Liều dùng</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập liều dùng"
                                        placeholderTextColor={colors.textSecondary || '#999'}
                                        value={dosage}
                                        onChangeText={onDosageChange}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nhà sản xuất</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập nhà sản xuất"
                                placeholderTextColor={colors.textSecondary || '#999'}
                                value={manufacturer}
                                onChangeText={onManufacturerChange}
                            />
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        zIndex: 10,
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
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
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
        marginBottom: spacing.xs,
    },
    required: {
        fontSize: 14,
        color: colors.error || '#FF4D4F',
    },
    input: {
        height: 44,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        fontSize: 15,
        color: colors.text,
    },
    textArea: {
        height: 80,
        paddingVertical: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
        zIndex: 10,
    },
    halfWidth: {
        flex: 1,
    },
});
