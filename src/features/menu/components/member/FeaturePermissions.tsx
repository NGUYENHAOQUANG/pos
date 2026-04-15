import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Checkbox } from '@/shared/components/forms/Checkbox';
import { RequiredDot } from '@/shared/components/forms/Input';
import { IRole } from '@/features/menu/types/member.types';
import { PERMISSION_GROUPS, PERMISSION_COLUMNS } from '@/features/menu/constants/member.constants';

interface FeaturePermissionsProps {
    selectedRoles: string[]; // Use role IDs
    onRolesChange: (roles: string[]) => void;
    availableRoles: IRole[];
    selectedPermissions: string[];
    onPermissionsChange: (permissions: string[]) => void;
    disabled?: boolean;
}

const FeatureGroup = React.memo(
    ({
        group,
        selectedPermissions = [],
        onTogglePermission,
        onToggleGroup,
        disabled,
    }: {
        group: (typeof PERMISSION_GROUPS)[0];
        selectedPermissions: string[];
        onTogglePermission: (id: string) => void;
        onToggleGroup: (groupId: string, checked: boolean) => void;
        disabled?: boolean;
    }) => {
        const theme = useAppTheme();
        const styles = getStyles(theme);

        const hasAnySelection = useMemo(() => {
            return group.items.some(item =>
                PERMISSION_COLUMNS.some(col =>
                    selectedPermissions.includes(`${item.id}_${col.key}`)
                )
            );
        }, [group, selectedPermissions]);

        return (
            <View style={styles.groupContainer}>
                <View style={styles.groupHeader}>
                    <Checkbox
                        label={group.name}
                        checked={hasAnySelection}
                        onToggle={() => onToggleGroup(group.id, !hasAnySelection)}
                        disabled={disabled}
                        labelStyle={styles.checkboxLabel}
                        activeColor={theme.primaryOrange}
                    />
                </View>

                {hasAnySelection && (
                    <View style={styles.tableContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            overScrollMode="never"
                        >
                            <View style={styles.tableInner}>
                                <View style={styles.tableHead}>
                                    <View style={styles.colName} />
                                    {PERMISSION_COLUMNS.map(col => (
                                        <View key={col.key} style={styles.colCheck}>
                                            <Text style={styles.tableHeadText}>{col.label}</Text>
                                        </View>
                                    ))}
                                </View>

                                {group.items.map((item, index) => {
                                    const isLast = index === group.items.length - 1;

                                    return (
                                        <View
                                            key={item.id}
                                            style={[styles.tableRow, isLast && styles.tableRowLast]}
                                        >
                                            <View style={styles.colName}>
                                                <Text style={styles.rowLabelText}>{item.name}</Text>
                                            </View>
                                            {PERMISSION_COLUMNS.map(col => {
                                                const permId = `${item.id}_${col.key}`;
                                                return (
                                                    <View key={col.key} style={styles.colCheck}>
                                                        <Checkbox
                                                            checked={selectedPermissions.includes(
                                                                permId
                                                            )}
                                                            onToggle={() =>
                                                                onTogglePermission(permId)
                                                            }
                                                            disabled={disabled}
                                                            style={styles.centerCheckbox}
                                                            activeColor={theme.primaryOrange}
                                                        />
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                )}
            </View>
        );
    }
);

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.reduce((acc, group) => {
    const groupKeys = group.items.reduce((itemAcc, item) => {
        const itemKeys = PERMISSION_COLUMNS.map(col => `${item.id}_${col.key}`);
        return itemAcc.concat(itemKeys);
    }, [] as string[]);
    return acc.concat(groupKeys);
}, [] as string[]);

export const FeaturePermissions: React.FC<FeaturePermissionsProps> = ({
    selectedRoles = [],
    onRolesChange = () => {},
    availableRoles = [],
    selectedPermissions = [],
    onPermissionsChange = () => {},
    disabled = false,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const isAllSelected = selectedPermissions.length === ALL_PERMISSION_KEYS.length;

    const toggleRole = useCallback(
        (roleId: string) => {
            if (disabled) return;
            const nextRoles = selectedRoles.includes(roleId)
                ? selectedRoles.filter(id => id !== roleId)
                : [...selectedRoles, roleId];
            onRolesChange(nextRoles);
        },
        [disabled, selectedRoles, onRolesChange]
    );

    const togglePermission = useCallback(
        (permId: string) => {
            if (disabled) return;
            const nextPerms = selectedPermissions.includes(permId)
                ? selectedPermissions.filter(id => id !== permId)
                : [...selectedPermissions, permId];
            onPermissionsChange(nextPerms);
        },
        [disabled, selectedPermissions, onPermissionsChange]
    );

    const toggleGroup = useCallback(
        (groupId: string, selectAll: boolean) => {
            if (disabled) return;
            const group = PERMISSION_GROUPS.find(g => g.id === groupId);
            if (!group) return;

            // Trích xuất list key quyền thuộc riêng biệt group này
            const groupKeys = group.items.reduce((acc, item) => {
                const itemKeys = PERMISSION_COLUMNS.map(col => `${item.id}_${col.key}`);
                return acc.concat(itemKeys);
            }, [] as string[]);

            if (selectAll) {
                // Nạp thêm toàn bộ key của group vào danh sách đã chọn (dùng Set để chống trùng)
                const nextPerms = Array.from(new Set([...selectedPermissions, ...groupKeys]));
                onPermissionsChange(nextPerms);
            } else {
                // Bóc tách vứt bỏ toàn bộ key của group khỏi danh sách
                const nextPerms = selectedPermissions.filter(id => !groupKeys.includes(id));
                onPermissionsChange(nextPerms);
            }
        },
        [disabled, selectedPermissions, onPermissionsChange]
    );

    const toggleAll = useCallback(() => {
        if (disabled) return;
        onPermissionsChange(isAllSelected ? [] : ALL_PERMISSION_KEYS);
    }, [disabled, isAllSelected, onPermissionsChange]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Phân quyền tính năng</Text>
            </View>

            <View style={[styles.content, disabled && styles.disabledContent]}>
                {/* Roles Selection */}
                <View style={styles.section}>
                    <View style={styles.fieldLabelWrapper}>
                        <Text style={styles.fieldLabelText}>Chọn chức vụ</Text>
                        <RequiredDot />
                    </View>
                    <View style={styles.rolesList}>
                        {availableRoles.map(role => (
                            <Checkbox
                                key={role.id}
                                label={role.name}
                                checked={selectedRoles.includes(role.id)}
                                onToggle={() => toggleRole(role.id)}
                                disabled={disabled}
                                style={styles.marginBotCheckBox}
                                labelStyle={styles.checkboxLabel}
                                activeColor={theme.primaryOrange}
                            />
                        ))}
                    </View>
                </View>

                {/* Operations Layer */}
                <View style={styles.sectionNoBot}>
                    <View style={styles.rowBetween}>
                        <View style={styles.fieldLabelWrapper}>
                            <Text style={styles.fieldLabelText}>Quyền thao tác</Text>
                            <RequiredDot />
                        </View>
                        <Checkbox
                            label="Chọn tất cả"
                            checked={isAllSelected}
                            onToggle={toggleAll}
                            disabled={disabled}
                            labelStyle={styles.checkboxLabel}
                            activeColor={theme.primaryOrange}
                        />
                    </View>

                    <View style={styles.matrixContainer}>
                        {PERMISSION_GROUPS.map(group => (
                            <FeatureGroup
                                key={group.id}
                                group={group}
                                selectedPermissions={selectedPermissions}
                                onTogglePermission={togglePermission}
                                onToggleGroup={toggleGroup}
                                disabled={disabled}
                            />
                        ))}
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
        disabledContent: {},
        section: {
            marginBottom: spacing.md,
        },
        sectionNoBot: {
            marginBottom: 0,
        },
        fieldLabelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        fieldLabelText: {
            fontWeight: '500',
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0,
            color: theme.text,
        },
        rowBetween: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        checkboxLabel: {
            fontWeight: '400',
            fontSize: 16,
            lineHeight: 20,
            letterSpacing: 0,
            textAlignVertical: 'center',
            color: theme.text,
        },
        rolesList: {
            gap: spacing.md,
        },
        marginBotCheckBox: {},
        matrixContainer: {
            gap: spacing.md,
        },
        groupContainer: {},
        groupHeader: {},
        tableContainer: {
            marginTop: spacing.sm,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            overflow: 'hidden',
        },
        tableInner: {
            minWidth: '100%',
        },
        tableHead: {
            flexDirection: 'row',
            backgroundColor: theme.backgroundSecondary,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        tableHeadText: {
            fontWeight: '500',
            fontSize: 16,
            lineHeight: 20,
            letterSpacing: 0,
            textAlign: 'center',
            color: theme.textSecondary,
        },
        tableRow: {
            flexDirection: 'row',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.backgroundSecondary,
            alignItems: 'center',
        },
        tableRowLast: {
            borderBottomWidth: 0,
        },
        colName: {
            width: 180,
            paddingLeft: spacing.md,
            justifyContent: 'center',
        },
        rowLabelText: {
            fontWeight: '500',
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0,
            color: theme.text,
        },
        colCheck: {
            width: 70,
            alignItems: 'center',
            justifyContent: 'center',
        },
        centerCheckbox: {
            alignSelf: 'center',
        },
    });
