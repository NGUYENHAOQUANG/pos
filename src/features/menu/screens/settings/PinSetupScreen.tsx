import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { PinEntryPad } from '@/shared/components/security/PinEntryPad';
import { useSettingsStore, LockMethod } from '@/features/menu/store/settingsStore';
import { hashPin, verifyPin } from '@/shared/utils/hashPin';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { haptics } from '@/shared/utils/haptics';

type PinSetupMode = 'create' | 'change' | 'disable' | 'remove';
type SetupStep = 'verify' | 'create' | 'confirm';

/** Header titles per mode */
const MODE_TITLES: Record<PinSetupMode, string> = {
    create: 'Đặt mã PIN',
    change: 'Đổi mã PIN',
    disable: 'Tắt mã PIN',
    remove: 'Xóa mã PIN',
};

/**
 * PIN Setup Screen — multi-mode
 * - create: Enter new PIN → Confirm → Save
 * - change: Verify old PIN → Enter new PIN → Confirm → Save
 * - disable: Verify old PIN → Disable lock
 * - remove: Verify old PIN → Remove PIN hash + Disable lock
 */
export const PinSetupScreen: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const navigation = useNavigation();
    const route = useRoute<RouteProp<AppStackParamList, 'PinSetup'>>();
    const mode: PinSetupMode = route.params?.mode ?? 'create';

    const setPinHash = useSettingsStore(s => s.setPinHash);
    const setLockMethod = useSettingsStore(s => s.setLockMethod);
    const lockMethod = useSettingsStore(s => s.lockMethod);
    const pinHash = useSettingsStore(s => s.pinHash);

    // Determine initial step based on mode
    const needsVerify = mode !== 'create';
    const [step, setStep] = useState<SetupStep>(needsVerify ? 'verify' : 'create');
    const [firstPin, setFirstPin] = useState('');
    const [error, setError] = useState(false);

    /** Step 1 (for change/disable/remove): Verify current PIN */
    const handleVerifyComplete = useCallback(
        (pin: string) => {
            if (!pinHash || !verifyPin(pin, pinHash)) {
                setError(true);
                return;
            }

            haptics.medium();

            // PIN verified — execute action based on mode
            if (mode === 'disable' || mode === 'remove') {
                setPinHash(null);
                setLockMethod('none');
                navigation.goBack();
                return;
            }

            // mode === 'change' → proceed to create new PIN
            setStep('create');
            setError(false);
        },
        [pinHash, mode, setLockMethod, setPinHash, navigation]
    );

    /** Step 2: Enter new PIN */
    const handleCreateComplete = useCallback((pin: string) => {
        setFirstPin(pin);
        setStep('confirm');
    }, []);

    /** Step 3: Confirm new PIN */
    const handleConfirmComplete = useCallback(
        (pin: string) => {
            if (pin === firstPin) {
                haptics.medium();
                const hash = hashPin(pin);
                setPinHash(hash);

                // Set lock method based on current setting
                const newMethod: LockMethod =
                    lockMethod === 'both' ? 'both' : lockMethod === 'biometric' ? 'both' : 'pin';
                setLockMethod(newMethod);

                navigation.goBack();
            } else {
                // PINs don't match — restart from create step
                setError(true);
            }
        },
        [firstPin, setPinHash, setLockMethod, lockMethod, navigation]
    );

    const handleErrorReset = useCallback(() => {
        setError(false);
    }, []);

    const getStepContent = () => {
        switch (step) {
            case 'verify':
                return (
                    <PinEntryPad
                        title="Nhập mã PIN hiện tại"
                        subtitle="Xác thực mã PIN để tiếp tục"
                        onComplete={handleVerifyComplete}
                        error={error}
                        errorMessage="Mã PIN không đúng, vui lòng thử lại"
                        onErrorReset={handleErrorReset}
                    />
                );
            case 'create':
                return (
                    <PinEntryPad
                        title={mode === 'change' ? 'Nhập mã PIN mới' : 'Tạo mã PIN'}
                        subtitle="Nhập 4 chữ số để bảo vệ ứng dụng"
                        onComplete={handleCreateComplete}
                    />
                );
            case 'confirm':
                return (
                    <PinEntryPad
                        title="Xác nhận mã PIN"
                        subtitle="Nhập lại mã PIN để xác nhận"
                        onComplete={handleConfirmComplete}
                        error={error}
                        errorMessage="Mã PIN không khớp, vui lòng thử lại"
                        onErrorReset={handleErrorReset}
                    />
                );
        }
    };

    return (
        <View style={styles.container}>
            <HeaderSection title={MODE_TITLES[mode]} />
            {getStepContent()}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
    });
