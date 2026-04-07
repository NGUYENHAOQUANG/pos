import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

// Wrapper to render a card section with a skeleton header and divider
const CardSkeleton: React.FC<{ children: React.ReactNode; styles: any }> = ({
    children,
    styles,
}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Skeleton width={150} height={16} borderRadius={4} />
        </View>
        <View style={styles.divider} />
        <View style={styles.cardContent}>{children}</View>
    </View>
);

// Single full-width input skeleton with label placeholder
const InputSkeleton: React.FC = () => (
    <View>
        <Skeleton width={100} height={14} style={{ marginBottom: 8 }} borderRadius={4} />
        <Skeleton width="100%" height={48} borderRadius={8} />
    </View>
);

export const EnvSkeleton: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* Card: Thông tin chung (DateInput + Image section) */}
            <CardSkeleton styles={styles}>
                {/* Date input */}
                <InputSkeleton />

                {/* Image label */}
                <Skeleton width={60} height={14} borderRadius={4} />

                {/* "Thêm hình ảnh" button */}
                <Skeleton width="100%" height={48} borderRadius={24} />
            </CardSkeleton>

            {/* Card: Chỉ số môi trường (6 full-width inputs + setup button) */}
            <CardSkeleton styles={styles}>
                {/* pH */}
                <InputSkeleton />
                {/* DO */}
                <InputSkeleton />
                {/* Nhiệt độ */}
                <InputSkeleton />
                {/* Độ mặn */}
                <InputSkeleton />
                {/* Độ kiềm */}
                <InputSkeleton />
                {/* Độ trong */}
                <InputSkeleton />

                {/* Setup button */}
                <Skeleton width="100%" height={48} borderRadius={24} />
            </CardSkeleton>

            {/* Card: Ghi chú */}
            <CardSkeleton styles={styles}>
                <View>
                    <Skeleton
                        width={100}
                        height={14}
                        style={{ marginBottom: 8 }}
                        borderRadius={4}
                    />
                    <Skeleton width="100%" height={100} borderRadius={8} />
                </View>
            </CardSkeleton>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <View style={{ flex: 1, marginRight: 12 }}>
                    <Skeleton width="100%" height={48} borderRadius={24} />
                </View>
                <View style={{ flex: 1 }}>
                    <Skeleton width="100%" height={48} borderRadius={24} />
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        card: {
            backgroundColor: theme.background,
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
            marginTop: 8,
            marginHorizontal: 16,
            borderRadius: 8,
        },
        cardHeader: {
            marginBottom: 12,
        },
        divider: {
            height: 1,
            backgroundColor: theme.borderLight,
            marginBottom: 12,
            marginHorizontal: -spacing.md,
        },
        cardContent: {
            gap: spacing.md,
        },
        footer: {
            flexDirection: 'row',
            marginTop: spacing.sm,
            paddingBottom: spacing.xl,
            paddingHorizontal: spacing.md,
        },
    });
