import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';

import DeviceActiveIcon from '@/assets/Icon/IconDevices/DeviceActive.svg';
import DeviceErrorIcon from '@/assets/Icon/IconDevices/DeviceError.svg';
import DeviceOffIcon from '@/assets/Icon/IconDevices/DeviceOff.svg';

interface DevicesItemProps {
    icon: ImageSourcePropType;
    label: string;
    activeCount?: number;
    warningCount?: number;
    inactiveCount?: number;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    compact?: boolean;
}

export const DevicesItem: React.FC<DevicesItemProps> = ({
    icon,
    label,
    activeCount = 0,
    warningCount = 0,
    inactiveCount = 0,
    onPress,
    style,
    compact = false,
}) => {
    const totalCount = activeCount + warningCount + inactiveCount;

    // Compact mode: single row with icon, label, total count
    if (compact) {
        return (
            <TouchableOpacity
                style={[styles.container, styles.compactContainer, style]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <Image source={icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
                </View>
                <Text style={styles.label} numberOfLines={1}>
                    {label}
                </Text>
                <Text style={styles.compactCount}>
                    {totalCount} <Text style={styles.compactUnit}>máy</Text>
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
            {/* Header: Icon + Label */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Image source={icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
                </View>
                <Text style={styles.label} numberOfLines={1}>
                    {label}
                </Text>
            </View>

            {/* Status rows */}
            <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                    <DeviceActiveIcon width={14} height={14} />
                    <Text style={styles.statLabel}>Đang hoạt động</Text>
                    <Text style={styles.statValue}>{activeCount}</Text>
                </View>

                <View style={styles.statRow}>
                    <DeviceErrorIcon width={14} height={14} />
                    <Text style={[styles.statLabel, styles.errorLabel]}>Lỗi</Text>
                    <Text style={[styles.statValue, styles.errorValue]}>{warningCount}</Text>
                </View>

                <View style={styles.statRow}>
                    <DeviceOffIcon width={14} height={14} />
                    <Text style={[styles.statLabel, styles.inactiveLabel]}>Bảo trì</Text>
                    <Text style={[styles.statValue, styles.inactiveValue]}>{inactiveCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    iconContainer: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        flex: 1,
    },
    statsContainer: {
        gap: 6,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statLabel: {
        fontSize: 13,
        color: colors.gray[600],
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.gray[800],
        textAlign: 'right',
        minWidth: 20,
    },
    errorLabel: {
        color: colors.gray[600],
    },
    errorValue: {
        color: colors.gray[800],
    },
    inactiveLabel: {
        color: colors.gray[600],
    },
    inactiveValue: {
        color: colors.gray[800],
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    compactCount: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    compactUnit: {
        color: colors.textSecondary,
    },
});
