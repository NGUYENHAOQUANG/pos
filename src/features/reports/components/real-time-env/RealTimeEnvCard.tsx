import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { BasicDropDownButton } from '@/features/reports/components/BasicDropDownButton';
import Peformance from '@/assets/Icon/IconReport/Peformance.svg';
import {
    RealTimeEnvChart,
    ChartDataPoint,
} from '@/features/reports/components/real-time-env/RealTimeEnvChart';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { useTelemetry } from '@/features/reports/hooks/useTelemetry';

interface RealTimeEnvCardProps {
    /** Pond ID to subscribe for real-time data */
    pondId?: string;
    /** The metric key to extract from telemetry data (e.g. 'temp', 'ph') */
    metricKey: string;
    /** The title to display (e.g. 'Nhiệt độ', 'pH') */
    title: string;
    /** The default max value for the Y-axis at 1x zoom */
    defaultYMax?: number;
    /** Unit suffix for the value (e.g. '°C') */
    unit?: string;
    /** The icon element to display in the header */
    icon?: React.ReactNode;
}

/** Format date to Vietnamese day name */
const formatVietnameseDate = (date: Date): string => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dayName}, ${dd}/${mm}/${yyyy}`;
};

/** Format timestamp to HH:mm:ss */
const formatTime = (isoString: string): string => {
    const d = new Date(isoString);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
};

export const RealTimeEnvCard = ({
    pondId,
    metricKey,
    title,
    defaultYMax = 50,
    unit,
    icon,
}: RealTimeEnvCardProps) => {
    const theme = useAppTheme();
    const [isExpanded, setIsExpanded] = useState(true);
    const [zoomLevel, setZoomLevel] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(1);

    // Cycle zoom level on button press
    const handleZoomPress = () => {
        const levels: Array<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10> = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        ];
        const nextIndex = (levels.indexOf(zoomLevel) + 1) % levels.length;
        setZoomLevel(levels[nextIndex]);
    };

    // Connect to SignalR and subscribe to pond data
    const { dataPoints, isConnected, connectionState } = useTelemetry({
        pondId,
        enabled: !!pondId,
    });

    // Debug: log connection state and incoming data
    React.useEffect(() => {
        console.log('[RealTimeEnvCard] pondId:', pondId);
        console.log('[RealTimeEnvCard] connectionState:', connectionState);
        console.log('[RealTimeEnvCard] isConnected:', isConnected);
    }, [pondId, connectionState, isConnected]);

    React.useEffect(() => {
        if (dataPoints.length > 0) {
            console.log('[RealTimeEnvCard] Total dataPoints:', dataPoints.length);
            console.log('[RealTimeEnvCard] Latest point:', dataPoints[0]);
            console.log(
                `[RealTimeEnvCard] ${metricKey} value:`,
                dataPoints[0]?.measurements?.[metricKey]
            );
        }
    }, [dataPoints, metricKey]);

    // Transform telemetry data points into chart data
    const chartData: ChartDataPoint[] = useMemo(() => {
        return dataPoints
            .filter(dp => dp.measurements[metricKey] !== undefined)
            .map(dp => ({
                time: formatTime(dp.timestamp),
                value: dp.measurements[metricKey],
            }))
            .reverse(); // Oldest first for chart
    }, [dataPoints, metricKey]);

    const todayString = formatVietnameseDate(new Date());
    const sessionCount = chartData.length;
    const latestValue = sessionCount > 0 ? chartData[sessionCount - 1].value : null;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.white,
                    borderColor: theme.border,
                },
            ]}
        >
            <View
                style={{
                    backgroundColor: theme.backgroundPrimary,
                    borderRadius: borderRadius.sm,
                }}
            >
                <BasicDropDownButton
                    prefixIcon={icon || <Peformance width={20} height={20} />}
                    label={title}
                    isExpanded={isExpanded}
                    onPress={() => setIsExpanded(!isExpanded)}
                    style={styles.header}
                />
            </View>

            {isExpanded && (
                <View style={styles.content}>
                    {!pondId ? (
                        <View style={{ paddingVertical: spacing.xl }}>
                            <EmptyStateCard message="Vui lòng chọn ao để xem thông số môi trường" />
                        </View>
                    ) : (
                        <>
                            {/* Date, session count, and Zoom button */}
                            <View style={styles.dateRow}>
                                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                                    {todayString} - {sessionCount} phiên đo
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.zoomButton,
                                        {
                                            backgroundColor: theme.backgroundPrimary,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                    onPress={handleZoomPress}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.zoomText, { color: theme.text }]}>
                                        {zoomLevel}x
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Legend */}
                            <View style={styles.legendContainer}>
                                <View style={styles.legendItem}>
                                    <View
                                        style={[
                                            styles.legendDash,
                                            { backgroundColor: theme.success },
                                        ]}
                                    />
                                    <Text
                                        style={[styles.legendText, { color: theme.textSecondary }]}
                                    >
                                        Ngưỡng an toàn
                                    </Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View
                                        style={[
                                            styles.legendDash,
                                            { backgroundColor: theme.error },
                                        ]}
                                    />
                                    <Text
                                        style={[styles.legendText, { color: theme.textSecondary }]}
                                    >
                                        Vượt mức cảnh báo
                                    </Text>
                                </View>
                            </View>

                            {/* Chart subtitle */}
                            <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
                                Biểu đồ - {title}{' '}
                                {latestValue !== null && (
                                    <Text style={{ fontWeight: '600', color: theme.text }}>
                                        ({latestValue}
                                        {unit ? unit : ''})
                                    </Text>
                                )}
                            </Text>

                            {/* Connection status indicator */}
                            {!isConnected && (
                                <Text style={[styles.statusText, { color: theme.textTertiary }]}>
                                    Đang kết nối...
                                </Text>
                            )}

                            {/* Chart */}
                            <View style={styles.chartContainer}>
                                <RealTimeEnvChart
                                    data={chartData}
                                    zoomLevel={zoomLevel}
                                    defaultYMax={defaultYMax}
                                />
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
    },
    content: {
        padding: spacing.md,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    dateText: {
        fontSize: 14,
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDash: {
        width: 12,
        height: 3,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 14,
    },
    subtitleText: {
        fontSize: 14,
        marginBottom: spacing.md,
    },
    zoomButton: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },
    zoomText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusText: {
        fontSize: 12,
        marginBottom: spacing.sm,
        fontStyle: 'italic',
    },
    chartContainer: {
        marginTop: spacing.sm,
    },
});
