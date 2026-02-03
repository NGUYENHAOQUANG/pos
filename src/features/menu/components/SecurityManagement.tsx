import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';
import { SvgProps } from 'react-native-svg';

import PrivacyPolicyIcon from '@/assets/Icon/IconMenu/PrivacyPolicy.svg';
import TermsAndConditionsIcon from '@/assets/Icon/IconMenu/TermsAndConditions.svg';

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
    isLast,
}) => {
    return (
        <View>
            <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
                <View style={styles.iconWrapper}>
                    <Icon width={32} height={32} />
                </View>
                <Text style={styles.itemTitle}>{title}</Text>
                <AntDesign name="right" size={20} color={colors.text} />
            </TouchableOpacity>
            {!isLast && <View style={styles.itemSeparator} />}
        </View>
    );
};

export const SecurityManagement: React.FC = () => {
    const items = [
        {
            id: 'privacy',
            title: 'Chính sách bảo mật',
            Icon: PrivacyPolicyIcon,
        },
        {
            id: 'terms',
            title: 'Điều khoản và điều kiện',
            Icon: TermsAndConditionsIcon,
        },
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.headerTitle}>Quản lý bảo mật</Text>
            <View style={styles.divider} />
            <View>
                {items.map((item, index) => (
                    <SecurityManagementItem
                        key={item.id}
                        Icon={item.Icon}
                        title={item.title}
                        isLast={index === items.length - 1}
                        onPress={() => {
                            // Handle navigation here
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    itemSeparator: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    iconWrapper: {
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
});
