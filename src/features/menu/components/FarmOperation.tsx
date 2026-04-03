import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';
import { SvgProps } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import SwimmingPoolIcon from '@/assets/Icon/IconMenu/SwimmingPool.svg';
import ToolboxIcon from '@/assets/Icon/IconMenu/Toolbox.svg';
import ChartBarIcon from '@/assets/Icon/IconMenu/ChartBar.svg';
import WeatherForecastIcon from '@/assets/Icon/IconMenu/WeatherForecast.svg';

interface FarmOperationItemProps {
    Icon: React.FC<SvgProps>;
    title: string;
    onPress?: () => void;
    isLast?: boolean;
}

const FarmOperationItem: React.FC<FarmOperationItemProps> = ({ Icon, title, onPress }) => {
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

export const FarmOperation: React.FC = () => {
    const navigation = useNavigation<any>();

    const operations = [
        {
            id: 'cycle',
            title: 'Quản lý vụ nuôi',
            Icon: SwimmingPoolIcon,
            screen: 'AquacultureManagement',
        },
        {
            id: 'device-maintenance',
            title: 'Quản lý bảo trì thiết bị',
            Icon: ToolboxIcon,
            screen: 'DeviceManagement',
        },
        {
            id: 'environment',
            title: 'Thiết lập thông số môi trường',
            Icon: ChartBarIcon,
            screen: 'SettingEnvironment',
        },
        {
            id: 'weather',
            title: 'Dự báo thời tiết',
            Icon: WeatherForecastIcon,
            screen: 'WeatherScreen',
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Vận hành trại nuôi</Text>
            <View style={styles.card}>
                {operations.map(item => (
                    <FarmOperationItem
                        key={item.id}
                        Icon={item.Icon}
                        title={item.title}
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
