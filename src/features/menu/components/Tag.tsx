import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

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
    const theme = useAppTheme();
    const styles = getStyles(theme);
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
                    color: theme.orange[500],
                    backgroundColor: theme.yellow[50],
                    borderColor: theme.yellow[300],
                };
            case 'active':
                return {
                    label: getLabel(),
                    color: theme.green[600],
                    backgroundColor: theme.green[50],
                    borderColor: theme.green[300],
                };
            case 'preparing':
                return {
                    label: getLabel(),
                    color: theme.yellow[600],
                    backgroundColor: theme.yellow[50],
                    borderColor: theme.yellow[600],
                };
            case 'paused':
                return {
                    label: getLabel(),
                    color: theme.text,
                    backgroundColor: theme.gray[100],
                    borderColor: theme.borderDark,
                };
            case 'ended':
                return {
                    label: getLabel(),
                    color: theme.text,
                    backgroundColor: theme.isDark ? theme.backgroundButtonActive : theme.gray[100],
                    borderColor: theme.borderDark,
                };
            case 'installed':
                return {
                    label: getLabel(),
                    color: theme.green[600],
                    backgroundColor: theme.green[25],
                    borderColor: theme.green[300],
                };
            case 'warehouse':
                return {
                    label: getLabel(),
                    color: theme.text,
                    backgroundColor: theme.gray[100],
                    borderColor: theme.border,
                };
            case 'maintenance':
                return {
                    label: getLabel(),
                    color: theme.orange[600],
                    backgroundColor: theme.yellow[25],
                    borderColor: theme.yellow[200],
                };
            default:
                return {
                    label: '',
                    color: theme.text,
                    backgroundColor: theme.gray[100],
                    borderColor: theme.border,
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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            height: 32,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            alignSelf: 'flex-start',
            justifyContent: 'center',
            alignItems: 'center',
        },
        text: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.white,
        },
        green: {
            backgroundColor: theme.green[600],
        },
        orange: {
            backgroundColor: theme.orange[500],
        },
    });
