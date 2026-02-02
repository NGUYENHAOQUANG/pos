import React, { useState, useMemo } from 'react';
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
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { colors, spacing, borderRadius } from '@/styles';
import { IMaterialType } from '@/features/material/types/material.types';
import { IMaterialGroupV2 } from '@/features/material/types/materialGroup.types';
import { getMaterialTypeOptions } from '@/features/material/utils/dropdownOptions';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { Input } from '@/shared/components/forms/Input';

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
    unit?: string | number;
    onUnitChange?: (value: any) => void;
    groupOptions?: string[];
    unitOptions?: (string | DropdownOption)[];
    groupDisabled?: boolean;
    materialGroupsData?: IMaterialGroupV2[];
    typesByGroup?: IMaterialType[]; // Material types filtered by selected group

    // Advanced Info
    usage?: string;
    onUsageChange?: (text: string) => void;
    manufacturer?: string;
    onManufacturerChange?: (text: string) => void;
    onUnitDropdownOpen?: () => void;

    // Status
    isActive?: boolean;
    onIsActiveChange?: (value: boolean) => void;
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
    manufacturer,
    onManufacturerChange,
    onUnitDropdownOpen: _onUnitDropdownOpen,
    materialGroupsData: _materialGroupsData = [],
    typesByGroup = [],
    isActive,
    onIsActiveChange,
}) => {
    const [isBasicExpanded, setIsBasicExpanded] = useState(true);
    const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const typeOptions = useMemo(() => {
        if (!group) return [];
        // Use utility function with showEmptyMessage=true to handle empty case
        return getMaterialTypeOptions(typesByGroup, true);
    }, [group, typesByGroup]);

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
                    <>
                        <View style={styles.divider} />
                        <View style={styles.content}>
                            <Input
                                label="Tên vật tư"
                                required
                                // style={styles.input}
                                placeholder="Nhập tên vật tư"
                                placeholderTextColor={colors.textSecondary}
                                value={name}
                                onChangeText={onNameChange}
                            />

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
                                        placeholder="Chọn nhóm"
                                        dropdownStyle={styles.dropdownNegativeMargin}
                                        showAllOption={false}
                                        isOpen={activeDropdown === 'group'}
                                        onToggle={() => handleToggleDropdown('group')}
                                        disabled={groupDisabled}
                                        useAutoScroll={true}
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
                                        disabled={!group}
                                        useAutoScroll={true}
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
                                        useAutoScroll={true}
                                    />
                                </View>
                            </View>

                            {/* Status Radio Buttons */}
                            <View style={[styles.rowMarginTop]}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.label}>Trạng thái</Text>
                                </View>
                                <RadioButton
                                    options={[
                                        { label: 'Hoạt động', value: true },
                                        { label: 'Ngưng', value: false },
                                    ]}
                                    value={isActive}
                                    onValueChange={onIsActiveChange}
                                />
                            </View>
                        </View>
                    </>
                )}
            </View>

            {/* Advanced Info Section */}
            <View style={[styles.sectionContainer, styles.sectionContainerZ10]}>
                <CollapseHead
                    title="Thông tin nâng cao"
                    isExpanded={isAdvancedExpanded}
                    onToggle={toggleAdvancedExpand}
                />

                {isAdvancedExpanded && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.content}>
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.label}>Mô tả</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Nhập mô tả chi tiết vật tư"
                                    placeholderTextColor={colors.textSecondary}
                                    value={usage}
                                    onChangeText={onUsageChange}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            <Input
                                label="Nhãn hiệu"
                                placeholder="Nhập nhãn hiệu"
                                placeholderTextColor={colors.textSecondary}
                                value={manufacturer}
                                onChangeText={onManufacturerChange}
                                required
                            />
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
        marginBottom: spacing.sm,
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
        marginBottom: 12,
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
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: spacing.md,
    },
});
