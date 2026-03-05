import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';

export type TagStatus =
    | 'pending'
    | 'active'
    | 'preparing'
    | 'paused'
    | 'ended'
    | 'installed'
    | 'warehouse'
    | 'maintenance';

export type TagType = 'member' | 'cycle' | 'device' | 'season';

interface TagProps {
    status: TagStatus;
    style?: ViewStyle;
    /** Context type to determine label mapping */
    type?: TagType;
}

export const Tag: React.FC<TagProps> = ({ status, style, type = 'cycle' }) => {
    const getStatusConfig = () => {
        // Define label mappings for different contexts
        const labelMappings: Record<TagType, Partial<Record<TagStatus, string>>> = {
            member: {
                pending: 'Chờ xác nhận',
                active: 'Hoạt động',
                paused: 'Tạm ngưng',
                ended: 'Đã kết thúc',
            },
            cycle: {
                pending: 'Chờ xác nhận',
                active: 'Đang nuôi',
                preparing: 'Chuẩn bị',
                paused: 'Tạm ngưng',
                ended: 'Đã kết thúc',
            },
            device: {
                installed: 'Đã lắp đặt',
                warehouse: 'Lưu kho',
                maintenance: 'Đến hạn bảo trì',
                active: 'Hoạt động',
            },
            season: {
                pending: 'Chờ xác nhận',
                active: 'Đang nuôi',
                ended: 'Đã kết thúc',
            },
        };

        // Get label from mapping based on type and status
        const getLabel = (): string => {
            return labelMappings[type]?.[status] || labelMappings.cycle[status] || '';
        };

        switch (status) {
            case 'pending':
                return {
                    label: getLabel(),
                    color: colors.orange[500],
                    backgroundColor: colors.yellow[50],
                    borderColor: colors.yellow[300],
                };
            case 'active':
                return {
                    label: getLabel(),
                    color: colors.green[600],
                    backgroundColor: colors.green[50],
                    borderColor: colors.green[300],
                };
            case 'preparing':
                return {
                    label: getLabel(),
                    color: colors.yellow[600],
                    backgroundColor: colors.yellow[50],
                    borderColor: colors.yellow[600],
                };
            case 'paused':
                return {
                    label: getLabel(),
                    color: colors.text,
                    backgroundColor: colors.gray[100],
                    borderColor: colors.borderDark,
                };
            case 'ended':
                return {
                    label: getLabel(),
                    color: colors.text,
                    backgroundColor: colors.gray[100],
                    borderColor: colors.borderDark,
                };
            case 'installed':
                return {
                    label: getLabel(),
                    color: colors.green[600],
                    backgroundColor: colors.green[25],
                    borderColor: colors.green[300],
                };
            case 'warehouse':
                return {
                    label: getLabel(),
                    color: colors.text,
                    backgroundColor: colors.gray[100],
                    borderColor: colors.border,
                };
            case 'maintenance':
                return {
                    label: getLabel(),
                    color: colors.orange[600],
                    backgroundColor: colors.yellow[25],
                    borderColor: colors.yellow[200],
                };
            default:
                return {
                    label: '',
                    color: colors.text,
                    backgroundColor: colors.gray[100],
                    borderColor: colors.border,
                };
        }
    };

    const { label, color, backgroundColor, borderColor } = getStatusConfig();

    return (
        <View style={[styles.container, { backgroundColor, borderColor }, style]}>
            <Text style={[styles.text, { color }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.sm,
        height: 32,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
    },
});
