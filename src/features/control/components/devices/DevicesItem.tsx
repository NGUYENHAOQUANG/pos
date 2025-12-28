import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

import { SvgProps } from 'react-native-svg';
import { colors } from '@/styles/colors';

interface DevicesItemProps {
    icon: React.FC<SvgProps>;
    activeCount?: number;
    warningCount?: number;
    inactiveCount?: number;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

import DeviceActiveIcon from '@/assets/Icon/IconDevices/DeviceActive.svg';
import DeviceErrorIcon from '@/assets/Icon/IconDevices/DeviceError.svg';
import DeviceOffIcon from '@/assets/Icon/IconDevices/DeviceOff.svg';

export const DevicesItem: React.FC<DevicesItemProps> = ({
    icon: Icon,
    activeCount = 0,
    warningCount = 0,
    inactiveCount = 0,
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <Icon width={40} height={40} />
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                    <DeviceActiveIcon width={16} height={16} />
                    <Text style={styles.statValue}>{activeCount}</Text>
                </View>

                <View style={styles.statRow}>
                    <DeviceErrorIcon width={16} height={16} />
                    <Text style={styles.statValue}>{warningCount}</Text>
                </View>

                <View style={styles.statRow}>
                    <DeviceOffIcon width={16} height={16} />
                    <Text style={styles.statValue}>{inactiveCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.borderDark,
        minHeight: 160,
    },
    iconContainer: {
        marginBottom: 12,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainIcon: {
        width: 40,
        height: 40,
    },
    statsContainer: {
        gap: 10,
        alignItems: 'center',
        width: '100%',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        width: '100%',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.gray[700],
        marginLeft: 4,
        minWidth: 16,
    },
});
