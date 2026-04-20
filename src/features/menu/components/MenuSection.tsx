import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { MenuItem, MenuItemProps } from './MenuItem';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';
import { AppStepKey } from '@/features/walkthrough/constants/onboarding';

export type MenuSectionItemData = MenuItemProps & {
    id: string | number;
    /** Optional onboarding step key to wrap this individual item */
    onboardingStep?: AppStepKey;
    /** Optional callback fired after onboarding advances past this step */
    onboardingNext?: () => void;
};

export interface MenuSectionProps {
    title?: string;
    items: MenuSectionItemData[];
}

export const MenuSection: React.FC<MenuSectionProps> = ({ title, items }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {title && <Text style={styles.headerTitle}>{title}</Text>}
            <View style={styles.card}>
                {items.map((item, index) => {
                    const separator =
                        index < items.length - 1 ? <View style={styles.separator} /> : null;

                    const menuItemElement = (
                        <MenuItem
                            Icon={item.Icon}
                            title={item.title}
                            onPress={item.onPress}
                            hideArrow={item.hideArrow}
                        />
                    );

                    // Wrap with OnboardingStep if specified
                    if (item.onboardingStep) {
                        return (
                            <React.Fragment key={item.id}>
                                <OnboardingStep
                                    step={item.onboardingStep}
                                    onNext={item.onboardingNext}
                                >
                                    {menuItemElement}
                                </OnboardingStep>
                                {separator}
                            </React.Fragment>
                        );
                    }

                    return (
                        <React.Fragment key={item.id}>
                            {menuItemElement}
                            {separator}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            gap: 12,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        card: {
            backgroundColor: theme.background,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
        },
        separator: {
            height: 0.5,
            backgroundColor: theme.border,
            marginHorizontal: 16,
        },
    });
