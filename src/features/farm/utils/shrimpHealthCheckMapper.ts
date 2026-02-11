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
    // AI fields
    averageInfectionRate?: number;
    isHealthy?: boolean;
    aiItems?: any[]; // Array of shrimp items from AI
}): CreateShrimpHealthCheckPayload => {
    const feedInTrapG = parseFloat(uiState.foodAmount) || 0;

    // Calculate diagnosisDetails from AI items
    // Backend enum: Healthy, WSSV, BlackGill, Yellowhead
    let diagnosisDetails: Array<{ diseaseType: string; probabilityPercent: number }>;
    let calculatedInfectionRate = 0;
    let calculatedIsHealthy = true;

    if (uiState.aiItems && uiState.aiItems.length > 0) {
        const total = uiState.aiItems.length;

        // Count occurrences of each diagnosis
        const diagnosisCounts: Record<string, number> = {};
        uiState.aiItems.forEach((item: any) => {
            const diagnosis = item.diagnosis || 'Khỏe mạnh';
            diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
        });

        // Count sick shrimp
        const sickCount = uiState.aiItems.filter((item: any) => {
            const diagnosis = item.diagnosis || 'Khỏe mạnh';
            return diagnosis !== 'Khỏe mạnh';
        }).length;

        calculatedInfectionRate = parseFloat(((sickCount / total) * 100).toFixed(2));
        calculatedIsHealthy = sickCount === 0;

        // Map Vietnamese diagnosis to backend enum: Healthy, WSSV, BlackGill, Yellowhead
        const diagnosisToEnumMap: Record<string, string> = {
            'Khỏe mạnh': 'Healthy',
            'Đốm trắng': 'WSSV', // White Spot Syndrome Virus
            'Mang đen': 'BlackGill',
            'Đầu vàng': 'Yellowhead',
        };

        // Convert counts to percentages
        diagnosisDetails = Object.entries(diagnosisCounts)
            .map(([diagnosis, count]) => {
                const percentage = parseFloat(((count / total) * 100).toFixed(2));
                const diseaseType = diagnosisToEnumMap[diagnosis];

                if (!diseaseType) {
                    console.warn(`Unknown diagnosis: ${diagnosis}`);
                    return null;
                }

                return { diseaseType, probabilityPercent: percentage };
            })
            .filter(Boolean) as Array<{ diseaseType: string; probabilityPercent: number }>;

        // Sort by percentage descending
        diagnosisDetails.sort((a, b) => b.probabilityPercent - a.probabilityPercent);
    } else {
        // Default: Healthy if no AI data
        diagnosisDetails = [
            {
                diseaseType: 'Healthy',
                probabilityPercent: 100,
            },
        ];
    }

    const healthCheck: any = {
        feedInTrapG,
        leftoverFeedPercent: leftoverFoodMap[uiState.leftoverFood] || 'None',
        gutCondition: intestineMap[uiState.intestine] || 'Full',
        gutColor: gutColorMap[uiState.intestineColor] || 'FeedColor',
        fecesColor: fecesColorMap[uiState.stoolColor] || 'FeedColor',
        liverCondition: liverMap[uiState.liver] || 'Normal',
        notes: uiState.notes || '',
        // AI Mapping - use calculated values or fallback to provided values
        averageInfectionRate:
            uiState.aiItems && uiState.aiItems.length > 0
                ? calculatedInfectionRate
                : uiState.averageInfectionRate ?? 0,
        isHealthy:
            uiState.aiItems && uiState.aiItems.length > 0
                ? calculatedIsHealthy
                : uiState.isHealthy ?? true,
        diagnosisDetails: diagnosisDetails,
    };

    const payload = {
        value: feedInTrapG,
        documentIds: uiState.documentIds || [],
        healthCheck: healthCheck,
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
        leftoverFeedPercent?: string; // API string enum
        gutCondition?: string;
        gutColor?: string;
        fecesColor?: string;
        liverCondition?: string;
        notes?: string;
        // AI fields from API
        averageInfectionRate?: number;
        isHealthy?: boolean;
        diagnosisDetails?: Array<{
            diseaseType: string;
            probabilityPercent: number;
        }>;
    };
    images?: string[]; // resolved image URLs
    documentIds?: string[];
}) => {
    const healthCheck = apiData.healthCheck;

    return {
        foodAmount: String(healthCheck?.feedInTrapG ?? apiData.value ?? 0),
        leftoverFood: healthCheck?.leftoverFeedPercent
            ? // @ts-ignore
              leftoverFoodReverseMap[healthCheck.leftoverFeedPercent] || 'Hết'
            : 'Hết',
        intestine: healthCheck?.gutCondition
            ? // @ts-ignore
              intestineReverseMap[healthCheck.gutCondition] || 'Đầy'
            : 'Đầy',
        intestineColor: healthCheck?.gutColor
            ? // @ts-ignore
              gutColorReverseMap[healthCheck.gutColor] || 'Màu thức ăn'
            : 'Màu thức ăn',
        stoolColor: healthCheck?.fecesColor
            ? // @ts-ignore
              fecesColorReverseMap[healthCheck.fecesColor] || 'Màu thức ăn'
            : 'Màu thức ăn',
        liver: healthCheck?.liverCondition
            ? // @ts-ignore
              liverReverseMap[healthCheck.liverCondition] || 'Bình thường'
            : 'Bình thường',
        notes: healthCheck?.notes || '',
        images: apiData.images || [],
        documentIds: apiData.documentIds || [],
        // AI Mapping - convert backend enum back to Vietnamese for display
        averageInfectionRate: healthCheck?.averageInfectionRate ?? 0,
        isHealthy: healthCheck?.isHealthy ?? true,
        diagnosisDetails: healthCheck?.diagnosisDetails || [],
        // Reconstruct aiItems from diagnosisDetails for display in modal
        aiItems:
            healthCheck?.diagnosisDetails && healthCheck.diagnosisDetails.length > 0
                ? reconstructAiItemsFromDiagnosis(healthCheck.diagnosisDetails)
                : [],
    };
};

/**
 * Reconstruct aiItems from diagnosisDetails for display purposes
 * Backend only stores aggregated percentages, we recreate individual items for UI
 */
const reconstructAiItemsFromDiagnosis = (
    diagnosisDetails: Array<{ diseaseType: string; probabilityPercent: number }>
): any[] => {
    // Reverse map: Backend enum to Vietnamese
    const enumToVietnameseMap: Record<string, string> = {
        Healthy: 'Khỏe mạnh',
        WSSV: 'Đốm trắng',
        BlackGill: 'Mang đen',
        Yellowhead: 'Đầu vàng',
    };

    // Create mock items based on percentages
    // Assume 100 total items for easy percentage calculation
    const totalItems = 100;
    const items: any[] = [];
    let currentIndex = 0;

    diagnosisDetails.forEach(detail => {
        const count = Math.round((detail.probabilityPercent / 100) * totalItems);
        const diagnosis = enumToVietnameseMap[detail.diseaseType] || detail.diseaseType;
        const status = detail.diseaseType === 'Healthy' ? 'HEALTHY' : 'CRITICAL';

        for (let i = 0; i < count; i++) {
            items.push({
                id: `reconstructed-${currentIndex}`,
                index: currentIndex + 1,
                status,
                diagnosis,
                confidence: detail.probabilityPercent,
            });
            currentIndex++;
        }
    });

    return items;
};
