import { StateCreator } from 'zustand';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';

const DEFAULT_ENV_PARAMS: EnvironmentParameter[] = [
    { id: ENVIRONMENT_METRIC_IDS.PH, name: 'pH', limit: '7.5 - 8.5', isChecked: true },
    { id: ENVIRONMENT_METRIC_IDS.DO, name: 'DO (mg/L)', limit: '5 - 8', isChecked: true },
    {
        id: ENVIRONMENT_METRIC_IDS.TEMPERATURE,
        name: 'Nhiệt độ (°C)',
        limit: '25 - 32',
        isChecked: true,
    },
    {
        id: ENVIRONMENT_METRIC_IDS.TRANSPARENCY,
        name: 'Độ trong (cm)',
        limit: '20 - 40',
        isChecked: true,
    },
    {
        id: ENVIRONMENT_METRIC_IDS.SALINITY,
        name: 'Độ mặn (ppt)',
        limit: '20 - 35',
        isChecked: true,
    },
    {
        id: ENVIRONMENT_METRIC_IDS.ALKALINITY,
        name: 'Độ kiềm (mg/L)',
        limit: '150 - 250',
        isChecked: true,
    },
];

const DEFAULT_ADVANCED_ENV_PARAMS: EnvironmentParameter[] = [
    { id: ENVIRONMENT_METRIC_IDS.KALI, name: 'Kali (mg/L)', limit: '250 - 400', isChecked: false },
    { id: ENVIRONMENT_METRIC_IDS.TAN, name: 'TAN (mg/L)', limit: '0 - 3', isChecked: false },
    {
        id: ENVIRONMENT_METRIC_IDS.MAGIE,
        name: 'Magie (mg/L)',
        limit: '750 - 1400',
        isChecked: false,
    },
    { id: ENVIRONMENT_METRIC_IDS.NO3, name: 'NO3 (mg/L)', limit: '0 - 10', isChecked: false },
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
