export interface ProdDataPoint {
    pondName: string;
    collected: number;
    remaining: number;
    ageGroup: string;
    colorCollected?: string;
    colorRemaining?: string;
}

export const prodChartData: ProdDataPoint[] = [
    { pondName: 'Pond B5N3', ageGroup: '60-70', collected: 0, remaining: 3.02 },
    { pondName: 'Pong B5N4', ageGroup: '70-80', collected: 0, remaining: 3.73 },
    { pondName: 'Pond B5NN5', ageGroup: '>80', collected: 1.46, remaining: 0 },
    { pondName: 'Pond BB5N6', ageGroup: '>80', collected: 1.03, remaining: 0.65 },
];

export const prodChartSummary = [
    { label: 'Còn lại', value: '23,93 tấn' },
    { label: 'Đã thu', value: '4,86 tấn' },
];
