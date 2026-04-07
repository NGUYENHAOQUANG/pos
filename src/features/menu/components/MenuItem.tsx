import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { SvgProps } from 'react-native-svg';

export interface MenuItemProps {
    Icon: React.FC<SvgProps>;
    title: string;
    onPress?: () => void;
    hideArrow?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({ Icon, title, onPress, hideArrow }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <View style={styles.iconWrapper}>
                <Icon width={18} height={18} color={theme.text} />
            </View>
            <Text style={styles.itemTitle}>{title}</Text>
            {!hideArrow && <AntDesign name="right" size={16} color={theme.textSecondary} />}
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 44,
            paddingHorizontal: 12,
            gap: 16,
            backgroundColor: theme.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        iconWrapper: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        itemTitle: {
            flex: 1,
            fontSize: 15,
            lineHeight: 20,
            color: theme.text,
            fontWeight: '400',
        },
    });
