export interface GrowthDataPoint {
    date: string;
    dayAge: number;
    expected: number;
    actual: number | null;
}

export const CHART_HEIGHT = 380;
export const PADDING = { top: 30, right: 16, bottom: 40, left: 16 };
export const TABS = ['Sản lượng', 'Tỷ lệ sống', 'Trọng lượng con'];

// Mock data for Sản lượng (Production)
export const productionData: GrowthDataPoint[] = [
    { date: '2025-11-01', dayAge: 1, expected: 2.0, actual: 1.9 },
    { date: '2025-11-02', dayAge: 2, expected: 2.02, actual: 1.83 },
    { date: '2025-11-03', dayAge: 3, expected: 2.04, actual: 1.96 },
    { date: '2025-11-04', dayAge: 4, expected: 2.06, actual: 1.9 },
    { date: '2025-11-05', dayAge: 5, expected: 2.08, actual: 1.86 },
    { date: '2025-11-06', dayAge: 6, expected: 2.1, actual: 1.93 },
    { date: '2025-11-07', dayAge: 7, expected: 2.12, actual: 1.98 },
    { date: '2025-11-08', dayAge: 8, expected: 2.14, actual: 2.03 },
    { date: '2025-11-09', dayAge: 9, expected: 2.16, actual: 1.98 },
    { date: '2025-11-10', dayAge: 10, expected: 2.18, actual: 2.08 },
    { date: '2025-11-11', dayAge: 11, expected: 2.2, actual: 2.03 },
    { date: '2025-11-12', dayAge: 12, expected: 2.22, actual: 2.08 },
    { date: '2025-11-13', dayAge: 13, expected: 2.24, actual: 2 },
    { date: '2025-11-14', dayAge: 14, expected: 2.26, actual: 2.055 },
    { date: '2025-11-15', dayAge: 15, expected: 2.28, actual: 2.105 },
    { date: '2025-11-16', dayAge: 16, expected: 2.3, actual: 2.03 },
    { date: '2025-11-17', dayAge: 17, expected: 2.32, actual: 2.08 },
    { date: '2025-11-18', dayAge: 18, expected: 2.34, actual: 2.13 },
    { date: '2025-11-19', dayAge: 19, expected: 2.36, actual: 2.055 },
    { date: '2025-11-20', dayAge: 20, expected: 2.38, actual: 2.105 },
    { date: '2025-11-21', dayAge: 21, expected: 2.4, actual: 2.03 },
    { date: '2025-11-22', dayAge: 22, expected: 2.42, actual: 2.08 },
    { date: '2025-11-23', dayAge: 23, expected: 2.44, actual: 2.13 },
    { date: '2025-11-24', dayAge: 24, expected: 2.46, actual: 2.055 },
    { date: '2025-11-25', dayAge: 25, expected: 2.48, actual: 2.105 },
    { date: '2025-11-26', dayAge: 26, expected: 2.5, actual: 2.03 },
    { date: '2025-11-27', dayAge: 27, expected: 2.52, actual: 2.08 },
    { date: '2025-11-28', dayAge: 28, expected: 2.54, actual: 2.13 },
    { date: '2025-11-29', dayAge: 29, expected: 2.56, actual: 2.055 },
    { date: '2025-11-30', dayAge: 30, expected: 2.58, actual: 2.105 },
];

// Mock data for Tỷ lệ sống (Survival Rate)
export const survivalData: GrowthDataPoint[] = productionData.map(d => ({
    ...d,
    expected: 95 - d.dayAge * 0.2,
    actual: d.dayAge > 15 ? null : 94 - d.dayAge * 0.25,
}));

// Mock data for Trọng lượng con (Animal Weight)
export const weightData: GrowthDataPoint[] = productionData.map(d => ({
    ...d,
    expected: 0.5 + d.dayAge * 0.05,
    actual: d.dayAge > 20 ? null : 0.45 + d.dayAge * 0.055,
}));
