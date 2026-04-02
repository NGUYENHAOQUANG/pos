import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Auto-lock timeout options in minutes (0 = lock immediately when leaving app) */
export type AutoLockTimeout = 0 | 1 | 5 | 15 | 30 | 60;

/** Lock method for app security */
export type LockMethod = 'none' | 'biometric' | 'pin' | 'both';

interface SettingsState {
    soundEnabled: boolean;
    hapticEnabled: boolean;
    alertSoundEnabled: boolean;
    tabSlideEnabled: boolean;
    tabSwipeEnabled: boolean;
    logoLoadingEnabled: boolean;
    liquidGlassEnabled: boolean;
    lockMethod: LockMethod;
    autoLockTimeout: AutoLockTimeout;
    pinHash: string | null;
}

interface SettingsActions {
    toggleSound: () => void;
    toggleHaptic: () => void;
    toggleAlertSound: () => void;
    toggleTabSlide: () => void;
    toggleTabSwipe: () => void;
    toggleLogoLoading: () => void;
    toggleLiquidGlass: () => void;
    setLockMethod: (method: LockMethod) => void;
    setAutoLockTimeout: (timeout: AutoLockTimeout) => void;
    setPinHash: (hash: string | null) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setHapticEnabled: (enabled: boolean) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
    persist(
        immer(set => ({
            soundEnabled: false,
            hapticEnabled: true,
            alertSoundEnabled: false,
            tabSlideEnabled: true,
            tabSwipeEnabled: true,
            logoLoadingEnabled: true,
            liquidGlassEnabled: true,
            lockMethod: 'none' as LockMethod,
            autoLockTimeout: 0 as AutoLockTimeout,
            pinHash: null,

            toggleSound: () =>
                set(state => {
                    state.soundEnabled = !state.soundEnabled;
                }),

            toggleHaptic: () =>
                set(state => {
                    state.hapticEnabled = !state.hapticEnabled;
                }),

            toggleAlertSound: () =>
                set(state => {
                    state.alertSoundEnabled = !state.alertSoundEnabled;
                }),

            toggleTabSlide: () =>
                set(state => {
                    state.tabSlideEnabled = !state.tabSlideEnabled;
                }),

            toggleTabSwipe: () =>
                set(state => {
                    state.tabSwipeEnabled = !state.tabSwipeEnabled;
                }),

            toggleLogoLoading: () =>
                set(state => {
                    state.logoLoadingEnabled = !state.logoLoadingEnabled;
                }),

            toggleLiquidGlass: () =>
                set(state => {
                    state.liquidGlassEnabled = !state.liquidGlassEnabled;
                }),

            setLockMethod: (method: LockMethod) =>
                set(state => {
                    state.lockMethod = method;
                }),

            setAutoLockTimeout: (timeout: AutoLockTimeout) =>
                set(state => {
                    state.autoLockTimeout = timeout;
                }),

            setPinHash: (hash: string | null) =>
                set(state => {
                    state.pinHash = hash;
                }),

            setSoundEnabled: (enabled: boolean) =>
                set(state => {
                    state.soundEnabled = enabled;
                }),

            setHapticEnabled: (enabled: boolean) =>
                set(state => {
                    state.hapticEnabled = enabled;
                }),
        })),
        {
            name: 'app-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
