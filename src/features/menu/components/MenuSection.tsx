import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { MenuItem, MenuItemProps } from './MenuItem';

export type MenuSectionItemData = MenuItemProps & { id: string | number };

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
                {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <MenuItem
                            Icon={item.Icon}
                            title={item.title}
                            onPress={item.onPress}
                            hideArrow={item.hideArrow}
                        />
                        {index < items.length - 1 && <View style={styles.separator} />}
                    </React.Fragment>
                ))}
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
