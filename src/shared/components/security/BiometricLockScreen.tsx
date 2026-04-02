import React, { useCallback, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    AppState,
    AppStateStatus,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { borderRadius, colors } from '@/styles';
import { useSettingsStore, AutoLockTimeout } from '@/features/menu/store/settingsStore';
import { Button } from '@/shared/components/buttons/Button';
import { PinEntryPad } from '@/shared/components/security/PinEntryPad';
import { verifyPin } from '@/shared/utils/hashPin';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FaceIDIcon from '@/assets/Icon/FaceID.svg';
import FingerprintIcon from '@/assets/Icon/Fingerprint.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';

const rnBiometrics = new ReactNativeBiometrics();

/** Maximum PIN attempts before showing forgot PIN option */
const MAX_PIN_ATTEMPTS = 5;

/** Biometric type display labels */
const BIOMETRIC_LABELS: Record<string, string> = {
    [BiometryTypes.FaceID]: 'Face ID',
    [BiometryTypes.TouchID]: 'Touch ID',
    [BiometryTypes.Biometrics]: 'Sinh trắc học',
};

/** Auto-lock timeout options for display */
export const AUTO_LOCK_OPTIONS: { label: string; value: AutoLockTimeout }[] = [
    { label: 'Ngay khi rời ứng dụng', value: 0 },
    { label: 'Sau 1 phút', value: 1 },
    { label: 'Sau 5 phút', value: 5 },
    { label: 'Sau 15 phút', value: 15 },
    { label: 'Sau 30 phút', value: 30 },
    { label: 'Sau 60 phút', value: 60 },
];

interface LockScreenProps {
    /** Whether the lock screen is visible */
    visible: boolean;
    /** Callback when authentication succeeds */
    onUnlock: () => void;
}

/**
 * Full-screen lock overlay supporting biometric + PIN
 * Adapts UI based on lockMethod setting
 */
/** Get the appropriate biometric SVG icon based on biometry type */
function getBiometricSvgIcon(
    biometryType: string | undefined
): React.FC<{ width: number; height: number }> {
    if (Platform.OS === 'ios') {
        // Only show Fingerprint for iPhone SE (TouchID) — all others get FaceID
        if (biometryType === BiometryTypes.TouchID) return FingerprintIcon;
        return FaceIDIcon;
    }
    // Android: always Fingerprint
    return FingerprintIcon;
}

export const BiometricLockScreen: React.FC<LockScreenProps> = ({ visible, onUnlock }) => {
    const insets = useSafeAreaInsets();
    const lockMethod = useSettingsStore(s => s.lockMethod);
    const pinHash = useSettingsStore(s => s.pinHash);
    const setPinHash = useSettingsStore(s => s.setPinHash);
    const setLockMethod = useSettingsStore(s => s.setLockMethod);
    const logout = useAuthStore(s => s.logout);
    const [pinError, setPinError] = React.useState(false);
    const [failedAttempts, setFailedAttempts] = React.useState(0);
    const [forgotModalVisible, setForgotModalVisible] = React.useState(false);
    const hasAutoTriggeredRef = useRef(false);
    const [biometryType, setBiometryType] = React.useState<string | undefined>(undefined);

    // Detect biometry type (FaceID / TouchID / Biometrics)
    useEffect(() => {
        rnBiometrics
            .isSensorAvailable()
            .then(({ biometryType: type }) => {
                setBiometryType(type);
            })
            .catch(() => {});
    }, []);

    const BiometricSvgIcon = getBiometricSvgIcon(biometryType);

    const useBiometric = lockMethod === 'biometric' || lockMethod === 'both';
    const usePin = lockMethod === 'pin' || lockMethod === 'both';
    const showForgotPin = failedAttempts >= MAX_PIN_ATTEMPTS;
    const remainingAttempts = Math.max(0, MAX_PIN_ATTEMPTS - failedAttempts);

    // Reset attempts & auto-trigger flag when lock screen appears/disappears
    React.useEffect(() => {
        if (visible) {
            setFailedAttempts(0);
            hasAutoTriggeredRef.current = false;
        }
    }, [visible]);

    // Pulse animation for the icon
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        }
    }, [visible, pulseScale]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const handleBiometricAuth = useCallback(async () => {
        try {
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();

            if (!available) {
                if (!usePin) onUnlock();
                return;
            }

            const promptMessage =
                biometryType === BiometryTypes.FaceID
                    ? 'Xác thực bằng Face ID để mở khóa'
                    : 'Xác thực bằng vân tay để mở khóa';

            const { success } = await rnBiometrics.simplePrompt({
                promptMessage,
                cancelButtonText: 'Hủy',
                fallbackPromptMessage: 'Sử dụng mật khẩu thiết bị',
            });

            if (success) {
                onUnlock();
            }
        } catch {
            // User cancelled or error — stay locked
        }
    }, [onUnlock, usePin]);

    const handlePinComplete = useCallback(
        (pin: string) => {
            if (pinHash && verifyPin(pin, pinHash)) {
                setFailedAttempts(0);
                onUnlock();
            } else {
                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);
                setPinError(true);
            }
        },
        [pinHash, onUnlock, failedAttempts]
    );

    const handlePinErrorReset = useCallback(() => {
        setPinError(false);
    }, []);

    /** Handle forgot PIN — show confirmation modal */
    const handleForgotPin = useCallback(() => {
        setForgotModalVisible(true);
    }, []);

    /** Execute forgot PIN — clear PIN + logout */
    const executeForgotPin = useCallback(() => {
        setForgotModalVisible(false);
        setPinHash(null);
        setLockMethod('none');
        onUnlock();
        logout();
    }, [setPinHash, setLockMethod, onUnlock, logout]);

    // Auto-trigger biometric ONCE when lock screen appears
    // Uses ref to prevent re-triggering when handleBiometricAuth reference changes
    useEffect(() => {
        if (visible && useBiometric && !hasAutoTriggeredRef.current) {
            hasAutoTriggeredRef.current = true;
            const timer = setTimeout(() => {
                handleBiometricAuth();
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [visible, useBiometric, handleBiometricAuth]);

    if (!visible) return null;

    // PIN-only mode: show full PIN pad
    if (usePin && !useBiometric) {
        return (
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[
                    styles.container,
                    { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
                ]}
            >
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                {showForgotPin ? (
                    <View style={styles.lockedContent}>
                        <Ionicons name="lock-closed" size={48} color={colors.error} />
                        <Text style={styles.lockedTitle}>Đã vượt quá số lần thử</Text>
                        <Text style={styles.lockedSubtitle}>
                            Bạn đã nhập sai mã PIN quá {MAX_PIN_ATTEMPTS} lần. Vui lòng đăng xuất và
                            đăng nhập lại.
                        </Text>
                        <TouchableOpacity
                            style={styles.forgotButton}
                            onPress={handleForgotPin}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.forgotText}>Quên mã PIN? Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <PinEntryPad
                        title="Nhập mã PIN"
                        subtitle={`Nhập mã PIN để mở khóa ứng dụng${
                            remainingAttempts < MAX_PIN_ATTEMPTS
                                ? ` (còn ${remainingAttempts} lần)`
                                : ''
                        }`}
                        onComplete={handlePinComplete}
                        error={pinError}
                        errorMessage={`Mã PIN không đúng, còn ${remainingAttempts} lần thử`}
                        onErrorReset={handlePinErrorReset}
                    />
                )}
                <ConfirmationModalUI
                    visible={forgotModalVisible}
                    onConfirm={executeForgotPin}
                    onCancel={() => setForgotModalVisible(false)}
                    title="Quên mã PIN?"
                    message="Bạn sẽ được đăng xuất và cần đăng nhập lại để đặt mã PIN mới."
                    confirmText="Đăng xuất"
                    cancelText="Hủy"
                    showSuccessToast={false}
                />
            </Animated.View>
        );
    }

    // Biometric-only mode: show icon + button
    if (useBiometric && !usePin) {
        return (
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
            >
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <View style={styles.content}>
                    <Animated.View style={[styles.iconContainer, pulseStyle]}>
                        <BiometricSvgIcon width={64} height={64} />
                    </Animated.View>
                    <Text style={styles.title}>Ứng dụng đang khóa</Text>
                    <Text style={styles.subtitle}>Xác thực để tiếp tục sử dụng Mebieco</Text>
                    <Button
                        title="Mở khóa"
                        onPress={handleBiometricAuth}
                        variant="primary"
                        size="large"
                    />
                </View>
            </Animated.View>
        );
    }

    // Both mode: PIN pad with biometric button
    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[
                styles.container,
                { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
            ]}
        >
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            {showForgotPin ? (
                <View style={styles.lockedContent}>
                    <Ionicons name="lock-closed" size={48} color={colors.error} />
                    <Text style={styles.lockedTitle}>Đã vượt quá số lần thử</Text>
                    <Text style={styles.lockedSubtitle}>
                        Bạn đã nhập sai mã PIN quá {MAX_PIN_ATTEMPTS} lần. Vui lòng đăng xuất và
                        đăng nhập lại.
                    </Text>
                    <TouchableOpacity
                        style={styles.forgotButton}
                        onPress={handleForgotPin}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.forgotText}>Quên mã PIN? Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <PinEntryPad
                    title="Nhập mã PIN"
                    subtitle={`Hoặc sử dụng sinh trắc học để mở khóa${
                        remainingAttempts < MAX_PIN_ATTEMPTS
                            ? ` (còn ${remainingAttempts} lần)`
                            : ''
                    }`}
                    onComplete={handlePinComplete}
                    showBiometric
                    onBiometricPress={handleBiometricAuth}
                    biometricIcon={<BiometricSvgIcon width={40} height={40} />}
                    error={pinError}
                    errorMessage={`Mã PIN không đúng, còn ${remainingAttempts} lần thử`}
                    onErrorReset={handlePinErrorReset}
                />
            )}
            <ConfirmationModalUI
                visible={forgotModalVisible}
                onConfirm={executeForgotPin}
                onCancel={() => setForgotModalVisible(false)}
                title="Quên mã PIN?"
                message="Bạn sẽ được đăng xuất và cần đăng nhập lại để đặt mã PIN mới."
                confirmText="Đăng xuất"
                cancelText="Hủy"
                showSuccessToast={false}
            />
        </Animated.View>
    );
};

/**
 * Custom hook to manage lock state
 * Handles app state transitions and auto-lock timeout logic
 */
export function useBiometricLock() {
    const lockMethod = useSettingsStore(s => s.lockMethod);
    const autoLockTimeout = useSettingsStore(s => s.autoLockTimeout);
    const [isLocked, setIsLocked] = React.useState(false);
    const backgroundTimestampRef = useRef<number | null>(null);
    const hasInitiallyAuthRef = useRef(false);

    const isLockEnabled = lockMethod !== 'none';

    // Lock on first mount if lock is enabled
    // Use a ref to capture the initial value — prevents locking when user
    // just enabled PIN setup during this session (isLockEnabled transitions false→true)
    const wasLockEnabledOnMountRef = useRef(isLockEnabled);

    useEffect(() => {
        if (wasLockEnabledOnMountRef.current && !hasInitiallyAuthRef.current) {
            setIsLocked(true);
        }
        // Only run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Monitor app state changes for auto-lock
    // Only track 'background' (not 'inactive') — on iOS, system dialogs like
    // FaceID/TouchID send 'inactive' → 'active', which would immediately re-lock
    // the app if autoLockTimeout === 0, causing an infinite FaceID loop.
    useEffect(() => {
        if (!isLockEnabled) return;

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background') {
                backgroundTimestampRef.current = Date.now();
            } else if (nextAppState === 'active') {
                if (backgroundTimestampRef.current !== null) {
                    const elapsedMs = Date.now() - backgroundTimestampRef.current;
                    const elapsedMinutes = elapsedMs / (1000 * 60);
                    backgroundTimestampRef.current = null;

                    if (autoLockTimeout === 0 || elapsedMinutes >= autoLockTimeout) {
                        setIsLocked(true);
                    }
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isLockEnabled, autoLockTimeout]);

    const handleUnlock = useCallback(() => {
        hasInitiallyAuthRef.current = true;
        backgroundTimestampRef.current = null; // Xóa timestamp tránh re-lock khi active
        setIsLocked(false);
    }, []);

    return {
        isLocked: isLockEnabled && isLocked,
        handleUnlock,
    };
}

/**
 * Check if device supports biometric authentication
 */
export async function checkBiometricAvailability(): Promise<{
    available: boolean;
    biometryType: string | undefined;
    biometryLabel: string;
}> {
    try {
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();
        return {
            available,
            biometryType,
            biometryLabel: biometryType ? BIOMETRIC_LABELS[biometryType] || 'Sinh trắc học' : '',
        };
    } catch {
        return { available: false, biometryType: undefined, biometryLabel: '' };
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    lockedContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    lockedTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginTop: 16,
    },
    lockedSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    forgotButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    forgotText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.primaryOrange,
    },
});
