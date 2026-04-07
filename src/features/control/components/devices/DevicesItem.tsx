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
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const totalCount = activeCount + warningCount + inactiveCount;

    // Compact mode: single row with icon, label, total count
    if (compact) {
        return (
            <TouchableOpacity
                style={[themedStyles.container, styles.compactContainer, style]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={themedStyles.iconContainer}>
                    <Image source={icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
                </View>
                <Text style={themedStyles.label} numberOfLines={1}>
                    {label}
                </Text>
                <Text style={themedStyles.compactCount}>
                    {totalCount} <Text style={themedStyles.compactUnit}>máy</Text>
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[themedStyles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Header: Icon + Label */}
            <View style={styles.header}>
                <View style={themedStyles.iconContainer}>
                    <Image source={icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
                </View>
                <Text style={themedStyles.label} numberOfLines={1}>
                    {label}
                </Text>
            </View>

            {/* Status rows */}
            <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                    <DeviceActiveIcon width={14} height={14} />
                    <Text style={themedStyles.statLabel}>Đang hoạt động</Text>
                    <Text style={themedStyles.statValue}>{activeCount}</Text>
                </View>

                <View style={styles.statRow}>
                    <DeviceErrorIcon width={14} height={14} />
                    <Text style={themedStyles.statLabel}>Lỗi</Text>
                    <Text style={themedStyles.statValue}>{warningCount}</Text>
                </View>

                <View style={styles.statRow}>
                    <DeviceOffIcon width={14} height={14} />
                    <Text style={themedStyles.statLabel}>Bảo trì</Text>
                    <Text style={themedStyles.statValue}>{inactiveCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Static styles
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    statsContainer: {
        gap: 6,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border,
        },
        iconContainer: {
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            flex: 1,
        },
        statLabel: {
            fontSize: 13,
            color: theme.textSecondary,
            flex: 1,
        },
        statValue: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.text,
            textAlign: 'right',
            minWidth: 20,
        },
        compactCount: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
        },
        compactUnit: {
            color: theme.textSecondary,
        },
    });
