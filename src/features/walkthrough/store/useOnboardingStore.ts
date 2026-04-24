import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

export type OnboardingModule = 'farm' | 'material' | 'account' | 'report' | 'none';

interface OnboardingState {
    // Persisted state
    hasCompletedFarm: boolean;
    hasCompletedMaterial: boolean;
    hasCompletedAccount: boolean;
    hasCompletedReport: boolean;

    // Runtime-only state (not persisted)
    activeModule: OnboardingModule;
    currentStep: number;
    _hasHydrated: boolean;

    // Actions
    startOnboarding: (module: OnboardingModule) => void;
    nextStep: () => void;
    skipOnboarding: () => void;
    completeOnboarding: (module: OnboardingModule) => void;
    resetOnboarding: (module?: OnboardingModule) => void;
    setHasHydrated: (hasHydrated: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            hasCompletedFarm: false,
            hasCompletedMaterial: false,
            hasCompletedAccount: false,
            hasCompletedReport: false,

            // Runtime-only (reset on app restart)
            activeModule: 'none',
            currentStep: 0,
            _hasHydrated: false,

            startOnboarding: module => {
                const walkthroughEnabled = useSettingsStore.getState().walkthroughEnabled;
                if (!walkthroughEnabled) return;
                set({ activeModule: module, currentStep: 0 });
            },
            nextStep: () =>
                set((state: OnboardingState) => ({ currentStep: state.currentStep + 1 })),
            skipOnboarding: () => {
                const { activeModule, completeOnboarding } = get();
                if (activeModule !== 'none') {
                    completeOnboarding(activeModule);
                }
            },
            completeOnboarding: module => {
                const updates: Partial<OnboardingState> = { activeModule: 'none', currentStep: 0 };
                if (module === 'farm') updates.hasCompletedFarm = true;
                if (module === 'material') updates.hasCompletedMaterial = true;
                if (module === 'account') updates.hasCompletedAccount = true;
                if (module === 'report') updates.hasCompletedReport = true;
                set(updates);
            },
            resetOnboarding: module =>
                set(() => {
                    const updates: Partial<OnboardingState> = {
                        activeModule: 'none',
                        currentStep: 0,
                    };
                    if (module === 'farm') updates.hasCompletedFarm = false;
                    else if (module === 'material') updates.hasCompletedMaterial = false;
                    else if (module === 'account') updates.hasCompletedAccount = false;
                    else if (module === 'report') updates.hasCompletedReport = false;
                    else {
                        // Reset all if no module specified
                        updates.hasCompletedFarm = false;
                        updates.hasCompletedMaterial = false;
                        updates.hasCompletedAccount = false;
                        updates.hasCompletedReport = false;
                    }
                    return updates;
                }),
            setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
        }),
        {
            name: 'onboarding-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist completion flags — runtime state resets on app restart
            partialize: (state: OnboardingState) => ({
                hasCompletedFarm: state.hasCompletedFarm,
                hasCompletedMaterial: state.hasCompletedMaterial,
                hasCompletedAccount: state.hasCompletedAccount,
                hasCompletedReport: state.hasCompletedReport,
            }),
            onRehydrateStorage: () => (state?: OnboardingState) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

/**
 * Helper to manually advance to the next step from an interactive UI element.
 * Safe to call anywhere - only advances if the correct module is currently active.
 */
export const triggerOnboardingStep = (expectedModule: OnboardingModule) => {
    const { activeModule, nextStep } = useOnboardingStore.getState();
    if (activeModule === expectedModule) {
        nextStep();
    }
};
