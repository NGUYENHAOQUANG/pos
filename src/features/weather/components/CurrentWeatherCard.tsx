import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { ICurrentWeather } from '../types/weather.types';
import { colors, typography } from '@/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CurrentWeatherCardProps {
    readonly current: ICurrentWeather;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ current }) => {
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
            {/* Feels Like Square */}
            <View style={styles.metricSquare}>
                <View style={styles.metricHeader}>
                    <FontAwesome5 name="thermometer-half" size={12} color="rgba(255,255,255,0.7)" />
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
            <View style={styles.metricSquare}>
                <View style={styles.metricHeader}>
                    <Ionicons name="water" size={14} color="rgba(255,255,255,0.7)" />
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

            {/* Wind Square */}
            <View style={styles.metricSquare}>
                <View style={styles.metricHeader}>
                    <Feather name="wind" size={14} color="rgba(255,255,255,0.7)" />
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
            <View style={styles.metricSquare}>
                <View style={styles.metricHeader}>
                    <MaterialCommunityIcons
                        name="weather-partly-rainy"
                        size={16}
                        color="rgba(255,255,255,0.7)"
                    />
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
    );
};

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    metricSquare: {
        width: '48%',
        aspectRatio: 1, // Make it perfectly square
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        borderRadius: 20,
        padding: 14,
        justifyContent: 'space-between',
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metricTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
    },
    metricBody: {
        flex: 1,
        justifyContent: 'center',
    },
    metricValue: {
        fontSize: 32,
        fontWeight: typography.fontWeight.medium,
        color: colors.white,
    },
    metricUnit: {
        fontSize: typography.fontSize.lg,
        color: 'rgba(255,255,255,0.9)',
    },
    metricFooter: {
        justifyContent: 'flex-end',
    },
    metricDesc: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        color: colors.white,
        lineHeight: 18,
    },
});
