import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles';
import { Tag } from '@/features/menu/components/Tag';
import { IconWarningOutlined } from '@/assets/icons';
import Feather from 'react-native-vector-icons/Feather';

import { DeviceData } from '@/features/menu/types/menu.types';

interface DevicesCardProps {
    device: DeviceData;
    onPress?: () => void;
    onMorePress?: (event: GestureResponderEvent) => void;
}

export const DevicesCard: React.FC<DevicesCardProps> = ({ device, onPress, onMorePress }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceType}>{device.type}</Text>
                </View>
                <View style={styles.headerRight}>
                    <Tag status={device.status} style={{ alignSelf: 'center' }} />
                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={event => onMorePress?.(event)}
                    >
                        <Feather name="more-vertical" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.dividerFullWidth} />

            {/* Info Section */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Ngày nhập kho:</Text>
                    <Text style={styles.value}>{device.importDate}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tổng thời gian chạy:</Text>
                    <Text style={styles.value}>{device.totalRunTime || '--'}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Maintenance Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lịch bảo trì:</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Thời gian hoạt động:</Text>
                    <View style={styles.valueContainer}>
                        <Text style={styles.value}>
                            {device.maintenance.operatingTime.current}/{' '}
                            {device.maintenance.operatingTime.limit} giờ
                        </Text>
                        {device.status === 'maintenance' && (
                            <IconWarningOutlined width={16} height={16} />
                        )}
                    </View>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Thời gian sử dụng từ ngày lắp:</Text>
                    <View style={styles.valueContainer}>
                        <Text style={styles.value}>
                            {device.maintenance.usageTime.current}/{' '}
                            {device.maintenance.usageTime.limit} ngày
                        </Text>
                        {device.status === 'maintenance' && (
                            <IconWarningOutlined width={16} height={16} />
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    headerContent: {
        flex: 1,
        marginRight: spacing.sm,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    deviceName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    deviceType: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    moreButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        marginLeft: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.sm,
    },
    dividerFullWidth: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.sm,
        marginHorizontal: -spacing.md,
    },
    section: {
        gap: spacing.xs,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: '500', // Making label slightly bolder based on visual hierarchy
    },
    value: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        textAlign: 'right',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
});
