import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

interface StatusItemProps {
    label: string;
    value: number;
    valueColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    theme: Colors;
}

const StatusItem: React.FC<StatusItemProps> = ({
    label,
    value,
    valueColor,
    backgroundColor,
    borderColor,
    theme,
}) => (
    <View
        style={[
            styles.itemContainer,
            {
                borderColor: borderColor || theme.defaultBorder,
                backgroundColor: backgroundColor || theme.background,
            },
        ]}
    >
        <Text
            style={[styles.label, { color: valueColor || theme.textSecondary }]}
            numberOfLines={1}
        >
            {label}
        </Text>
        <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
            {value}
        </Text>
    </View>
);

interface DevicesStatusProps {
    totalPonds?: number;
    activePonds?: number;
    warningPonds?: number;
    otherPonds?: number;
}

export const DevicesStatus: React.FC<DevicesStatusProps> = ({
    totalPonds = 0,
    activePonds = 0,
    warningPonds = 0,
    otherPonds = 0,
}) => {
    const theme = useAppTheme();

    return (
        <View style={styles.container}>
            <StatusItem label="Tổng ao" value={totalPonds} valueColor={theme.text} theme={theme} />
            <View style={styles.spacer} />
            <StatusItem
                label="Hoạt động"
                value={activePonds}
                valueColor={theme.text}
                theme={theme}
            />
            <View style={styles.spacer} />
            <StatusItem
                label="Lỗi"
                value={warningPonds}
                valueColor={theme.error}
                backgroundColor={theme.errorBackground}
                borderColor={theme.isDark ? theme.errorBackground : theme.red[200]}
                theme={theme}
            />
            <View style={styles.spacer} />
            <StatusItem label="Khác" value={otherPonds} valueColor={theme.text} theme={theme} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        marginHorizontal: 16,
    },
    itemContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    spacer: {
        width: 8,
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
    },
    label: {
        fontSize: 12,
        fontWeight: '400',
        marginBottom: 8,
    },
});
