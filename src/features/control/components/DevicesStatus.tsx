import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles';

interface StatusItemProps {
    label: string;
    value: number;
    valueColor?: string;
    backgroundColor?: string;
    borderColor?: string;
}

const StatusItem: React.FC<StatusItemProps> = ({
    label,
    value,
    valueColor,
    backgroundColor,
    borderColor,
}) => (
    <View
        style={[
            styles.itemContainer,
            {
                borderColor: borderColor || colors.defaultBorder,
                backgroundColor: backgroundColor || 'white',
            },
        ]}
    >
        <Text style={[styles.label, { color: valueColor }]} numberOfLines={1}>
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
    return (
        <View style={styles.container}>
            <StatusItem
                label="Tổng ao"
                value={totalPonds}
                valueColor={colors.gray[800]} // Hoặc colors.text
            />
            <View style={styles.spacer} />
            <StatusItem label="Hoạt động" value={activePonds} valueColor={colors.gray[800]} />
            <View style={styles.spacer} />
            <StatusItem
                label="Nguy cơ"
                value={warningPonds}
                valueColor={colors.red[600]}
                backgroundColor={colors.red[25]}
                borderColor={colors.red[200]}
            />
            <View style={styles.spacer} />
            <StatusItem label="Khác" value={otherPonds} valueColor={colors.gray[800]} />
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
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.textSecondary,
        fontWeight: '400',
        marginBottom: 8,
    },
});
