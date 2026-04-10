/**
 * @file DeviceControlWidget.tsx
 * @description Widget điều khiển thiết bị trong bubble chat
 *
 * Được render bởi renderCustomView khi message có widget.type === 'DEVICE_CONTROL'
 * Widget hiển thị trạng thái thiết bị và cho phép toggle ON/OFF.
 */
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@/styles/themeContext';
import { DeviceControlData } from '@/features/menu/screens/chatbot/types';

// ── Device Icon Mapping ─────────────────────────────────────────────────────────

const DEVICE_ICONS: Record<string, string> = {
    FAN: 'fan',
    PUMP: 'water-pump',
    AERATOR: 'waves',
    FEEDER: 'food-variant',
};

const DEVICE_LABELS: Record<string, string> = {
    FAN: 'Quạt nước',
    PUMP: 'Máy bơm',
    AERATOR: 'Sục khí',
    FEEDER: 'Máy cho ăn',
};

// ── Main Component ──────────────────────────────────────────────────────────────

interface DeviceControlWidgetProps {
    data: DeviceControlData;
}

export const DeviceControlWidget: React.FC<DeviceControlWidgetProps> = ({ data }) => {
    const theme = useAppTheme();
    const styles = useWidgetStyles(theme);

    const { device_name, device_id, device_type, status: initialStatus } = data;

    // State local cho toggle (mock - trong thực tế sẽ gọi API)
    const [isOn, setIsOn] = useState(initialStatus === 'ON');
    const [isLoading, setIsLoading] = useState(false);

    const iconName = DEVICE_ICONS[device_type || 'FAN'] || 'cog';
    const typeLabel = DEVICE_LABELS[device_type || 'FAN'] || 'Thiết bị';

    /**
     * Xử lý toggle thiết bị.
     * TODO: Khi tích hợp API thật, thay bằng API call tới server điều khiển.
     */
    const handleToggle = async () => {
        setIsLoading(true);

        // Mock API delay
        await new Promise(resolve => setTimeout(() => resolve(undefined), 500));

        setIsOn(prev => !prev);
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            {/* Device Info Row */}
            <View style={styles.infoRow}>
                {/* Device Icon */}
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: isOn
                                ? theme.primary + '1A'
                                : theme.backgroundSecondary,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={iconName}
                        size={22}
                        color={isOn ? theme.primary : theme.textSecondary}
                    />
                </View>

                {/* Device Details */}
                <View style={styles.details}>
                    <Text style={styles.deviceName}>
                        {device_name || `${typeLabel} #${device_id}`}
                    </Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.deviceType}>{typeLabel}</Text>
                        <View style={styles.metaDot} />
                        <Text style={styles.deviceId}>ID: {device_id}</Text>
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Status & Toggle Row */}
            <View style={styles.controlRow}>
                {/* Status indicator */}
                <View style={styles.statusSection}>
                    <Text style={styles.statusLabel}>Trạng thái</Text>
                    <View style={styles.statusValueRow}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: isOn ? theme.success : theme.textSecondary },
                            ]}
                        />
                        <Text
                            style={[
                                styles.statusValue,
                                { color: isOn ? theme.success : theme.textSecondary },
                            ]}
                        >
                            {isOn ? 'Đang hoạt động' : 'Đã tắt'}
                        </Text>
                    </View>
                </View>

                {/* Toggle Button */}
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        isOn ? styles.toggleButtonOn : styles.toggleButtonOff,
                        isLoading && styles.toggleButtonLoading,
                    ]}
                    onPress={handleToggle}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name={isOn ? 'power' : 'power-off'}
                        size={16}
                        color={isOn ? theme.textInverse : theme.textSecondary}
                    />
                    <Text
                        style={[
                            styles.toggleText,
                            { color: isOn ? theme.textInverse : theme.textSecondary },
                        ]}
                    >
                        {isLoading ? '...' : isOn ? 'TẮT' : 'BẬT'}
                    </Text>
                </TouchableOpacity>
            </View>
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
                    minWidth: 240,
                },

                // Info Row
                infoRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                },
                iconContainer: {
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                details: {
                    flex: 1,
                },
                deviceName: {
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.text,
                    lineHeight: 20,
                },
                metaRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 2,
                },
                deviceType: {
                    fontSize: 12,
                    color: theme.textSecondary,
                },
                metaDot: {
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: theme.border,
                },
                deviceId: {
                    fontSize: 12,
                    color: theme.textSecondary,
                },

                // Divider
                divider: {
                    height: 1,
                    backgroundColor: theme.backgroundTertiary,
                    marginVertical: 12,
                },

                // Control Row
                controlRow: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                },
                statusSection: {
                    gap: 4,
                },
                statusLabel: {
                    fontSize: 11,
                    color: theme.textSecondary,
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: 0.3,
                },
                statusValueRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                },
                statusDot: {
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                },
                statusValue: {
                    fontSize: 13,
                    fontWeight: '500',
                },

                // Toggle Button
                toggleButton: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                },
                toggleButtonOn: {
                    backgroundColor: theme.error, // Đỏ = nút TẮT
                },
                toggleButtonOff: {
                    backgroundColor: theme.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: theme.border,
                },
                toggleButtonLoading: {
                    opacity: 0.6,
                },
                toggleText: {
                    fontSize: 12,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                },
            }),
        [theme]
    );
