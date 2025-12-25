import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';

export type TagStatus =
    | 'pending'
    | 'active'
    | 'paused'
    | 'ended'
    | 'installed'
    | 'warehouse'
    | 'maintenance';

interface TagProps {
    status: TagStatus;
    style?: ViewStyle;
}

export const Tag: React.FC<TagProps> = ({ status, style }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Chờ xác nhận',
                    color: colors.orange[500],
                    backgroundColor: colors.yellow[50],
                    borderColor: colors.yellow[300],
                };
            case 'active':
                return {
                    label: 'Hoạt động',
                    color: colors.green[600],
                    backgroundColor: colors.green[50],
                    borderColor: colors.green[300],
                };
            case 'paused':
                return {
                    label: 'Tạm ngưng',
                    color: colors.text,
                    backgroundColor: colors.gray[100],
                    borderColor: colors.borderDark,
                };
            case 'ended':
                return {
                    label: 'Đã kết thúc',
                    color: colors.text,
                    backgroundColor: colors.gray[100],
                    borderColor: colors.borderDark,
                };
            case 'installed':
                return {
                    label: 'Đã lắp đặt',
                    color: colors.green[600],
                    backgroundColor: colors.green[50],
                    borderColor: colors.green[300], // Adjust specific shade if needed
                };
            case 'warehouse':
                return {
                    label: 'Lưu kho',
                    color: colors.text,
                    backgroundColor: colors.gray[100], // Using a light gray/blueish background if available, sticking to gray[100] as close match or colors.blue[50] if appropriate.
                    // Based on image "Lưu kho" looks very neutral/gray.
                    borderColor: colors.border,
                };
            case 'maintenance':
                return {
                    label: 'Đến hạn bảo trì',
                    color: colors.orange[500], // Orange text
                    backgroundColor: colors.yellow[50], // Light orange background
                    borderColor: colors.yellow[300], // Light orange border
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
        height: 22,
        borderRadius: borderRadius.xs,
        borderWidth: 1,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 12,
        fontWeight: '400',
    },
});
