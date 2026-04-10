import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';
import ClearNightIcon from '@/assets/Icon/IconWeather/ClearNight.svg';

interface MoonPhaseCardProps {
    readonly phaseName?: string;
    readonly illumination?: string;
    readonly nextMoonrise?: string;
    readonly nextFullMoon?: string;
}

export const MoonPhaseCard: React.FC<MoonPhaseCardProps> = ({
    phaseName = 'KHUYẾT CUỐI THÁNG',
    illumination = '60%',
    nextMoonrise = '01:47',
    nextFullMoon = '23 ngày',
}) => {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                <ClearNightIcon width={14} height={14} color={colors.white} />
                <Text style={styles.title}>{phaseName}</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.infoCol}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Chiếu sáng</Text>
                        <Text style={styles.infoValue}>{illumination}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Trăng mọc tiếp theo</Text>
                        <Text style={styles.infoValue}>{nextMoonrise}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Trăng tròn tiếp theo</Text>
                        <Text style={styles.infoValue}>{nextFullMoon}</Text>
                    </View>
                </View>

                <View style={styles.imageCol}>
                    <Image
                        source={require('@/assets/Icon/IconWeather/Moon.png')}
                        style={styles.moonImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.backgroundWeather,
        borderRadius: spacing.md,
        padding: spacing.md,
        width: '100%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.white,
        textTransform: 'uppercase',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoCol: {
        flex: 1,
        paddingRight: 40,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.fade[20],
        width: '100%',
    },
    infoLabel: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '600',
    },
    imageCol: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moonImage: {
        width: 90,
        height: 90,
        marginRight: 0,
    },
});

export default MoonPhaseCard;
