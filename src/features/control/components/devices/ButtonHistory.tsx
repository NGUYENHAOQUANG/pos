import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';

// Import SVG icons
import FieldTimeIcon from '@/assets/Icon/IconDevices/FieldTimeOutlined.svg';
import LineChartIcon from '@/assets/Icon/IconDevices/LineChartOutlined.svg';

interface ButtonHistoryProps {
    onSchedulePress?: () => void;
    onStatisticPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const ButtonHistory: React.FC<ButtonHistoryProps> = ({
    onSchedulePress,
    onStatisticPress,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={styles.scheduleButton}
                onPress={onSchedulePress}
                activeOpacity={0.7}
            >
                <FieldTimeIcon width={20} height={20} style={styles.icon} />
                <Text style={styles.text}>Lịch trình</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.statisticButton}
                onPress={onStatisticPress}
                activeOpacity={0.7}
            >
                <LineChartIcon width={20} height={20} style={styles.icon} />
                <Text style={styles.text}>Lịch sử & Thống kê</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        backgroundColor: colors.white,
    },
    scheduleButton: {
        flex: 0.4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        backgroundColor: colors.white,
    },
    statisticButton: {
        flex: 0.6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        backgroundColor: colors.white,
    },
    icon: {
        marginRight: spacing.sm,
    },
    text: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.text,
    },
});
