import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import DangerIcon from '@/assets/Icon/Danger.svg';

interface Props {
    style?: StyleProp<ViewStyle>;
}

export const DeleteAccountWarningBox: React.FC<Props> = ({ style }) => {
    return (
        <View style={[styles.warningBox, style]}>
            <View style={styles.iconContainer}>
                <DangerIcon width={20} height={20} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.warningText}>
                    Nếu xoá tài khoản, toàn bộ dữ liệu sẽ bị xoá và không thể khôi phục lại, ngay cả
                    khi bạn đăng ký lại tài khoản mới bằng số điện thoại hiện tại.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    warningBox: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        marginTop: 2,
        marginRight: spacing.sm,
    },
    textContainer: {
        flex: 1,
    },
    warningText: {
        fontSize: 14,
        lineHeight: 22,
        color: colors.text,
    },
});
