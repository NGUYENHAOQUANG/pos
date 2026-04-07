import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, borderRadius, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import WarningCircleIcon from '@/assets/Icon/IconDevices/WarningCircle.svg';

interface WarningDevicesProps {
    onPress?: () => void;
}

export const WarningDevices: React.FC<WarningDevicesProps> = ({ onPress }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
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
            color: theme.text,
            lineHeight: 20,
        },
        button: {
            backgroundColor: theme.primary,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.full,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonText: {
            color: theme.white,
            fontSize: 14,
            fontWeight: '400',
        },
    });
