import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Checkbox } from '@/shared/components/forms/Checkbox';
import PencilSimpleLine from '@/assets/Icon/IconMenu/PencilSimpleLine.svg';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';

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
    onBoardingNextStep?: () => void;
}

export const EnvironmentParameterSection: React.FC<EnvironmentParameterSectionProps> = ({
    title,
    subtitle,
    parameters,
    onToggleParameter,
    onEdit,
    onBoardingNextStep,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.outerCard}>
            {/* Section Header */}
            <View style={styles.headerWrapper}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionSubtitle}>{subtitle}</Text>
            </View>

            {/* Parameter Items */}
            <View style={styles.itemsList}>
                {parameters.map((param, index) => {
                    const isFirstDefault = index === 0 && title === 'Nhóm mặc định';

                    const checkboxElement = (
                        <View style={{ backgroundColor: theme.background, borderRadius: 4 }}>
                            <Checkbox
                                checked={param.isChecked}
                                onToggle={() => onToggleParameter(param.id)}
                                size="md"
                                activeColor={theme.primaryOrange}
                            />
                        </View>
                    );

                    const editBtnElement = (
                        <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: theme.background }]}
                            activeOpacity={0.7}
                            onPress={() => onEdit && onEdit(param)}
                        >
                            <PencilSimpleLine width={16} height={16} color={theme.textSecondary} />
                        </TouchableOpacity>
                    );

                    return (
                        <View key={param.id} style={styles.itemCard}>
                            {/* Checkbox */}
                            {isFirstDefault ? (
                                <OnboardingStep step="ACCOUNT_ENV_SETTING_TOGGLE">
                                    <View collapsable={false}>{checkboxElement}</View>
                                </OnboardingStep>
                            ) : (
                                checkboxElement
                            )}

                            {/* Column with title and subtitle */}
                            <View style={styles.childColumn}>
                                <Text style={styles.childTitle}>{param.name}</Text>
                                <View style={styles.subtitleRow}>
                                    <Text style={styles.subtitleLabel}>Giới hạn:</Text>
                                    <Text style={styles.childSubtitle}>{param.limit}</Text>
                                </View>
                            </View>

                            {/* Edit Button */}
                            {isFirstDefault ? (
                                <OnboardingStep
                                    step="ACCOUNT_ENV_SETTING_EDIT"
                                    onNext={onBoardingNextStep}
                                >
                                    <View collapsable={false}>{editBtnElement}</View>
                                </OnboardingStep>
                            ) : (
                                editBtnElement
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        outerCard: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            padding: 12,
            gap: 16,
        },
        headerWrapper: {
            gap: 4,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
            lineHeight: 20,
        },
        sectionSubtitle: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
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
            borderColor: theme.defaultBorder,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.background,
        },
        childColumn: {
            flex: 1,
        },
        childTitle: {
            fontWeight: '500',
            fontSize: 14,
            lineHeight: 20,
            color: theme.text,
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
            color: theme.textSecondary,
        },
        childSubtitle: {
            fontWeight: '400',
            fontSize: 14,
            lineHeight: 20,
            color: theme.textSecondary,
        },
        editButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
