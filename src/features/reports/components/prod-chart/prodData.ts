import { colors } from '@/styles';

export interface ProdDataPoint {
    pondName: string;
    collected: number;
    remaining: number;
    colorCollected?: string;
    colorRemaining?: string;
}

export const prodChartData: ProdDataPoint[] = [
    { pondName: 'Pond B5N3', collected: 0, remaining: 3.02, colorRemaining: colors.blue[400] }, // Light blue
    { pondName: 'Pong B5N4', collected: 0, remaining: 3.73, colorRemaining: colors.blue[600] }, // Blue
    { pondName: 'Pond B5NN5', collected: 1.46, remaining: 0, colorCollected: colors.orange[500] }, // Orange
    {
        pondName: 'Pond BB5N6',
        collected: 1.03,
        remaining: 0.65,
        colorCollected: colors.orange[500],
        colorRemaining: colors.blue[800],
    }, // Orange & Dark blue
];

export const prodChartSummary = [
    { label: 'Còn lại', value: '23.93 tấn' },
    { label: 'Đã thu', value: '4.86 tấn' },
];
