import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';
import { SvgProps } from 'react-native-svg';

import GavelIcon from '@/assets/Icon/IconMenu/Gavel.svg';
import ArticleIcon from '@/assets/Icon/IconMenu/Article.svg';

interface SecurityManagementItemProps {
    Icon: React.FC<SvgProps>;
    title: string;
    onPress?: () => void;
    isLast?: boolean;
}

const SecurityManagementItem: React.FC<SecurityManagementItemProps> = ({
    Icon,
    title,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <View style={styles.iconWrapper}>
                <Icon width={18} height={18} />
            </View>
            <Text style={styles.itemTitle}>{title}</Text>
            <AntDesign name="right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
    );
};

export const SecurityManagement: React.FC = () => {
    const internalItems = [
        {
            id: 'privacy',
            title: 'Chính sách bảo mật',
            Icon: GavelIcon,
        },
        {
            id: 'terms',
            title: 'Điều khoản và điều kiện',
            Icon: ArticleIcon,
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Quản lý bảo mật</Text>

            <View style={styles.card}>
                {internalItems.map(item => (
                    <SecurityManagementItem
                        key={item.id}
                        Icon={item.Icon}
                        title={item.title}
                        onPress={'onPress' in item ? (item.onPress as any) : undefined}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    headerTitle: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '600',
        color: colors.text,
    },
    card: {
        gap: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 12,
        gap: 16,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        flex: 1,
        fontSize: 15,
        lineHeight: 20,
        color: colors.gray[950],
        fontWeight: '400',
    },
});
