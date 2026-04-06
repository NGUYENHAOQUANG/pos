import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing, typography, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { RequiredDot } from '@/shared/components/forms/Input';
import { Checkbox } from '@/shared/components/forms/Checkbox';

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
    const theme = useAppTheme();
    const styles = getStyles(theme);

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
                    <View style={[styles.fieldLabelWrapper, { marginBottom: spacing.md }]}>
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
                <View style={[styles.section, { marginBottom: spacing.md }]}>
                    <View style={[styles.rowBetween, { marginBottom: spacing.md }]}>
                        <View style={styles.fieldLabelWrapper}>
                            <Text style={styles.fieldLabelText}>Đơn vị công tác</Text>
                            <RequiredDot />
                        </View>
                        {!disabled && (
                            <TouchableOpacity onPress={onAddUnitPress} style={styles.addUnitButton}>
                                <Ionicons name="add" size={16} color={theme.primary} />
                                <Text style={styles.addUnitText}>Thêm đơn vị</Text>
                            </TouchableOpacity>
                        )}
                        {disabled && (
                            <View style={[styles.addUnitButton, styles.disabledElement]}>
                                <Ionicons name="add" size={16} color={theme.textSecondary} />
                                <Text style={[styles.addUnitText, { color: theme.textSecondary }]}>
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
                                            { backgroundColor: theme.gray[100] },
                                        ]}
                                    >
                                        <DeleteIcon
                                            width={16}
                                            height={16}
                                            color={theme.textSecondary}
                                        />
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Permissions Section */}
                <View style={[styles.section, { marginBottom: 0 }]}>
                    <View style={[styles.rowBetween, { marginBottom: spacing.md }]}>
                        <View style={styles.fieldLabelWrapper}>
                            <Text style={styles.fieldLabelText}>Quyền thao tác</Text>
                            <RequiredDot />
                        </View>
                        <Checkbox
                            label="Chọn tất cả"
                            checked={isAllSelected}
                            onToggle={toggleAll}
                            disabled={disabled}
                            labelStyle={styles.checkboxText}
                            //activeColor={theme.primaryOrange}
                        />
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
                                <Checkbox
                                    key={permission.id}
                                    label={permission.label}
                                    checked={isSelected}
                                    onToggle={() => togglePermission(permission.id)}
                                    disabled={disabled}
                                    style={styles.permissionItem}
                                    labelStyle={styles.permissionText}
                                    //activeColor={theme.primaryOrange}
                                />
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        header: {
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        content: {
            padding: spacing.md,
        },
        disabledContent: {
            // opacity: 0.7, // Removed to ensure headers are dark
        },
        section: {
            marginBottom: spacing.md,
        },
        fieldLabelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        fieldLabelText: {
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: theme.text,
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
            color: theme.primary,
            fontSize: 14,
            fontWeight: '400',
        },
        checkboxText: {
            fontSize: 16,
            color: theme.text,
        },
        permissionsList: {
            gap: spacing.md,
        },
        permissionItem: {
            flex: 1,
        },
        permissionText: {
            fontSize: 14,
            color: theme.text,
        },
        selectedUnitsList: {
            gap: spacing.sm,
        },
        selectedUnitItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.sm,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.white,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
        },
        selectedUnitText: {
            fontSize: 16,
            color: theme.text,
        },
        deleteButton: {
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.borderDark,
            backgroundColor: theme.white,
        },
        disabledElement: {
            // opacity: 0.5, // Removed to keep text dark
        },
    });
