import { JobExecution, ShrimpInspectionMeta } from '@/features/farm/types/farm.types';
import { mapToApiPayload, mapFromApiResponse } from '@/features/farm/utils/shrimpHealthCheckMapper';
import { parseDate } from '@/features/farm/utils/dateUtils';
import type { ShrimpHealthCheckDto } from '@/features/farm/types/shrimpHealthCheck.types';

export interface ShrimpHealthFormState {
    date: Date;
    foodAmount: string;
    leftoverFood: string;
    intestine: string;
    intestineColor: string;
    stoolColor: string;
    liver: string;
    notes: string;
    images: string[];
    averageInfectionRate: number;
    isHealthy: boolean;
    diagnosisDetails: Array<{ diseaseType: string; probabilityPercent: number }> | null;
    aiItems: any[];
}

export interface ShrimpHealthDisplayResult {
    totalCount: number;
    infectionRate: number;
    status: string;
    items?: any[];
}

export const shrimpHealthService = {
    /**
     * Build initial form state from JobExecution + meta (including WorkLog meta fallback).
     */
    buildInitialFormState: (
        itemToEdit?: JobExecution,
        meta?: ShrimpInspectionMeta
    ): ShrimpHealthFormState => {
        const date: Date = (() => {
            if (!itemToEdit) return new Date();
            const d = itemToEdit.date ? parseDate(itemToEdit.date) : new Date();
            if (itemToEdit.date && itemToEdit.time) {
                const [hours, minutes] = itemToEdit.time.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    d.setHours(hours, minutes);
                }
            }
            return d;
        })();

        const baseState: ShrimpHealthFormState = {
            date,
            foodAmount: meta?.foodAmount || '',
            leftoverFood: meta?.leftoverFood || 'Hết',
            intestine: meta?.intestine || 'Đầy',
            intestineColor: meta?.intestineColor || 'Màu thức ăn',
            stoolColor: meta?.stoolColor || 'Màu thức ăn',
            liver: meta?.liver || 'Bình thường',
            notes: itemToEdit?.note || '',
            images: meta?.images || [],
            averageInfectionRate: meta?.averageInfectionRate ?? 0,
            isHealthy: meta?.isHealthy ?? true,
            diagnosisDetails: meta?.diagnosisDetails ?? null,
            aiItems: meta?.aiItems || [],
        };

        if (!meta || (meta as any).feedInTrapG === undefined) {
            return baseState;
        }

        const fromApi = mapFromApiResponse({
            value: (meta as any).feedInTrapG,
            healthCheck: meta as any,
            images: (meta as any).documents?.map((d: any) => d.publicUrl) || meta.images || [],
        });

        return {
            ...baseState,
            foodAmount: fromApi.foodAmount,
            leftoverFood: fromApi.leftoverFood,
            intestine: fromApi.intestine,
            intestineColor: fromApi.intestineColor,
            stoolColor: fromApi.stoolColor,
            liver: fromApi.liver,
            notes: fromApi.notes || itemToEdit?.note || '',
            averageInfectionRate: fromApi.averageInfectionRate ?? baseState.averageInfectionRate,
            isHealthy: fromApi.isHealthy ?? baseState.isHealthy,
            diagnosisDetails: fromApi.diagnosisDetails ?? baseState.diagnosisDetails,
            aiItems: fromApi.aiItems ?? baseState.aiItems,
        };
    },

    /**
     * Map form state to API payload for create / update.
     */
    mapFormToPayload: (input: { state: ShrimpHealthFormState; documentIds: string[] }) => {
        const { state, documentIds } = input;
        return mapToApiPayload({
            foodAmount: state.foodAmount,
            leftoverFood: state.leftoverFood,
            intestine: state.intestine,
            intestineColor: state.intestineColor,
            stoolColor: state.stoolColor,
            liver: state.liver,
            notes: state.notes,
            documentIds,
            averageInfectionRate: state.averageInfectionRate,
            isHealthy: state.isHealthy,
            aiItems: state.aiItems,
        });
    },

    /**
     * Parse AI health check details JSON string into aiItems + diagnosisDetails.
     */
    parseAiDetails: (
        details: string | null | undefined
    ): {
        aiItems: any[];
        diagnosisDetails: Array<{ diseaseType: string; probabilityPercent: number }> | null;
    } => {
        if (!details) {
            return { aiItems: [], diagnosisDetails: null };
        }

        try {
            const parsedItems = JSON.parse(details);
            if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
                return { aiItems: [], diagnosisDetails: null };
            }

            const total = parsedItems.length;
            const diagnosisCounts: Record<string, number> = {};

            parsedItems.forEach((item: any) => {
                const diagnosis = item.diagnosis || 'Khỏe mạnh';
                diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
            });

            const diagnosisToEnumMap: Record<string, string> = {
                'Khỏe mạnh': 'Healthy',
                'Đốm trắng': 'WSSV',
                'Mang đen': 'BlackGill',
                'Đầu vàng': 'Yellowhead',
            };

            const calculatedDetails = Object.entries(diagnosisCounts)
                .map(([diagnosis, count]) => {
                    const percentage = parseFloat(((count / total) * 100).toFixed(2));
                    const diseaseType = diagnosisToEnumMap[diagnosis];
                    if (!diseaseType) return null;
                    return { diseaseType, probabilityPercent: percentage };
                })
                .filter(Boolean) as Array<{
                diseaseType: string;
                probabilityPercent: number;
            }>;

            return {
                aiItems: parsedItems,
                diagnosisDetails: calculatedDetails.length > 0 ? calculatedDetails : null,
            };
        } catch {
            return { aiItems: [], diagnosisDetails: null };
        }
    },

    /**
     * Build display result for AI health check summary (status string + items).
     */
    buildDisplayResult: (input: {
        averageInfectionRate: number;
        isHealthy: boolean;
        diagnosisDetails: Array<{ diseaseType: string; probabilityPercent: number }> | null;
        aiItems: any[];
        aiTotalCount: number;
    }): ShrimpHealthDisplayResult | null => {
        const { averageInfectionRate, isHealthy, diagnosisDetails, aiItems, aiTotalCount } = input;

        if (!diagnosisDetails && averageInfectionRate <= 0 && isHealthy) {
            return null;
        }

        let statusString: string;

        if (Array.isArray(diagnosisDetails) && diagnosisDetails.length > 0) {
            const diseaseTypeToVietnamese: Record<string, string> = {
                Healthy: 'Khỏe mạnh',
                WSSV: 'Đốm trắng',
                BlackGill: 'Mang đen',
                Yellowhead: 'Đầu vàng',
            };

            const diseases = diagnosisDetails
                .filter(d => d.diseaseType !== 'Healthy')
                .map(d => diseaseTypeToVietnamese[d.diseaseType] || d.diseaseType);

            statusString = diseases.length > 0 ? diseases.join(', ') : 'Khỏe mạnh';
        } else {
            statusString = isHealthy ? 'Khỏe mạnh' : 'Nhiễm bệnh';
        }

        return {
            totalCount: aiTotalCount,
            infectionRate: averageInfectionRate,
            status: statusString,
            items: aiItems.length > 0 ? aiItems : undefined,
        };
    },

    /**
     * Build initial form state from ShrimpHealthCheckDto detail response.
     */
    buildFormStateFromDetail: (detail: ShrimpHealthCheckDto): ShrimpHealthFormState => {
        const images =
            detail.documents?.map(doc => doc.publicUrl).filter((url): url is string => !!url) || [];

        const mapped = mapFromApiResponse({
            value: detail.value,
            healthCheck: detail.healthCheck,
            images,
            documentIds: detail.documents?.map(doc => doc.id),
        });

        const createdDate = detail.createdAt ? new Date(detail.createdAt) : new Date();

        return {
            date: createdDate,
            foodAmount: mapped.foodAmount,
            leftoverFood: mapped.leftoverFood,
            intestine: mapped.intestine,
            intestineColor: mapped.intestineColor,
            stoolColor: mapped.stoolColor,
            liver: mapped.liver,
            notes: mapped.notes,
            images: mapped.images || [],
            averageInfectionRate: mapped.averageInfectionRate ?? 0,
            isHealthy: mapped.isHealthy ?? true,
            diagnosisDetails: mapped.diagnosisDetails ?? null,
            aiItems: mapped.aiItems || [],
        };
    },
};
