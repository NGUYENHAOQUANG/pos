import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '@/styles';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { RequiredDot } from '@/shared/components/forms/Input';

interface FeaturePermissionsProps {
    managementLevel: 'farm' | 'pond';
    onManagementLevelChange: (level: 'farm' | 'pond') => void;
    selectedPermissions: string[];
    onPermissionsChange: (permissions: string[]) => void;
    selectedUnitIds: string[];
    onUnitsChange: (ids: string[]) => void;
    onAddUnitPress: () => void;
    disabled?: boolean;
    availableUnits: { id: string; name: string }[];
}

const PERMISSIONS = [
    { id: 'member_management', label: 'Quản lý thành viên' },
    { id: 'task_execution', label: 'Thực hiện tác vụ/công việc' },
    { id: 'iot_control', label: 'Điều khiển thiết bị IoT' },
    { id: 'material_management', label: 'Quản Lý Vật Tư' },
];

export const FeaturePermissions: React.FC<FeaturePermissionsProps> = ({
    managementLevel,
    onManagementLevelChange,
    selectedPermissions,
    onPermissionsChange,
    selectedUnitIds,
    onUnitsChange,
    onAddUnitPress,
    disabled = false,
    availableUnits,
}) => {
    const isAllSelected = selectedPermissions.length === PERMISSIONS.length;

    const togglePermission = (id: string) => {
        if (disabled) return;
        if (selectedPermissions.includes(id)) {
            onPermissionsChange(selectedPermissions.filter(p => p !== id));
        } else {
            onPermissionsChange([...selectedPermissions, id]);
        }
    };

    const toggleAll = () => {
        if (disabled) return;
        if (isAllSelected) {
            onPermissionsChange([]);
        } else {
            onPermissionsChange(PERMISSIONS.map(p => p.id));
        }
    };

    const handleRemoveUnit = (idToRemove: string) => {
        if (disabled) return;
        onUnitsChange(selectedUnitIds.filter(id => id !== idToRemove));
    };

    const selectedUnits = availableUnits.filter(item => selectedUnitIds.includes(item.id));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Phân quyền tính năng</Text>
            </View>

            <View style={[styles.content, disabled && styles.disabledContent]}>
                {/* Management Level Section */}
                <View style={styles.section}>
                    <View style={styles.fieldLabelWrapper}>
                        <Text style={styles.fieldLabelText}>Chọn cấp quản lý</Text>
                        <RequiredDot />
                    </View>
                    <RadioButton
                        options={[
                            { label: 'Cấp trại nuôi', value: 'farm' },
                            { label: 'Cấp ao nuôi', value: 'pond' },
                        ]}
                        value={managementLevel}
                        onValueChange={onManagementLevelChange as any}
                        disabled={disabled}
                    />
                </View>

                {/* Work Unit Section */}
                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <View style={styles.fieldLabelWrapper}>
                            <Text style={styles.fieldLabelText}>Đơn vị công tác</Text>
                            <RequiredDot />
                        </View>
                        {!disabled && (
                            <TouchableOpacity onPress={onAddUnitPress} style={styles.addUnitButton}>
                                <Ionicons name="add" size={16} color={colors.primary} />
                                <Text style={styles.addUnitText}>Thêm đơn vị</Text>
                            </TouchableOpacity>
                        )}
                        {disabled && (
                            <View style={[styles.addUnitButton, styles.disabledElement]}>
                                <Ionicons name="add" size={16} color={colors.textSecondary} />
                                <Text style={[styles.addUnitText, { color: colors.textSecondary }]}>
                                    Thêm đơn vị
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.selectedUnitsList}>
                        {selectedUnits.map(unit => (
                            <View key={unit.id} style={styles.selectedUnitItem}>
                                <Text style={styles.selectedUnitText}>{unit.name}</Text>
                                {!disabled && (
                                    <TouchableOpacity
                                        onPress={() => handleRemoveUnit(unit.id)}
                                        style={styles.deleteButton}
                                    >
                                        <DeleteIcon width={16} height={16} />
                                    </TouchableOpacity>
                                )}
                                {disabled && (
                                    <View
                                        style={[
                                            styles.deleteButton,
                                            styles.disabledElement,
                                            { backgroundColor: colors.gray[100] },
                                        ]}
                                    >
                                        <DeleteIcon
                                            width={16}
                                            height={16}
                                            color={colors.textSecondary}
                                        />
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Permissions Section */}
                <View style={[styles.section, { marginBottom: 0 }]}>
                    <View style={styles.rowBetween}>
                        <View style={styles.fieldLabelWrapper}>
                            <Text style={styles.fieldLabelText}>Quyền thao tác</Text>
                            <RequiredDot />
                        </View>
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={toggleAll}
                            activeOpacity={0.8}
                            disabled={disabled}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    isAllSelected && styles.checkboxChecked,
                                    disabled && styles.checkboxDisabled,
                                ]}
                            >
                                {isAllSelected && (
                                    <Ionicons name="checkmark" size={14} color={colors.white} />
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.checkboxText,
                                    disabled && { color: colors.textSecondary },
                                ]}
                            >
                                Chọn tất cả
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.permissionsList}>
                        {PERMISSIONS.filter(p => {
                            if (managementLevel === 'pond') {
                                return ['task_execution', 'iot_control'].includes(p.id);
                            }
                            return true;
                        }).map(permission => {
                            const isSelected = selectedPermissions.includes(permission.id);
                            return (
                                <TouchableOpacity
                                    key={permission.id}
                                    style={styles.permissionItem}
                                    onPress={() => togglePermission(permission.id)}
                                    activeOpacity={0.8}
                                    disabled={disabled}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            isSelected && styles.checkboxChecked,
                                            disabled && styles.checkboxDisabled,
                                        ]}
                                    >
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark"
                                                size={14}
                                                color={colors.white}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        style={[
                                            styles.permissionText,
                                            disabled && { color: colors.textSecondary },
                                        ]}
                                    >
                                        {permission.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        paddingTop: spacing.md,
        paddingHorizontal: spacing.md,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    content: {
        padding: spacing.md,
    },
    disabledContent: {
        // opacity: 0.7, // Removed to ensure headers are dark
    },
    checkboxDisabled: {
        borderColor: colors.border,
        backgroundColor: colors.gray[100],
    },
    section: {
        marginBottom: spacing.md,
    },
    fieldLabelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    fieldLabelText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addUnitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addUnitText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '400',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    checkboxText: {
        fontSize: 14,
        color: colors.text,
    },
    permissionsList: {
        gap: spacing.md,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    permissionText: {
        fontSize: 14,
        color: colors.text,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    selectedUnitsList: {
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    selectedUnitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
    },
    selectedUnitText: {
        fontSize: 16,
        color: colors.text,
    },
    deleteButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.borderDark,
        backgroundColor: colors.white,
    },
    disabledElement: {
        // opacity: 0.5, // Removed to keep text dark
    },
});
