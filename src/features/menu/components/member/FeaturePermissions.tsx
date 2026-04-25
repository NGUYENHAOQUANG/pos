import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Checkbox } from '@/shared/components/forms/Checkbox';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { RequiredDot } from '@/shared/components/forms/Input';
import { IRole, RolePolicyModule, RolePolicy } from '@/features/menu/types/member.types';
import {
    POLICY_TYPE_LABELS,
    POLICY_TYPE_ORDER,
    MODULE_NAME_MAP,
    MODULE_GROUP_MAP,
    GROUP_ORDER,
} from '@/features/menu/constants/member.constants';

interface FeaturePermissionsProps {
    selectedRoles: string[];
    onRolesChange: (roles: string[]) => void;
    availableRoles: IRole[];
    selectedPermissions: string[];
    onPermissionsChange: (permissions: string[]) => void;
    rolePolicies?: RolePolicyModule[];
    disabled?: boolean;
}

/**
 * Resolves a Vietnamese display name for a module.
 * Tries the mapping first, then falls back to API moduleName, then module code.
 */
function resolveModuleName(mod: RolePolicyModule): string {
    const key = mod.module.toLowerCase();
    return MODULE_NAME_MAP[key] || mod.moduleName || mod.module;
}

/**
 * Resolves a Vietnamese group name for a module.
 * Tries the mapping first, then falls back to API moduleGroup, then "Khác".
 */
function resolveGroupName(mod: RolePolicyModule): string {
    const key = mod.module.toLowerCase();
    if (MODULE_GROUP_MAP[key]) {
        return MODULE_GROUP_MAP[key];
    }
    // If API provides a meaningful moduleGroup (not empty/generic), use it
    if (mod.moduleGroup && mod.moduleGroup !== '' && mod.moduleGroup !== mod.module) {
        return mod.moduleGroup;
    }
    return 'Khác';
}

interface PolicyGroup {
    groupName: string;
    modules: RolePolicyModule[];
}

const PolicyGroupView = React.memo(({ group }: { group: PolicyGroup; disabled?: boolean }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // Check if any policy in this group has permission
    const hasAnyPermission = useMemo(() => {
        return group.modules.some((mod: RolePolicyModule) =>
            mod.policies.some((p: RolePolicy) => p.hasPermission)
        );
    }, [group]);

    // Get all unique policy types across modules in this group, ordered
    const availableTypes = useMemo(() => {
        const typeSet = new Set<string>();
        group.modules.forEach((mod: RolePolicyModule) => {
            mod.policies.forEach((p: RolePolicy) => {
                if (p.type) {
                    typeSet.add(p.type);
                }
            });
        });
        // Return in standard order, then append any extra types not in order
        const ordered = POLICY_TYPE_ORDER.filter(t => typeSet.has(t));
        typeSet.forEach(t => {
            if (!ordered.includes(t)) {
                ordered.push(t);
            }
        });
        return ordered;
    }, [group]);

    return (
        <View style={styles.groupContainer}>
            <View style={styles.groupHeader}>
                <Checkbox
                    label={group.groupName}
                    checked={hasAnyPermission}
                    onToggle={() => {}}
                    disabled={true}
                    labelStyle={styles.checkboxLabel}
                    activeColor={theme.primaryOrange}
                />
            </View>

            {hasAnyPermission && (
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
                                {availableTypes.map((type: string) => (
                                    <View key={type} style={styles.colCheck}>
                                        <Text style={styles.tableHeadText}>
                                            {POLICY_TYPE_LABELS[type] || type}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {group.modules.map((mod: RolePolicyModule, index: number) => {
                                const isLast = index === group.modules.length - 1;
                                const displayName = resolveModuleName(mod);

                                return (
                                    <View
                                        key={mod.module}
                                        style={[styles.tableRow, isLast && styles.tableRowLast]}
                                    >
                                        <View style={styles.colName}>
                                            <Text style={styles.rowLabelText}>{displayName}</Text>
                                        </View>
                                        {availableTypes.map((type: string) => {
                                            const policy = mod.policies.find(
                                                (p: RolePolicy) => p.type === type
                                            );
                                            return (
                                                <View key={type} style={styles.colCheck}>
                                                    {policy ? (
                                                        <Checkbox
                                                            checked={policy.hasPermission}
                                                            onToggle={() => {}}
                                                            disabled={true}
                                                            style={styles.centerCheckbox}
                                                            activeColor={theme.primaryOrange}
                                                        />
                                                    ) : (
                                                        <View style={styles.emptyCell} />
                                                    )}
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
});

export const FeaturePermissions: React.FC<FeaturePermissionsProps> = ({
    selectedRoles = [],
    onRolesChange = () => {},
    availableRoles = [],
    rolePolicies,
    disabled = false,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // Group modules by resolved Vietnamese group name, respecting GROUP_ORDER
    const policyGroups: PolicyGroup[] = useMemo(() => {
        if (!rolePolicies || rolePolicies.length === 0) return [];

        const groupMap = new Map<string, RolePolicyModule[]>();
        rolePolicies.forEach((mod: RolePolicyModule) => {
            const groupName = resolveGroupName(mod);
            if (!groupMap.has(groupName)) {
                groupMap.set(groupName, []);
            }
            groupMap.get(groupName)!.push(mod);
        });

        // Sort groups according to GROUP_ORDER
        const groups: PolicyGroup[] = [];
        GROUP_ORDER.forEach((name: string) => {
            const modules = groupMap.get(name);
            if (modules && modules.length > 0) {
                groups.push({ groupName: name, modules });
                groupMap.delete(name);
            }
        });

        // Append any remaining groups not in GROUP_ORDER
        groupMap.forEach((modules, groupName) => {
            groups.push({ groupName, modules });
        });

        return groups;
    }, [rolePolicies]);

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
                        <RadioButton
                            options={availableRoles.map(role => ({
                                label: role.name,
                                value: role.id,
                            }))}
                            value={selectedRoles[0]}
                            onValueChange={val => {
                                if (!disabled) {
                                    onRolesChange([val as string]);
                                }
                            }}
                            disabled={disabled}
                            direction="column"
                            gap={spacing.sm}
                            labelStyle={styles.checkboxLabel}
                        />
                    </View>
                </View>

                {/* Operations Layer - only visible when a role is selected and policies loaded */}
                {selectedRoles.length > 0 && policyGroups.length > 0 && (
                    <View style={styles.sectionNoBot}>
                        <View style={styles.rowBetween}>
                            <View style={styles.fieldLabelWrapper}>
                                <Text style={styles.fieldLabelText}>Quyền thao tác</Text>
                            </View>
                        </View>

                        <View style={styles.matrixContainer}>
                            {policyGroups.map((group: PolicyGroup) => (
                                <PolicyGroupView
                                    key={group.groupName}
                                    group={group}
                                    disabled={true}
                                />
                            ))}
                        </View>
                    </View>
                )}
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
            fontSize: 13,
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
            width: 160,
            paddingLeft: spacing.md,
            justifyContent: 'center',
        },
        rowLabelText: {
            fontWeight: '500',
            fontSize: 13,
            lineHeight: 18,
            letterSpacing: 0,
            color: theme.text,
        },
        colCheck: {
            width: 56,
            alignItems: 'center',
            justifyContent: 'center',
        },
        centerCheckbox: {
            alignSelf: 'center',
        },
        emptyCell: {
            width: 20,
            height: 20,
        },
    });
