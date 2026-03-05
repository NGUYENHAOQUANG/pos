import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles';
import WarningCircleIcon from '@/assets/Icon/IconDevices/WarningCircle.svg';

interface WarningDevicesProps {
    onPress?: () => void;
}

export const WarningDevices: React.FC<WarningDevicesProps> = ({ onPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <WarningCircleIcon width={20} height={20} />
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.text}>Một số thiết bị đã đến hạn bảo trì.</Text>
                <Text style={styles.text}>Vui lòng kiểm tra để tránh gián đoạn vận hành.</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
                <Text style={styles.buttonText}>Xem ngay</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    iconContainer: {
        marginRight: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        paddingRight: spacing.xs,
    },
    text: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        lineHeight: 20,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '400',
    },
});
