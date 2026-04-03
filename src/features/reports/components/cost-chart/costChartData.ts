export interface CostItem {
    label: string;
    percentage: number;
    value: number;
    color: string;
}

/** Fixed color per category name */
export const CATEGORY_COLORS: Record<string, string> = {
    'Thức ăn cho tôm': '#FD6900',
    'Tôm giống': '#22C55E',
    'Trị bệnh': '#006AFF',
    'Dinh dưỡng bổ sung': '#F59E0B',
    'Chất xử lý nước đầu vào': '#94A3B8',
};

export const DEFAULT_CATEGORY_COLOR = '#94A3B8';
