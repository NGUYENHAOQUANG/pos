import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { ICurrentWeather } from '../types/weather.types';
import { colors, spacing } from '@/styles';
import ThermometerSimpleIcon from '@/assets/Icon/IconWeather/ThermometerSimple.svg';
import DropIcon from '@/assets/Icon/IconWeather/Drop.svg';
import WindIcon from '@/assets/Icon/IconWeather/IconTag/Wind.svg';
import HumidityPressureIcon from '@/assets/Icon/IconWeather/HumidityPressure.svg';

interface CurrentWeatherCardProps {
    readonly current: ICurrentWeather;
}

const GAP = 8;
const HORIZONTAL_PADDING = 16; // Parent padding on each side

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ current }) => {
    const { width: screenWidth } = useWindowDimensions();

    // Calculate card size: (screenWidth - 2*parentPadding - gap) / 2
    const cardSize = (screenWidth - 2 * HORIZONTAL_PADDING - GAP) / 2;

    // Determine Feels Like descriptive text
    const tempDiff = current.apparentTemperature - current.temperature2m;
    let feelsLikeDesc = 'Nhiệt độ tương đương thực tế.';
    if (tempDiff >= 2) feelsLikeDesc = 'Cảm giác nóng hơn do độ ẩm.';
    else if (tempDiff <= -2) feelsLikeDesc = 'Cảm giác gió lạnh hơn.';

    // Wind direction format
    const getDirection = (deg: number) => {
        const val = Math.floor(deg / 22.5 + 0.5);
        const arr = [
            'Bắc',
            'BĐB',
            'ĐB',
            'ĐĐB',
            'Đông',
            'ĐĐN',
            'ĐN',
            'NĐN',
            'Nam',
            'NTN',
            'TN',
            'TTN',
            'Tây',
            'TTB',
            'TB',
            'BTB',
        ];
        return arr[val % 16];
    };

    return (
        <View style={styles.gridContainer}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
                {/* Feels Like Square */}
                <View style={[styles.metricSquare, { width: cardSize, height: cardSize }]}>
                    <View style={styles.metricHeader}>
                        <ThermometerSimpleIcon width={16} height={16} color={colors.white} />
                        <Text style={styles.metricTitle}>CẢM GIÁC NHƯ</Text>
                    </View>
                    <View style={styles.metricBody}>
                        <Text style={styles.metricValue}>
                            {Math.round(current.apparentTemperature)}°
                        </Text>
                    </View>
                    <View style={styles.metricFooter}>
                        <Text style={styles.metricDesc}>{feelsLikeDesc}</Text>
                    </View>
                </View>

                {/* Precipitation Square */}
                <View style={[styles.metricSquare, { width: cardSize, height: cardSize }]}>
                    <View style={styles.metricHeader}>
                        <DropIcon width={16} height={16} color={colors.white} />
                        <Text style={styles.metricTitle}>LƯỢNG MƯA</Text>
                    </View>
                    <View style={styles.metricBody}>
                        <Text style={styles.metricValue}>
                            {current.rain}
                            <Text style={styles.metricUnit}> mm</Text>
                        </Text>
                    </View>
                    <View style={styles.metricFooter}>
                        <Text style={styles.metricDesc}>
                            {current.rain === 0
                                ? 'Không có mưa trong thời điểm hiện tại.'
                                : 'Đang có mưa, hãy chủ động công việc.'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
                {/* Wind Square */}
                <View style={[styles.metricSquare, { width: cardSize, height: cardSize }]}>
                    <View style={styles.metricHeader}>
                        <WindIcon width={16} height={16} color={colors.white} />
                        <Text style={styles.metricTitle}>GIÓ</Text>
                    </View>
                    <View style={styles.metricBody}>
                        <Text style={styles.metricValue}>
                            {Math.round(current.windSpeed10m)}
                            <Text style={styles.metricUnit}> km/h</Text>
                        </Text>
                    </View>
                    <View style={styles.metricFooter}>
                        <Text style={styles.metricDesc}>
                            Hướng: {getDirection(current.windDirection10m)}
                        </Text>
                    </View>
                </View>

                {/* Humidity & Pressure */}
                <View style={[styles.metricSquare, { width: cardSize, height: cardSize }]}>
                    <View style={styles.metricHeader}>
                        <HumidityPressureIcon width={16} height={16} color={colors.white} />
                        <Text style={styles.metricTitle}>ĐỘ ẨM & ÁP SUẤT</Text>
                    </View>
                    <View style={styles.metricBody}>
                        <Text style={styles.metricValue}>
                            {Math.round(current.relativeHumidity2m)}
                            <Text style={styles.metricUnit}> %</Text>
                        </Text>
                    </View>
                    <View style={styles.metricFooter}>
                        <Text style={styles.metricDesc}>
                            Áp suất: {Math.round(current.pressure)} hPa
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    gridContainer: {
        gap: GAP,
    },
    gridRow: {
        flexDirection: 'row',
        gap: GAP,
    },
    metricSquare: {
        backgroundColor: colors.backgroundWeather,
        borderRadius: spacing.md,
        padding: spacing.md,
        justifyContent: 'space-between',
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metricTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.white,
    },
    metricBody: {
        flex: 1,
        justifyContent: 'center',
    },
    metricValue: {
        fontSize: 48,
        fontWeight: '500',
        color: colors.white,
    },
    metricUnit: {
        fontSize: 14,
        color: colors.white,
    },
    metricFooter: {
        justifyContent: 'flex-end',
    },
    metricDesc: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.white,
    },
});

export default CurrentWeatherCard;
