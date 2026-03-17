import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles';
import { Checkbox } from '@/shared/components/forms/Checkbox';
import PencilSimpleLine from '@/assets/Icon/IconMenu/PencilSimpleLine.svg';

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
    return (
        <View style={styles.outerCard}>
            {/* Section Header */}
            <View style={styles.headerWrapper}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionSubtitle}>{subtitle}</Text>
            </View>

            {/* Parameter Items */}
            <View style={styles.itemsList}>
                {parameters.map(param => (
                    <View key={param.id} style={styles.itemCard}>
                        {/* Checkbox */}
                        <Checkbox
                            checked={param.isChecked}
                            onToggle={() => onToggleParameter(param.id)}
                            size="md"
                            activeColor={colors.primaryOrange}
                        />
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
                            <PencilSimpleLine width={16} height={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
        padding: 12,
        gap: 16,
    },
    headerWrapper: {
        gap: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray[950],
        lineHeight: 20,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.gray[500],
        lineHeight: 20,
    },
    itemsList: {
        gap: 8,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    childColumn: {
        flex: 1,
    },
    childTitle: {
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 20,
        color: colors.gray[950],
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subtitleLabel: {
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
        color: colors.gray[500],
    },
    childSubtitle: {
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
        color: colors.gray[500],
    },
    editButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
    },
});
