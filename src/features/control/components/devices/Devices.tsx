import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import IconSetting from '@/assets/Icon/IconDevices/IconSetting.svg';
import { ButtonControlMode } from './ButtonControlMode';
import { ButtonDevices } from './ButtonDevices';
import { DevicesStatusColor } from './DevicesStatusColor';
import Toast from 'react-native-toast-message';
import { DeviceData, EControlMode } from '@/features/control/types/control.types';
import { colors } from '@/styles/colors';
import { AutoScrollText } from '@/shared/components/ui/AutoScrollText';
import { getDeviceIcon } from '@/features/control/utils/deviceUtils';

// Responsive Scaling Helper
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375; // Standard design width (e.g., iPhone X/11/12/13/14 Pro)
const scaleFactor = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.2); // Cap scaling to avoid excessive size on tablets

const s = (size: number) => Math.round(size * scaleFactor);

export interface DeviceCardProps {
    data: DeviceData;
    onToggle: (id: string, val: boolean) => void;
    onSettingsPress?: (id: string) => void;
    onModePress?: (id: string) => void;
    style?: StyleProp<ViewStyle>;
    isLoading?: boolean;
}

export const DeviceCard = React.memo<DeviceCardProps>(
    ({ data, onToggle, onSettingsPress, onModePress, style, isLoading }) => {
        // Determine styles based on state
        let containerStyle: ViewStyle = styles.cardContainer;
        let switchTrackColor: string = colors.primaryOrange;
        const isOxy = data.type === 'oxy';
        const effectiveMode = isOxy ? EControlMode.LOCAL : data.mode;

        if (data.errorMessage) {
            // Error State
            containerStyle = { ...styles.cardContainer, ...styles.cardError };
            switchTrackColor = colors.primaryOrange;
        } else if (effectiveMode === EControlMode.LOCAL) {
            // Local Mode (Active but locked)
            containerStyle = { ...styles.cardContainer, ...styles.cardActive };
            switchTrackColor = colors.primaryOrange; // Orange for local too
        } else if (!data.isOn) {
            // Inactive State
            containerStyle = { ...styles.cardContainer, ...styles.cardInactive };
            switchTrackColor = colors.gray[200];
        } else {
            // Active State
            containerStyle = { ...styles.cardContainer, ...styles.cardActive };
        }

        const Icon = getDeviceIcon(data.type);

        if (!Icon) return null;

        return (
            <View style={[containerStyle, style]}>
                <View
                    style={[styles.innerContent, isLoading && { opacity: 0.3 }]}
                    collapsable={false}
                    renderToHardwareTextureAndroid={true}
                >
                    {/* Top Row: Icon & Settings */}
                    <View style={styles.rowTop}>
                        <DevicesStatusColor
                            icon={Icon}
                            isOn={effectiveMode === EControlMode.LOCAL ? true : data.isOn}
                            errorMessage={data.errorMessage}
                            size={s(48)}
                        />
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => onSettingsPress?.(data.id)}
                            activeOpacity={0.7}
                            disabled={isLoading}
                        >
                            <IconSetting width={s(32)} height={s(32)} />
                        </TouchableOpacity>
                    </View>

                    {/* Middle Row: Error & Mode */}
                    <View style={styles.rowMiddle}>
                        <View style={styles.errorContainer}>
                            {data.errorMessage ? (
                                <AutoScrollText text={data.errorMessage} style={styles.errorText} />
                            ) : null}
                        </View>
                        <View style={styles.modeContainer}>
                            <ButtonControlMode
                                mode={effectiveMode}
                                onPress={
                                    effectiveMode === EControlMode.LOCAL
                                        ? undefined
                                        : () => onModePress?.(data.id)
                                }
                                style={styles.scaledButton}
                                disabled={isLoading}
                            />
                        </View>
                    </View>

                    {/* Bottom Row: Name & Switch */}
                    <View style={styles.rowBottom}>
                        <View style={styles.nameContainer}>
                            <AutoScrollText text={data.name} style={styles.deviceName} />
                        </View>
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
                            style={[
                                styles.scaledButton,
                                effectiveMode === EControlMode.LOCAL && { opacity: 0.5 },
                            ]}
                            disabled={isLoading}
                        />
                    </View>
                </View>

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: s(16),
        padding: s(12),
        borderWidth: 1,
        borderColor: colors.border,
        width: '100%', // Fill the grid wrapper
        aspectRatio: 152 / 114, // Increase height for better spacing
    },
    cardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    cardInactive: {
        borderColor: colors.border, // Light visible border
        backgroundColor: colors.gray[100],
    },
    cardError: {
        borderColor: colors.red[200],
        backgroundColor: colors.red[25], // Light red background
    },
    innerContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    // Row Styles
    rowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    rowMiddle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // No flex:1 here, let it just take necessary height?
        // Actually, justifyContent space-between on parent handles the gap.
        // If we want it to align specifically, we need to ensure rows don't collapse?
        // They have content, so they won't collapse.
    },
    rowBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    // Element Styles
    settingsButton: {
        width: s(32),
        height: s(32),
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        flex: 1,
        paddingRight: s(8),
        justifyContent: 'center',
    },
    errorText: {
        fontSize: s(12),
        color: colors.error,
        fontWeight: '400',
    },
    nameContainer: {
        flex: 1,
        paddingRight: s(8),
        justifyContent: 'flex-end',
    },
    deviceName: {
        fontSize: s(14),
        fontWeight: '400',
        color: colors.text,
    },
    modeContainer: {
        marginTop: -s(16),
    },
    scaledButton: {
        transform: [{ scale: scaleFactor < 1 ? scaleFactor : 1 }],
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: s(16), // Match card border radius
    },
});
