import { mapToApiPayload, mapFromApiResponse } from '@/features/farm/utils/shrimpHealthCheckMapper';
import type { ShrimpHealthCheckDto } from '@/features/farm/types/shrimpHealthCheck.types';

import {
    LeftoverFoodEnum,
    IntestineStatusEnum,
    IntestineColorEnum,
    StoolColorEnum,
    LiverStatusEnum,
} from '@/features/farm/schemas/shrimpInspectionSchema';

export interface ShrimpHealthFormState {
    date: Date;
    foodAmount: string;
    leftoverFood: LeftoverFoodEnum;
    intestine: IntestineStatusEnum;
    intestineColor: IntestineColorEnum;
    stoolColor: StoolColorEnum;
    liver: LiverStatusEnum;
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
    createDefaultFormValues: (): ShrimpHealthFormState => ({
        date: new Date(),
        foodAmount: '',
        leftoverFood: LeftoverFoodEnum.NONE,
        intestine: IntestineStatusEnum.FULL,
        intestineColor: IntestineColorEnum.FOOD_COLOR,
        stoolColor: StoolColorEnum.FOOD_COLOR,
        liver: LiverStatusEnum.NORMAL,
        notes: '',
        images: [],
        averageInfectionRate: 0,
        isHealthy: true,
        diagnosisDetails: null,
        aiItems: [],
    }),

    createSnapshot: (data: ShrimpHealthFormState): string =>
        JSON.stringify({
            foodAmount: data.foodAmount || '',
            leftoverFood: data.leftoverFood,
            intestine: data.intestine,
            intestineColor: data.intestineColor,
            stoolColor: data.stoolColor,
            liver: data.liver,
            notes: data.notes || '',
            images: (data.images || []).length,
            averageInfectionRate: data.averageInfectionRate || 0,
            isHealthy: data.isHealthy,
            diagnosisCount: (data.diagnosisDetails || []).length,
            aiItemsCount: (data.aiItems || []).length,
        }),

    hasChanges: (current: ShrimpHealthFormState, initialSnapshot: string | null): boolean => {
        if (!initialSnapshot) {
            return !!(
                (current.foodAmount || '').length > 0 ||
                current.leftoverFood !== LeftoverFoodEnum.NONE ||
                current.intestine !== IntestineStatusEnum.FULL ||
                current.intestineColor !== IntestineColorEnum.FOOD_COLOR ||
                current.stoolColor !== StoolColorEnum.FOOD_COLOR ||
                current.liver !== LiverStatusEnum.NORMAL ||
                (current.notes || '').length > 0 ||
                (current.images || []).length > 0 ||
                (current.averageInfectionRate || 0) > 0 ||
                !current.isHealthy ||
                (current.aiItems || []).length > 0
            );
        }
        return shrimpHealthService.createSnapshot(current) !== initialSnapshot;
    },

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
            leftoverFood: mapped.leftoverFood as LeftoverFoodEnum,
            intestine: mapped.intestine as IntestineStatusEnum,
            intestineColor: mapped.intestineColor as IntestineColorEnum,
            stoolColor: mapped.stoolColor as StoolColorEnum,
            liver: mapped.liver as LiverStatusEnum,
            notes: mapped.notes,
            images: mapped.images || [],
            averageInfectionRate: mapped.averageInfectionRate ?? 0,
            isHealthy: mapped.isHealthy ?? true,
            diagnosisDetails: mapped.diagnosisDetails ?? null,
            aiItems: mapped.aiItems || [],
        };
    },
};
