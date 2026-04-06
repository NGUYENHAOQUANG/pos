import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
    ActivityIndicator,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import IconSetting from '@/assets/Icon/IconDevices/IconSetting.svg';
import InfoIcon from '@/assets/Icon/IconDevices/Info.svg';
import WarningCircleIcon from '@/assets/Icon/WarningCircle.svg';
import { ButtonDevices } from '@/features/control/components/devices/ButtonDevices';
import { DevicesStatusColor } from '@/features/control/components/devices/DevicesStatusColor';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import Toast from 'react-native-toast-message';
import { DeviceData, EControlMode } from '@/features/control/types/control.types';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { getDeviceIcon } from '@/features/control/utils/deviceUtils';
import { borderRadius } from '@/styles';
import { deviceApi } from '@/features/control/api/deviceApi';

export interface DeviceCardProps {
    data: DeviceData;
    onToggle: (id: string, val: boolean) => void;
    onSettingsPress?: (id: string) => void;
    onModePress?: (id: string) => void;
    style?: StyleProp<ViewStyle>;
    isLoading?: boolean;
}

/**
 * Get display label for device type
 */
const getDeviceTypeLabel = (type: string): string => {
    switch (type) {
        case 'feeder':
            return 'Máy cho ăn';
        case 'fan':
            return 'Quạt nước';
        case 'oxy':
            return 'Máy Oxy';
        case 'syphon':
            return 'Syphon';
        case 'pump':
            return 'Máy bơm';
        default:
            return type;
    }
};

const getModeLabel = (mode: EControlMode): string => {
    switch (mode) {
        case EControlMode.MANUAL:
            return 'Thủ công';
        case EControlMode.SCHEDULE:
            return 'Lịch trình';
        case EControlMode.LOCAL:
            return '';
        default:
            return '';
    }
};

export const DeviceCard = React.memo<DeviceCardProps>(
    ({ data, onToggle, onSettingsPress, style, isLoading }) => {
        const theme = useAppTheme();
        const themedStyles = getStyles(theme);

        const [showLocalModal, setShowLocalModal] = useState(false);
        const [actualMode, setActualMode] = useState<EControlMode>(EControlMode.MANUAL);

        const isOxy = data.type === 'oxy';

        // Fetch schedules from API to determine real mode
        useEffect(() => {
            if (isOxy || !data.id) return;
            const fetchMode = async () => {
                try {
                    const response = await deviceApi.getSchedules(data.id);
                    const items = response.data?.data?.items ?? [];
                    setActualMode(items.length > 0 ? EControlMode.SCHEDULE : EControlMode.MANUAL);
                } catch {
                    setActualMode(EControlMode.MANUAL);
                }
            };
            fetchMode();
        }, [data.id, isOxy]);

        const effectiveMode = isOxy ? EControlMode.LOCAL : actualMode;
        const switchTrackColor =
            !data.isOn && effectiveMode !== EControlMode.LOCAL
                ? theme.gray[200]
                : theme.primaryOrange;

        const Icon = getDeviceIcon(data.type);
        if (!Icon) return null;

        const hasError = !!data.errorMessage;

        return (
            <View
                style={[
                    themedStyles.cardContainer,
                    hasError && { borderColor: theme.red[500], backgroundColor: theme.red[25] },
                    style,
                ]}
            >
                <View
                    style={[staticStyles.innerContent, isLoading && { opacity: 0.3 }]}
                    collapsable={false}
                    renderToHardwareTextureAndroid={true}
                >
                    {/* Left: Device Icon */}
                    <View style={themedStyles.iconContainer}>
                        <DevicesStatusColor
                            icon={Icon}
                            isOn={effectiveMode === EControlMode.LOCAL ? true : data.isOn}
                            errorMessage={data.errorMessage}
                            size={36}
                        />
                    </View>

                    {/* Middle: Type Label, Device Name, Mode Badge */}
                    <View style={staticStyles.infoContainer}>
                        <Text style={themedStyles.deviceName} numberOfLines={1}>
                            {getDeviceTypeLabel(data.type)}
                        </Text>
                        <Text style={themedStyles.modelName} numberOfLines={1}>
                            {data.name}
                        </Text>
                        {/* Mode tag - tappable only for LOCAL mode */}
                        <TouchableOpacity
                            style={[
                                themedStyles.modeBadge,
                                getModeLabel(effectiveMode) ? { gap: 2 } : { gap: 0 },
                            ]}
                            activeOpacity={effectiveMode === EControlMode.LOCAL ? 0.7 : 1}
                            onPress={
                                effectiveMode === EControlMode.LOCAL
                                    ? () => setShowLocalModal(true)
                                    : undefined
                            }
                        >
                            {getModeLabel(effectiveMode) ? (
                                <Text style={themedStyles.modeText}>
                                    {getModeLabel(effectiveMode)}
                                </Text>
                            ) : null}
                            <InfoIcon width={14} height={14} color={theme.text} />
                        </TouchableOpacity>

                        {/* Error message */}
                        {hasError && (
                            <View style={staticStyles.errorRow}>
                                <WarningCircleIcon width={16} height={16} />
                                <Text style={themedStyles.errorText}>{data.errorMessage}</Text>
                            </View>
                        )}
                    </View>

                    {/* Right: Settings + Toggle */}
                    <View style={staticStyles.rightContainer}>
                        <TouchableOpacity
                            style={themedStyles.settingsButton}
                            onPress={() => onSettingsPress?.(data.id)}
                            activeOpacity={0.7}
                            disabled={isLoading}
                        >
                            <IconSetting width={16} height={16} color={theme.text} />
                        </TouchableOpacity>
                        <ButtonDevices
                            value={effectiveMode === EControlMode.LOCAL ? true : data.isOn}
                            onValueChange={val => {
                                if (effectiveMode === EControlMode.LOCAL) {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Không thể bật/tắt thiết bị này',
                                    });
                                    return;
                                }
                                onToggle(data.id, val);
                            }}
                            trackColor={switchTrackColor}
                            style={[effectiveMode === EControlMode.LOCAL && { opacity: 0.5 }]}
                            disabled={isLoading}
                        />
                    </View>
                </View>

                {isLoading && (
                    <View style={staticStyles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.primary} />
                    </View>
                )}

                {/* Local mode info modal */}
                <ConfirmationModalUI
                    visible={showLocalModal}
                    onConfirm={() => setShowLocalModal(false)}
                    onCancel={() => setShowLocalModal(false)}
                    title="Thiết bị Oxy luôn hoạt động"
                    message={`Thiết bị không thể điều khiển`}
                    confirmText="Đã hiểu "
                    cancelText=""
                    showSuccessToast={false}
                    cancelButtonStyle={{ display: 'none' }}
                />
            </View>
        );
    }
);

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
    innerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    rightContainer: {
        alignItems: 'flex-end',
        gap: 8,
        marginLeft: 8,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 12,
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
});

// Dynamic styles based on theme
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        cardContainer: {
            backgroundColor: theme.background,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border,
            width: '100%',
        },
        iconContainer: {
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            marginRight: 12,
        },
        deviceName: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.text,
        },
        modelName: {
            fontSize: 13,
            color: theme.textSecondary,
            fontWeight: '400',
        },
        modeBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
        },
        modeText: {
            fontSize: 12,
            color: theme.text,
            fontWeight: '400',
        },
        settingsButton: {
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.border,
        },
        errorText: {
            fontSize: 12,
            color: theme.red[500],
            fontWeight: '400',
        },
    });
