/**
 * @file PondStatusWidget.tsx
 * @description Widget hiển thị thông số ao nuôi trong bubble chat
 *
 * Được render bởi renderCustomView khi message có widget.type === 'POND_STATUS'
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PondStatusData } from '@/features/menu/screens/chatbot/types';
import { useAppTheme } from '@/styles/themeContext';
import { useMemo } from 'react';

// ── Helpers ─────────────────────────────────────────────────────────────────────

/** Đánh giá mức độ an toàn của chỉ số */
const getStatusColor = (value: number, min: number, max: number): string => {
    if (value >= min && value <= max) {
        return '#16A34A';
    } // Tốt - xanh lá
    if (value < min * 0.8 || value > max * 1.2) {
        return '#DC2626';
    } // Nguy hiểm - đỏ
    return '#F59E0B'; // Cảnh báo - vàng
};

const getStatusLabel = (value: number, min: number, max: number): string => {
    if (value >= min && value <= max) {
        return 'Tốt';
    }
    if (value < min * 0.8 || value > max * 1.2) {
        return 'Nguy hiểm';
    }
    return 'Cảnh báo';
};

// ── Parameter Row ───────────────────────────────────────────────────────────────

interface ParamRowProps {
    icon: string;
    iconLib?: 'mci' | 'ion';
    label: string;
    value: string;
    unit: string;
    statusColor: string;
    statusLabel: string;
}

const ParamRow: React.FC<ParamRowProps & { theme: any; paramStyles: any }> = ({
    icon,
    iconLib = 'mci',
    label,
    value,
    unit,
    statusColor,
    statusLabel,
    theme,
    paramStyles,
}) => (
    <View style={paramStyles.row}>
        <View style={paramStyles.labelSection}>
            {iconLib === 'mci' ? (
                <MaterialCommunityIcons name={icon} size={16} color={theme.textSecondary} />
            ) : (
                <Ionicons name={icon} size={16} color={theme.textSecondary} />
            )}
            <Text style={paramStyles.label}>{label}</Text>
        </View>
        <View style={paramStyles.valueSection}>
            <Text style={paramStyles.value}>
                {value}
                <Text style={paramStyles.unit}> {unit}</Text>
            </Text>
            <View style={[paramStyles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                <View style={[paramStyles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[paramStyles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
        </View>
    </View>
);

const useParamStyles = (theme: any) =>
    useMemo(
        () =>
            StyleSheet.create({
                row: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                },
                labelSection: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                },
                label: {
                    fontSize: 13,
                    color: theme.textSecondary,
                    fontWeight: '400',
                },
                valueSection: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                },
                value: {
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.text,
                },
                unit: {
                    fontSize: 12,
                    fontWeight: '400',
                    color: theme.textSecondary,
                },
                statusBadge: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 10,
                },
                statusDot: {
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                },
                statusText: {
                    fontSize: 11,
                    fontWeight: '500',
                },
            }),
        [theme]
    );

// ── Main Component ──────────────────────────────────────────────────────────────

interface PondStatusWidgetProps {
    data: PondStatusData;
}

export const PondStatusWidget: React.FC<PondStatusWidgetProps> = ({ data }) => {
    const theme = useAppTheme();
    const styles = useWidgetStyles(theme);
    const paramStyles = useParamStyles(theme);
    const { pond_name, temperature, ph, oxygen, salinity, turbidity } = data;

    // Ngưỡng an toàn cho từng thông số (có thể custom theo SettingEnvironment)
    const params = [
        {
            icon: 'thermometer',
            label: 'Nhiệt độ',
            value: temperature.toFixed(1),
            unit: '°C',
            min: 28,
            max: 32,
            current: temperature,
        },
        {
            icon: 'flask-outline',
            label: 'pH',
            value: ph.toFixed(1),
            unit: '',
            min: 7.5,
            max: 8.5,
            current: ph,
        },
        {
            icon: 'water-outline',
            iconLib: 'ion' as const,
            label: 'Oxy (DO)',
            value: oxygen.toFixed(1),
            unit: 'mg/L',
            min: 4,
            max: 8,
            current: oxygen,
        },
        ...(salinity != null
            ? [
                  {
                      icon: 'waves' as string,
                      label: 'Độ mặn',
                      value: salinity.toFixed(1),
                      unit: 'ppt',
                      min: 15,
                      max: 25,
                      current: salinity,
                  },
              ]
            : []),
        ...(turbidity != null
            ? [
                  {
                      icon: 'eye-outline' as string,
                      label: 'Độ đục',
                      value: turbidity.toFixed(0),
                      unit: 'NTU',
                      min: 0,
                      max: 50,
                      current: turbidity,
                  },
              ]
            : []),
    ];

    // Tính trạng thái tổng quan
    const allGood = params.every(p => p.current >= p.min && p.current <= p.max);
    const hasWarning = params.some(p => !(p.current >= p.min && p.current <= p.max));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View
                        style={[
                            styles.headerIcon,
                            { backgroundColor: allGood ? '#DCFCE7' : '#FEF3C7' },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="fishbowl-outline"
                            size={16}
                            color={allGood ? '#16A34A' : '#F59E0B'}
                        />
                    </View>
                    <Text style={styles.headerTitle}>{pond_name || `Ao #${data.pond_id}`}</Text>
                </View>
                <View
                    style={[
                        styles.overallBadge,
                        {
                            backgroundColor: allGood
                                ? '#DCFCE7'
                                : hasWarning
                                ? '#FEF3C7'
                                : '#FEE2E2',
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.overallText,
                            {
                                color: allGood ? '#16A34A' : hasWarning ? '#F59E0B' : '#DC2626',
                            },
                        ]}
                    >
                        {allGood ? '✓ Bình thường' : '⚠ Cần chú ý'}
                    </Text>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Parameters */}
            {params.map((param, index) => (
                <React.Fragment key={param.label}>
                    <ParamRow
                        icon={param.icon}
                        iconLib={(param as any).iconLib || 'mci'}
                        label={param.label}
                        value={param.value}
                        unit={param.unit}
                        statusColor={getStatusColor(param.current, param.min, param.max)}
                        statusLabel={getStatusLabel(param.current, param.min, param.max)}
                        theme={theme}
                        paramStyles={paramStyles}
                    />
                    {index < params.length - 1 && <View style={styles.paramDivider} />}
                </React.Fragment>
            ))}
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const useWidgetStyles = (theme: any) =>
    useMemo(
        () =>
            StyleSheet.create({
                container: {
                    backgroundColor: theme.background,
                    borderRadius: 12,
                    padding: 14,
                    marginHorizontal: 4,
                    marginTop: 4,
                    marginBottom: 2,
                    borderWidth: 1,
                    borderColor: theme.border,
                    minWidth: 260,
                },
                header: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                },
                headerLeft: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                },
                headerIcon: {
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                headerTitle: {
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.text,
                },
                overallBadge: {
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                },
                overallText: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                divider: {
                    height: 1,
                    backgroundColor: theme.backgroundTertiary,
                    marginVertical: 8,
                },
                paramDivider: {
                    height: 1,
                    backgroundColor: theme.border,
                },
            }),
        [theme]
    );
