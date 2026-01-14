import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';

interface Props {
    style?: StyleProp<ViewStyle>;
}

export const DeleteAccountWarningBox: React.FC<Props> = ({ style }) => {
    return (
        <View style={[styles.warningBox, style]}>
            <Text style={styles.warningText}>
                Nếu xoá tài khoản, toàn bộ dữ liệu sẽ bị xoá và không thể khôi phục lại, ngay cả khi
                bạn đăng ký lại tài khoản mới bằng số điện thoại hiện tại.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    warningBox: {
        backgroundColor: colors.errorBackground,
        borderWidth: 1,
        borderColor: colors.red[300],
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        width: '100%',
    },
    warningText: {
        fontSize: 14,
        lineHeight: 22,
        color: colors.text,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
});
