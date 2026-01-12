import { StateCreator } from 'zustand';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';

const DEFAULT_ENV_PARAMS: EnvironmentParameter[] = [
    { id: '1', name: 'pH', limit: '7.5 - 8.5', isChecked: true },
    { id: '2', name: 'DO (mg/L)', limit: '5 - 8', isChecked: true },
    { id: '3', name: 'Nhiệt độ (°C)', limit: '25 - 32', isChecked: true },
    { id: '4', name: 'Độ trong (cm)', limit: '20 - 40', isChecked: true },
    { id: '5', name: 'Độ mặn (ppt)', limit: '20 - 35', isChecked: true },
    { id: '6', name: 'Độ kiềm (mg/L)', limit: '150 - 250', isChecked: true },
];

const DEFAULT_ADVANCED_ENV_PARAMS: EnvironmentParameter[] = [
    { id: '7', name: 'Kali (mg/L)', limit: '250 - 400', isChecked: false },
    { id: '8', name: 'TAN (mg/L)', limit: '0 - 3', isChecked: false },
    { id: '9', name: 'Magie (mg/L)', limit: '750 - 1400', isChecked: false },
    { id: '10', name: 'NO3 (mg/L)', limit: '0 - 10', isChecked: false },
];

export interface SettingStore {
    environmentSettings: {
        defaultParameters: EnvironmentParameter[];
        advancedParameters: EnvironmentParameter[];
    };
    updateEnvironmentSettings: (
        settings: Partial<{
            defaultParameters: EnvironmentParameter[];
            advancedParameters: EnvironmentParameter[];
        }>
    ) => void;
}

export const createSettingStore: StateCreator<
    SettingStore,
    [['zustand/immer', never]],
    [],
    SettingStore
> = set => ({
    environmentSettings: {
        defaultParameters: DEFAULT_ENV_PARAMS,
        advancedParameters: DEFAULT_ADVANCED_ENV_PARAMS,
    },
    updateEnvironmentSettings: settings => {
        set(state => {
            Object.assign(state.environmentSettings, settings);
        });
    },
});
