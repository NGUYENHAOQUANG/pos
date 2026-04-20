import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingModule = 'farm' | 'material' | 'account' | 'none';

interface OnboardingState {
    // Persisted state
    hasCompletedFarm: boolean;
    hasCompletedMaterial: boolean;
    hasCompletedAccount: boolean;

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
        set => ({
            // Persisted
            hasCompletedFarm: false,
            hasCompletedMaterial: false,
            hasCompletedAccount: false,

            // Runtime-only (reset on app restart)
            activeModule: 'none',
            currentStep: 0,
            _hasHydrated: false,

            startOnboarding: module => set({ activeModule: module, currentStep: 0 }),
            nextStep: () =>
                set((state: OnboardingState) => ({ currentStep: state.currentStep + 1 })),
            skipOnboarding: () =>
                set((state: OnboardingState) => {
                    const updates: Partial<OnboardingState> = {
                        activeModule: 'none',
                        currentStep: 0,
                    };
                    if (state.activeModule === 'farm') updates.hasCompletedFarm = true;
                    if (state.activeModule === 'material') updates.hasCompletedMaterial = true;
                    if (state.activeModule === 'account') updates.hasCompletedAccount = true;
                    return updates;
                }),
            completeOnboarding: module => {
                const updates: Partial<OnboardingState> = { activeModule: 'none', currentStep: 0 };
                if (module === 'farm') updates.hasCompletedFarm = true;
                if (module === 'material') updates.hasCompletedMaterial = true;
                if (module === 'account') updates.hasCompletedAccount = true;
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
                    else {
                        // Reset all if no module specified
                        updates.hasCompletedFarm = false;
                        updates.hasCompletedMaterial = false;
                        updates.hasCompletedAccount = false;
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
            }),
            onRehydrateStorage: () => (state?: OnboardingState) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

/** Selector: check if any onboarding is currently active (for scroll lock, etc.) */
export const useIsOnboardingActive = () =>
    useOnboardingStore(state => state.activeModule !== 'none');
