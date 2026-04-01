import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
    soundEnabled: boolean;
    hapticEnabled: boolean;
    alertSoundEnabled: boolean;
}

interface SettingsActions {
    toggleSound: () => void;
    toggleHaptic: () => void;
    toggleAlertSound: () => void;
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
