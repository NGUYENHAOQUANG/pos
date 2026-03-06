import { colors } from '@/styles/colors';

export interface CostItem {
    label: string;
    percentage: number;
    value: number;
    color: string;
}

export const COST_DATA: CostItem[] = [
    { label: 'Thức ăn', percentage: 46.0, value: 1030400000, color: colors.red[600] },
    { label: 'Tôm giống', percentage: 18.0, value: 403200000, color: colors.success },
    { label: 'Chất xử lý', percentage: 12.0, value: 268800000, color: colors.green[800] },
    { label: 'Trị bệnh', percentage: 8.0, value: 179200000, color: colors.orange[600] },
    { label: 'Chế phẩm ', percentage: 7.0, value: 156800000, color: colors.orange[200] },
    { label: 'Chất cải thiện ao', percentage: 5.0, value: 112000000, color: colors.blue[700] },
    { label: 'Khoáng chất', percentage: 3.0, value: 67200000, color: colors.blue[400] },
    { label: 'Dinh dưỡng', percentage: 1.0, value: 22400000, color: colors.blue[50] },
];
