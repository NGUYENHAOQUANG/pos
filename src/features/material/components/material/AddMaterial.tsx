import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { DropdownMaterial } from './DropdownMaterialGroup';
import { DropdownMaterialType } from './DropdownMaterialType';
import { CollapseHead } from '../CollapseHead';
import { UnitOfMeasure } from './UnitOfMeasure';
import { UnitOfUse } from './UnitOfUse';
import { colors, spacing, borderRadius } from '@/styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AddMaterialProps {
    // Basic Info
    name?: string;
    onNameChange?: (text: string) => void;
    group?: string;
    onGroupChange?: (value: string) => void;
    type?: string;
    onTypeChange?: (value: string) => void;
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
    type,
    onTypeChange,
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

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const handleToggleDropdown = (key: string) => {
        if (activeDropdown === key) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(key);
        }
    };

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
            <View style={[styles.sectionContainer, styles.sectionContainerZ20]}>
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

                        <View style={[styles.row, styles.rowZ30]}>
                            <View style={styles.halfWidth}>
                                <DropdownMaterial
                                    label="Nhóm vật tư"
                                    required
                                    value={group}
                                    options={
                                        groupOptions && groupOptions.length > 0
                                            ? groupOptions
                                            : undefined
                                    }
                                    onChange={onGroupChange}
                                    placeholder="Chọn nhóm vật tư"
                                    dropdownStyle={styles.dropdownNegativeMargin}
                                    showAllOption={false}
                                    // --- TRUYỀN PROPS ---
                                    isOpen={activeDropdown === 'group'}
                                    onToggle={() => handleToggleDropdown('group')}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <DropdownMaterialType
                                    label="Loại vật tư"
                                    required
                                    value={type}
                                    onChange={onTypeChange}
                                    group={group}
                                    placeholder="Chọn loại"
                                    dropdownStyle={styles.dropdownNegativeMargin}
                                    isOpen={activeDropdown === 'type'}
                                    onToggle={() => handleToggleDropdown('type')}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, styles.rowMarginTop, styles.rowZ20]}>
                            <View style={styles.halfWidth}>
                                <UnitOfMeasure
                                    label="Đơn vị tính"
                                    required
                                    value={unit}
                                    options={unitOptions}
                                    onChange={onUnitChange}
                                    isOpen={activeDropdown === 'unit'}
                                    onToggle={() => handleToggleDropdown('unit')}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Advanced Info Section */}
            <View style={[styles.sectionContainer, styles.sectionContainerZ10]}>
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
                                    isOpen={activeDropdown === 'unitOfUse'}
                                    onToggle={() => handleToggleDropdown('unitOfUse')}
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
        color: colors.error,
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
    sectionContainerZ20: {
        zIndex: 20,
    },
    sectionContainerZ10: {
        zIndex: 10,
        marginBottom: 130,
    },
    dropdownNegativeMargin: {
        marginTop: spacing.xs,
    },
    rowZ30: {
        zIndex: 30,
    },
    rowZ20: {
        zIndex: 20,
    },
    rowMarginTop: {
        marginTop: spacing.md,
    },
});
