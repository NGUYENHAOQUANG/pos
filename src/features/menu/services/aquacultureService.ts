import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import {
    AquacultureFormValues,
    AQUACULTURE_STATUS,
    AquacultureFormStatus,
} from '@/features/menu/schemas/aquacultureFormSchema';

// Payload type for create/update API calls
export interface SeasonPayload {
    seasonName: string;
    startDate?: string;
    endDate?: string;
    status?: SeasonStatus;
    notes?: string;
}

export const aquacultureService = {
    /**
     * Map SeasonData from API detail to form values
     */
    mapDetailToForm: (detail: SeasonData): AquacultureFormValues => {
        return {
            zoneId: detail.zoneId?.toString() ?? '',
            zoneName: '',
            name: detail.seasonName || detail.name || '',
            code: detail.code || detail.seasonCode || '',
            startDate: new Date(detail.startDate),
            endDate: detail.endDate ? new Date(detail.endDate) : null,
            status: aquacultureService.mapApiStatusToForm(detail.status),
            note: detail.notes ?? '',
        };
    },

    /**
     * Map form values to API payload for create/update
     */
    mapFormToPayload: (formData: AquacultureFormValues): SeasonPayload => {
        return {
            seasonName: formData.name.trim(),
            startDate: formData.startDate.toISOString(),
            endDate: formData.endDate ? formData.endDate.toISOString() : undefined,
            status: aquacultureService.mapFormStatusToApi(formData.status),
            notes: formData.note || undefined,
        };
    },

    /**
     * Map API SeasonStatus enum to form status string
     */
    mapApiStatusToForm: (status: SeasonStatus): AquacultureFormStatus => {
        switch (status) {
            case SeasonStatus.Active:
                return AQUACULTURE_STATUS.ACTIVE;
            case SeasonStatus.Closed:
                return AQUACULTURE_STATUS.ENDED;
            case SeasonStatus.Preparation:
            default:
                return AQUACULTURE_STATUS.PREPARING;
        }
    },

    /**
     * Map form status string to API SeasonStatus enum
     */
    mapFormStatusToApi: (status: AquacultureFormStatus): SeasonStatus => {
        switch (status) {
            case AQUACULTURE_STATUS.ACTIVE:
                return SeasonStatus.Active;
            case AQUACULTURE_STATUS.ENDED:
                return SeasonStatus.Closed;
            case AQUACULTURE_STATUS.PREPARING:
            default:
                return SeasonStatus.Preparation;
        }
    },
};
