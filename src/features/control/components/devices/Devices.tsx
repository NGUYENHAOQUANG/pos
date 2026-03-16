import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
    ActivityIndicator,
    Text,
} from 'react-native';
import IconSetting from '@/assets/Icon/IconDevices/IconSetting.svg';
import InfoIcon from '@/assets/Icon/IconDevices/Info.svg';
import { ButtonDevices } from './ButtonDevices';
import { DevicesStatusColor } from './DevicesStatusColor';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import Toast from 'react-native-toast-message';
import { DeviceData, EControlMode } from '@/features/control/types/control.types';
import { colors } from '@/styles/colors';
import { getDeviceIcon } from '@/features/control/utils/deviceUtils';
import { borderRadius } from '@/styles';

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
            return 'Tại chỗ';
        default:
            return '';
    }
};

export const DeviceCard = React.memo<DeviceCardProps>(
    ({ data, onToggle, onSettingsPress, style, isLoading }) => {
        const [showLocalModal, setShowLocalModal] = useState(false);

        const isOxy = data.type === 'oxy';
        const effectiveMode = isOxy ? EControlMode.LOCAL : data.mode;
        const switchTrackColor =
            !data.isOn && effectiveMode !== EControlMode.LOCAL
                ? colors.gray[200]
                : colors.primaryOrange;

        const Icon = getDeviceIcon(data.type);
        if (!Icon) return null;

        return (
            <View style={[styles.cardContainer, style]}>
                <View
                    style={[styles.innerContent, isLoading && { opacity: 0.3 }]}
                    collapsable={false}
                    renderToHardwareTextureAndroid={true}
                >
                    {/* Left: Device Icon */}
                    <View style={styles.iconContainer}>
                        <DevicesStatusColor
                            icon={Icon}
                            isOn={effectiveMode === EControlMode.LOCAL ? true : data.isOn}
                            errorMessage={data.errorMessage}
                            size={36}
                        />
                    </View>

                    {/* Middle: Type Label, Device Name, Mode Badge */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.deviceName} numberOfLines={1}>
                            {getDeviceTypeLabel(data.type)}
                        </Text>
                        <Text style={styles.modelName} numberOfLines={1}>
                            {data.name}
                        </Text>
                        {/* Mode tag - tappable only for LOCAL mode */}
                        <TouchableOpacity
                            style={styles.modeBadge}
                            activeOpacity={effectiveMode === EControlMode.LOCAL ? 0.7 : 1}
                            onPress={
                                effectiveMode === EControlMode.LOCAL
                                    ? () => setShowLocalModal(true)
                                    : undefined
                            }
                        >
                            <Text style={styles.modeText}>{getModeLabel(effectiveMode)}</Text>
                            <InfoIcon width={14} height={14} />
                        </TouchableOpacity>
                    </View>

                    {/* Right: Settings + Toggle */}
                    <View style={styles.rightContainer}>
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => onSettingsPress?.(data.id)}
                            activeOpacity={0.7}
                            disabled={isLoading}
                        >
                            <IconSetting width={16} height={16} />
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
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                )}

                {/* Local mode info modal */}
                <ConfirmationModalUI
                    visible={showLocalModal}
                    onConfirm={() => setShowLocalModal(false)}
                    onCancel={() => setShowLocalModal(false)}
                    title="Thiết bị điều khiển tại chỗ"
                    message={`Thiết bị không điều khiển qua App\nVui lòng thao tác trực tiếp trên thiết bị khi sử dụng`}
                    confirmText="Đã hiểu "
                    cancelText=""
                    showSuccessToast={false}
                    cancelButtonStyle={{ display: 'none' }}
                />
            </View>
        );
    }
);

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        width: '100%',
    },
    innerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    deviceName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    modelName: {
        fontSize: 13,
        color: colors.gray[500],
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
        borderColor: colors.border,
        backgroundColor: colors.white,
        gap: 4,
    },
    modeText: {
        fontSize: 12,
        color: colors.text,
        fontWeight: '400',
    },
    rightContainer: {
        alignItems: 'flex-end',
        gap: 8,
        marginLeft: 8,
    },
    settingsButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 12,
    },
});
