import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={themedStyles.scheduleButton}
                onPress={onSchedulePress}
                activeOpacity={0.7}
            >
                <FieldTimeIcon width={20} height={20} style={styles.icon} />
                <Text style={themedStyles.text}>Lịch trình</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={themedStyles.statisticButton}
                onPress={onStatisticPress}
                activeOpacity={0.7}
            >
                <LineChartIcon width={20} height={20} style={styles.icon} />
                <Text style={themedStyles.text}>Lịch sử & Thống kê</Text>
            </TouchableOpacity>
        </View>
    );
};

// Static styles
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    icon: {
        marginRight: spacing.sm,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        scheduleButton: {
            flex: 0.4,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            paddingHorizontal: spacing.sm,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
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
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
        },
        text: {
            fontSize: 16,
            fontWeight: '400',
            color: theme.text,
        },
    });
