import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ParameterSetting } from '@/features/farm/api/environmentApi';
import { Metric } from '@/features/farm/types/metric.types';
import { EnvironmentSettingInfo } from '@/features/farm/store/environmentSettingStore';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { Zone } from '@/features/farm/types/farm.types';

export const environmentSettingService = {
    mapMetricToUI: (
        metric: Metric,
        settings: ParameterSetting[],
        pendingChanges: Record<string, EnvironmentSettingInfo>
    ): EnvironmentParameter => {
        const pending = pendingChanges[metric.id];
        let min: number, max: number, isChecked: boolean;

        if (pending) {
            min = pending.data.minValue;
            max = pending.data.maxValue;
            isChecked = pending.data.isActive;
        } else {
            const setting = settings.find(s => s.metricId === metric.id);
            min = setting?.minValue ?? 0;
            max = setting?.maxValue ?? 0;
            isChecked = setting?.isActive ?? false;
        }

        return {
            id: metric.id,
            name: metric.name,
            unit: metric.unitMetric,
            min: min.toString(),
            max: max.toString(),
            limit: `${min} - ${max}`,
            isChecked,
            alertEnabled: true,
        };
    },

    mapZonesToDropdown: (zones: Zone[]): DropDownItem[] => {
        return zones.map(z => ({
            id: String(z.id),
            label: z.name,
        }));
    },
};
