import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { borderRadius, colors } from '@/styles';
import { SvgProps } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';

import PersonalInformationIcon from '@/assets/Icon/IconMenu/PersonalInformation.svg';
import MemberManagementIcon from '@/assets/Icon/IconMenu/MemberManagement.svg';

interface RecordManagementItemProps {
    Icon: React.FC<SvgProps>;
    title: string;
    onPress?: () => void;
    isLast?: boolean;
}

const RecordManagementItem: React.FC<RecordManagementItemProps> = ({
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

export const RecordManagement: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();

    const records = [
        {
            id: 'profile',
            title: 'Thông tin cá nhân',
            Icon: PersonalInformationIcon,
            onPress: () => navigation.navigate('PersonalInformation'),
        },
        {
            id: 'members',
            title: 'Quản lý thành viên',
            Icon: MemberManagementIcon,
            onPress: () => navigation.navigate('MemberManagement'),
        },
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.headerTitle}>Quản lý hồ sơ</Text>
            <View style={styles.divider} />
            <View>
                {records.map((item, index) => (
                    <RecordManagementItem
                        key={item.id}
                        Icon={item.Icon}
                        title={item.title}
                        isLast={index === records.length - 1}
                        onPress={item.onPress}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
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
