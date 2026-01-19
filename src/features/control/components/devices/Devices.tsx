import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ButtonControlMode } from './ButtonControlMode';
import { ButtonDevices } from './ButtonDevices';
import { DevicesStatusColor } from './DevicesStatusColor';
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
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
    data,
    onToggle,
    onSettingsPress,
    onModePress,
    style,
}) => {
    // Determine styles based on state
    let containerStyle: ViewStyle = styles.cardContainer;
    let switchTrackColor: string = colors.primary;

    if (data.errorMessage) {
        // Error State
        containerStyle = { ...styles.cardContainer, ...styles.cardError };
        switchTrackColor = colors.primary;
    } else if (data.mode === EControlMode.LOCAL) {
        // Local Mode (Active but locked)
        containerStyle = { ...styles.cardContainer, ...styles.cardActive };
        switchTrackColor = colors.primaryLight; // Lighter blue to indicate read-only/local
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
            <View style={styles.innerContent}>
                {/* Top Row: Icon & Settings */}
                <View style={styles.rowTop}>
                    <DevicesStatusColor
                        icon={Icon}
                        isOn={data.isOn}
                        errorMessage={data.errorMessage}
                        size={s(48)}
                    />
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => onSettingsPress?.(data.id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={s(18)} color={colors.gray[600]} />
                    </TouchableOpacity>
                </View>

                {/* Middle Row: Error & Mode */}
                <View style={styles.rowMiddle}>
                    <View style={styles.errorContainer}>
                        {data.errorMessage ? (
                            <AutoScrollText text={data.errorMessage} style={styles.errorText} />
                        ) : null}
                    </View>
                    <ButtonControlMode
                        mode={data.mode}
                        onPress={
                            data.mode === EControlMode.LOCAL
                                ? undefined
                                : () => onModePress?.(data.id)
                        }
                        style={styles.scaledButton}
                    />
                </View>

                {/* Bottom Row: Name & Switch */}
                <View style={styles.rowBottom}>
                    <View style={styles.nameContainer}>
                        <AutoScrollText text={data.name} style={styles.deviceName} />
                    </View>
                    <ButtonDevices
                        value={data.isOn}
                        onValueChange={val => onToggle(data.id, val)}
                        trackColor={switchTrackColor}
                        style={styles.scaledButton}
                        disabled={data.mode === EControlMode.LOCAL}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: s(16),
        padding: s(12),
        borderWidth: 1,
        borderColor: colors.border,
        width: '100%', // Fill the grid wrapper
        aspectRatio: 164 / 140, // Increase height for better spacing
    },
    cardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    cardInactive: {
        borderColor: colors.border, // Light visible border
        backgroundColor: colors.gray[50],
    },
    cardError: {
        borderColor: colors.error,
        backgroundColor: '#FEF2F2', // Light red background
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
        width: s(40),
        height: s(40),
        borderRadius: s(8),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
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
    scaledButton: {
        transform: [{ scale: scaleFactor < 1 ? scaleFactor : 1 }],
    },
});
