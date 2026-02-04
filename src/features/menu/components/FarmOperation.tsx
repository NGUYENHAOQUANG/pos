import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { borderRadius, colors } from '@/styles';
import { SvgProps } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import FarmManagementIcon from '@/assets/Icon/IconMenu/FarmManagement.svg';
import DeviceManagementIcon from '@/assets/Icon/IconMenu/DeviceManagement.svg';
import SettingEnvironmentalIcon from '@/assets/Icon/IconMenu/SettingEnvironmental.svg';

interface FarmOperationItemProps {
    Icon: React.FC<SvgProps>;
    title: string;
    onPress?: () => void;
    isLast?: boolean;
}

const FarmOperationItem: React.FC<FarmOperationItemProps> = ({ Icon, title, onPress, isLast }) => {
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

export const FarmOperation: React.FC = () => {
    const navigation = useNavigation<any>();

    const operations = [
        {
            id: 'cycle',
            title: 'Quản lý vụ nuôi',
            Icon: FarmManagementIcon,
            screen: 'AquacultureManagement',
        },
        {
            id: 'device-maintenance',
            title: 'Quản lý bảo trì thiết bị',
            Icon: DeviceManagementIcon,
            screen: 'DeviceManagement',
        },
        {
            id: 'environment',
            title: 'Thiết lập thông số môi trường',
            Icon: SettingEnvironmentalIcon,
            screen: 'SettingEnvironment',
        },
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.headerTitle}>Vận hành trại nuôi</Text>
            <View style={styles.divider} />
            <View>
                {operations.map((item, index) => (
                    <FarmOperationItem
                        key={item.id}
                        Icon={item.Icon}
                        title={item.title}
                        isLast={index === operations.length - 1}
                        onPress={() => {
                            if (item.screen) {
                                navigation.navigate(item.screen);
                            }
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
    icon: {
        width: 32,
        height: 32,
    },
    itemTitle: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
});
