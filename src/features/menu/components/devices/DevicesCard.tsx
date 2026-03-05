import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/styles';
import { Tag } from '@/features/menu/components/Tag';
import WarningCircleIcon from '@/assets/Icon/IconDevices/WarningCircle.svg';
import { MoreButton } from '@/shared/components/buttons/MoreButton';

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
                    <Tag status={device.status} type="device" style={{ alignSelf: 'center' }} />
                    <View collapsable={false}>
                        <MoreButton
                            style={styles.moreButton}
                            onPress={event => onMorePress?.(event)}
                        />
                    </View>
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
                        <Text
                            style={[
                                styles.value,
                                device.status === 'maintenance' && { color: colors.orange[500] },
                            ]}
                        >
                            {device.maintenance.operatingTime.current}/{' '}
                            {device.maintenance.operatingTime.limit} giờ
                        </Text>
                        {device.status === 'maintenance' && (
                            <WarningCircleIcon width={16} height={16} />
                        )}
                    </View>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Thời gian sử dụng từ ngày lắp:</Text>
                    <View style={styles.valueContainer}>
                        <Text
                            style={[
                                styles.value,
                                device.status === 'maintenance' && { color: colors.orange[500] },
                            ]}
                        >
                            {device.maintenance.usageTime.current}/{' '}
                            {device.maintenance.usageTime.limit} ngày
                        </Text>
                        {device.status === 'maintenance' && (
                            <WarningCircleIcon width={16} height={16} />
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
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
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
        fontWeight: '700',
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
