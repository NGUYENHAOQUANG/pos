import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import {
    DropdownMaterial,
    DropdownOption,
} from '@/features/material/components/material/DropdownMaterialGroup';
import { CollapseHead } from '@/features/material/components/CollapseHead';
import { colors, spacing, borderRadius } from '@/styles';
import { useMaterialStore } from '@/features/material/store';
import { IMaterialGroup } from '@/features/material/types/material.types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Mapping từ đơn vị tính chính sang các đơn vị sử dụng tương ứng
// const UNIT_TO_USAGE_UNITS_MAP: Record<string, string[]> = {
//     // Khối lượng
//     Kg: ['Kg', 'g', 'mg'],
//     g: ['g', 'mg', 'kg'],
//     Gram: ['g', 'mg', 'kg'],
//     mg: ['mg', 'g'],
//     // Thể tích
//     Lít: ['Lít', 'ml'],
//     ml: ['ml', 'Lít'],
//     // Chiều dài
//     mét: ['m', 'cm', 'mm'],
//     // Thể tích khối
//     m3: ['m3', 'Lít', 'ml'],
// };

interface AddMaterialProps {
    // Basic Info
    name?: string;
    onNameChange?: (text: string) => void;
    group?: string;
    onGroupChange?: (value: string) => void;
    type?: string;
    onTypeChange?: (value: string) => void;
    unit?: string | number;
    onUnitChange?: (value: any) => void;
    groupOptions?: string[];
    unitOptions?: (string | DropdownOption)[];
    groupDisabled?: boolean;
    materialGroupsData?: IMaterialGroup[];

    // Advanced Info
    usage?: string;
    onUsageChange?: (text: string) => void;
    unitOfUse?: string;
    onUnitOfUseChange?: (value: string) => void;
    dosage?: string;
    onDosageChange?: (text: string) => void;
    manufacturer?: string;
    onManufacturerChange?: (text: string) => void;
    onUnitDropdownOpen?: () => void;
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
    groupDisabled = false,
    usage,
    onUsageChange,
    unitOfUse: _unitOfUse,
    onUnitOfUseChange: _onUnitOfUseChange,
    dosage: _dosage,
    onDosageChange: _onDosageChange,
    manufacturer,
    onManufacturerChange,
    onUnitDropdownOpen,
    materialGroupsData = [],
}) => {
    const [isBasicExpanded, setIsBasicExpanded] = useState(true);
    const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Get material types from store
    const fetchMaterialTypesByGroup = useMaterialStore(state => state.fetchMaterialTypesByGroup);
    const getMaterialTypeOptions = useMaterialStore(state => state.getMaterialTypeOptions);
    const isLoadingMaterialTypes = useMaterialStore(state => state.isLoadingMaterialTypes);

    // Get type options for selected group
    const typeOptions = useMemo(() => {
        if (!group) return [];
        return getMaterialTypeOptions(group);
    }, [group, getMaterialTypeOptions]);

    // Fetch material types when group changes
    useEffect(() => {
        if (group && materialGroupsData.length > 0) {
            fetchMaterialTypesByGroup(group);
        }
    }, [group, materialGroupsData, fetchMaterialTypesByGroup]);

    const handleToggleDropdown = (key: string) => {
        if (activeDropdown === key) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(key);
            if (key === 'unitOfUse') {
                onUnitDropdownOpen?.();
            }
        }
    };

    // Calculate options for Unit of Use based on selected Unit
    // Commented out - UNIT_TO_USAGE_UNITS_MAP is no longer used
    // const unitOfUseOptions = useMemo(() => {
    //     if (!unit) return [];
    //     // Find the label (name) corresponding to the unit value (id)
    //     const selectedOption = unitOptions.find(opt =>
    //         typeof opt === 'string' ? opt === unit : opt.value === unit
    //     );
    //     const unitName = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;

    //     return unitName && UNIT_TO_USAGE_UNITS_MAP[unitName]
    //         ? UNIT_TO_USAGE_UNITS_MAP[unitName]
    //         : [];
    // }, [unit, unitOptions]);

    // Reset unitOfUse if current value is not in the new options
    // Commented out - unitOfUseOptions is no longer used
    // useEffect(() => {
    //     if (unit && unitOfUse && unitOfUseOptions.length > 0) {
    //         if (!unitOfUseOptions.includes(unitOfUse)) {
    //             onUnitOfUseChange?.('');
    //         }
    //     } else if (!unit) {
    //         onUnitOfUseChange?.('');
    //     }
    // }, [unit, unitOfUse, unitOfUseOptions, onUnitOfUseChange]);

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
                    <>
                        <View style={styles.divider} />
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
                                        isOpen={activeDropdown === 'group'}
                                        onToggle={() => handleToggleDropdown('group')}
                                        disabled={groupDisabled}
                                    />
                                </View>
                                <View style={styles.halfWidth}>
                                    <DropdownMaterial
                                        label="Loại vật tư"
                                        required
                                        onChange={onTypeChange}
                                        value={type}
                                        // Pass derived options based on group
                                        options={typeOptions}
                                        placeholder="Chọn loại"
                                        dropdownStyle={styles.dropdownNegativeMargin}
                                        isOpen={activeDropdown === 'type'}
                                        onToggle={() => handleToggleDropdown('type')}
                                        disabled={!group || isLoadingMaterialTypes}
                                    />
                                </View>
                            </View>

                            <View style={[styles.row, styles.rowMarginTop, styles.rowZ20]}>
                                <View style={styles.halfWidth}>
                                    <DropdownMaterial
                                        label="Đơn vị tính"
                                        required
                                        value={unit}
                                        options={unitOptions}
                                        onChange={onUnitChange}
                                        isOpen={activeDropdown === 'unit'}
                                        onToggle={() => handleToggleDropdown('unit')}
                                        placeholder="Chọn đơn vị tính"
                                        showAllOption={false}
                                    />
                                </View>
                            </View>
                        </View>
                    </>
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
                    <>
                        <View style={styles.divider} />
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

                            {/* <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    <UnitOfUse
                                        label="Đơn vị sử dụng"
                                        value={unitOfUse}
                                        options={unitOfUseOptions}
                                        onChange={onUnitOfUseChange}
                                        isOpen={activeDropdown === 'unitOfUse'}
                                        onToggle={() => handleToggleDropdown('unitOfUse')}
                                        placeholder={
                                            unit ? 'Chọn đơn vị sử dụng' : 'Chọn đơn vị tính trước'
                                        }
                                        disabled={!unit}
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
                            </View> */}

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
                    </>
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
        lineHeight: 20,
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
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: spacing.md,
    },
});
