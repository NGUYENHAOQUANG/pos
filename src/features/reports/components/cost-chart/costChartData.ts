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
    'Chất xử lý nước đầu vào': '#94A3B8',
    'Trị bệnh': '#006AFF',
    'Chế phẩm sinh học': '#8B5CF6',
    'Chất cải thiện nước ao nuôi': '#06B6D4',
    'Khoáng chất': '#F43F5E',
    'Dinh dưỡng bổ sung': '#F59E0B',
};

export const DEFAULT_CATEGORY_COLOR = '#94A3B8';
