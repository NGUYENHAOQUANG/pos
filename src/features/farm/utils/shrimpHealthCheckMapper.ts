/**
 * Mapper functions to convert between UI state and API payload for Shrimp Health Check
 */

import type {
    CreateShrimpHealthCheckPayload,
    LeftoverFeedEnum,
    GutConditionEnum,
    GutColorEnum,
    FecesColorEnum,
    LiverConditionEnum,
} from '@/features/farm/types/shrimpHealthCheck.types';

// UI labels to API enum mapping
// ---------- UI → API ----------

// Thức ăn thừa
const leftoverFoodMap: Record<string, LeftoverFeedEnum> = {
    Hết: 'None',
    'Còn 5–10%': 'From5To10',
    'Còn 10–15%': 'From10To15',
    'Còn 15–20%': 'From15To20',
};

// Đường ruột
const intestineMap: Record<string, GutConditionEnum> = {
    Rỗng: 'Empty',
    Đầy: 'Full',
};

// Màu đường ruột
const gutColorMap: Record<string, GutColorEnum> = {
    'Màu thức ăn': 'FeedColor',
    'Màu đen': 'Black',
    Đen: 'Black',
    'Bất thường': 'Abnormal',
};

// Màu phân
const fecesColorMap: Record<string, FecesColorEnum> = {
    'Màu thức ăn': 'FeedColor',
    'Bất thường': 'Abnormal',
};

// Gan
const liverMap: Record<string, LiverConditionEnum> = {
    'Bình thường': 'Normal',
    'Bất thường': 'Abnormal',
};

// ---------- API → UI ----------

const leftoverFoodReverseMap: Record<LeftoverFeedEnum, string> = {
    None: 'Hết',
    From5To10: 'Còn 5–10%',
    From10To15: 'Còn 10–15%',
    From15To20: 'Còn 15–20%',
};

const intestineReverseMap: Record<GutConditionEnum, string> = {
    Empty: 'Rỗng',
    Full: 'Đầy',
};

const gutColorReverseMap: Record<GutColorEnum, string> = {
    FeedColor: 'Màu thức ăn',
    Black: 'Màu đen',
    Abnormal: 'Bất thường',
};

const fecesColorReverseMap: Record<FecesColorEnum, string> = {
    FeedColor: 'Màu thức ăn',
    Abnormal: 'Bất thường',
};

const liverReverseMap: Record<LiverConditionEnum, string> = {
    Normal: 'Bình thường',
    Abnormal: 'Bất thường',
};

/**
 * Convert UI state to API payload
 */
export const mapToApiPayload = (uiState: {
    foodAmount: string;
    leftoverFood: string;
    intestine: string;
    intestineColor: string;
    stoolColor: string;
    liver: string;
    notes: string;
    documentIds: string[];
}): CreateShrimpHealthCheckPayload => {
    const feedInTrapG = parseFloat(uiState.foodAmount) || 0;

    const payload = {
        value: feedInTrapG,
        documentIds: uiState.documentIds.length > 0 ? uiState.documentIds : undefined,
        healthCheck: {
            feedInTrapG,
            leftoverFeedPercent: leftoverFoodMap[uiState.leftoverFood] || 'None',
            gutCondition: intestineMap[uiState.intestine] || 'Full',
            gutColor: gutColorMap[uiState.intestineColor] || 'FeedColor',
            fecesColor: fecesColorMap[uiState.stoolColor] || 'FeedColor',
            liverCondition: liverMap[uiState.liver] || 'Normal',
            notes: uiState.notes || undefined,
        },
    };
    return payload;
};

/**
 * Convert API response to UI state (for populating edit form / meta)
 */
export const mapFromApiResponse = (apiData: {
    value: number;
    healthCheck?: {
        feedInTrapG: number;
        leftoverFeedPercent?: LeftoverFeedEnum;
        gutCondition?: GutConditionEnum;
        gutColor?: GutColorEnum;
        fecesColor?: FecesColorEnum;
        liverCondition?: LiverConditionEnum;
        notes?: string;
    };
    images?: string[]; // resolved image URLs
}) => {
    const healthCheck = apiData.healthCheck;

    return {
        foodAmount: String(healthCheck?.feedInTrapG ?? apiData.value ?? 0),
        leftoverFood: healthCheck?.leftoverFeedPercent
            ? leftoverFoodReverseMap[healthCheck.leftoverFeedPercent]
            : 'Hết',
        intestine: healthCheck?.gutCondition
            ? intestineReverseMap[healthCheck.gutCondition]
            : 'Đầy',
        intestineColor: healthCheck?.gutColor
            ? gutColorReverseMap[healthCheck.gutColor]
            : 'Màu thức ăn',
        stoolColor: healthCheck?.fecesColor
            ? fecesColorReverseMap[healthCheck.fecesColor]
            : 'Màu thức ăn',
        liver: healthCheck?.liverCondition
            ? liverReverseMap[healthCheck.liverCondition]
            : 'Bình thường',
        notes: healthCheck?.notes || '',
        images: apiData.images || [],
    };
};
