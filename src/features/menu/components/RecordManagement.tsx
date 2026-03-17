import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';
import { SvgProps } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';

import UserIcon from '@/assets/Icon/IconMenu/User.svg';
import UsersIcon from '@/assets/Icon/IconMenu/Users.svg';

interface RecordManagementItemProps {
    Icon: React.FC<SvgProps>;
    title: string;
    onPress?: () => void;
    isLast?: boolean;
}

const RecordManagementItem: React.FC<RecordManagementItemProps> = ({ Icon, title, onPress }) => {
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

export const RecordManagement: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();

    const records = [
        {
            id: 'profile',
            title: 'Thông tin cá nhân',
            Icon: UserIcon,
            onPress: () => navigation.navigate('PersonalInformation'),
        },
        {
            id: 'members',
            title: 'Quản lý thành viên',
            Icon: UsersIcon,
            onPress: () => navigation.navigate('MemberManagement'),
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Quản lý hồ sơ</Text>
            <View style={styles.card}>
                {records.map(item => (
                    <RecordManagementItem
                        key={item.id}
                        Icon={item.Icon}
                        title={item.title}
                        onPress={item.onPress}
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
