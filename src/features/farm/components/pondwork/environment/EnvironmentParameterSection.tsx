import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '@/styles';
import { IconEditOutlined, IconCheckActive, IconCheckUnactive } from '@/assets/icons';

export interface EnvironmentParameter {
    id: string;
    name: string;
    limit: string;
    isChecked: boolean;
    unit?: string;
    min?: string;
    max?: string;
    alertEnabled?: boolean;
}

interface EnvironmentParameterSectionProps {
    title: string;
    subtitle: string;
    parameters: EnvironmentParameter[];
    onToggleParameter: (id: string) => void;
    onEdit?: (parameter: EnvironmentParameter) => void;
}

export const EnvironmentParameterSection: React.FC<EnvironmentParameterSectionProps> = ({
    title,
    subtitle,
    parameters,
    onToggleParameter,
    onEdit,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <TouchableOpacity
                style={[styles.sectionHeader, !isExpanded && styles.sectionHeaderCollapsed]}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <View style={styles.sectionHeaderContent}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <Text style={styles.sectionSubtitle}>{subtitle}</Text>
                </View>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>

            {/* Child Content */}
            {isExpanded &&
                parameters.map((param, index) => (
                    <React.Fragment key={param.id}>
                        <View style={styles.childRowWrapper}>
                            <View style={styles.childRow}>
                                {/* Checkbox */}
                                <TouchableOpacity
                                    onPress={() => onToggleParameter(param.id)}
                                    activeOpacity={0.7}
                                >
                                    {param.isChecked ? (
                                        <IconCheckActive width={16} height={16} />
                                    ) : (
                                        <IconCheckUnactive width={16} height={16} />
                                    )}
                                </TouchableOpacity>

                                {/* Column with title and subtitle */}
                                <View style={styles.childColumn}>
                                    <Text style={styles.childTitle}>{param.name}</Text>
                                    <View style={styles.subtitleRow}>
                                        <Text style={styles.subtitleLabel}>Giới hạn:</Text>
                                        <Text style={styles.childSubtitle}>{param.limit}</Text>
                                    </View>
                                </View>

                                {/* Edit Button */}
                                <TouchableOpacity
                                    style={styles.editButton}
                                    activeOpacity={0.7}
                                    onPress={() => onEdit && onEdit(param)}
                                >
                                    <IconEditOutlined width={16} height={16} />
                                </TouchableOpacity>
                            </View>

                            {index < parameters.length - 1 && <View style={styles.divider} />}
                        </View>
                    </React.Fragment>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.white,
    },
    sectionHeaderCollapsed: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeaderContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        lineHeight: 22,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textMuted,
        lineHeight: 22,
    },
    childRowWrapper: {
        width: '100%',
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
    },
    childRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        gap: spacing.md,
    },

    childColumn: {
        flex: 1,
    },
    childTitle: {
        fontWeight: typography.fontWeight.bold,
        fontSize: 14,
        lineHeight: 22,
        color: colors.text,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    subtitleLabel: {
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 14,
        lineHeight: 22,
        color: colors.textMuted,
    },
    childSubtitle: {
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 14,
        lineHeight: 22,
        color: colors.textMuted,
    },
    editButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
});
