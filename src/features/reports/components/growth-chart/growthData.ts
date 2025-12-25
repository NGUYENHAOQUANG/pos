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
    { date: '2025-11-03', dayAge: 1, expected: 1544400, actual: 1544400 - 10000 },
    { date: '2025-11-04', dayAge: 2, expected: 1542500, actual: 1542500 - 12000 },
    { date: '2025-11-05', dayAge: 3, expected: 1540600, actual: 1540600 - 14000 },
    { date: '2025-11-06', dayAge: 4, expected: 1538700, actual: 1538700 - 16000 },
    { date: '2025-11-07', dayAge: 5, expected: 1536800, actual: 1536800 - 18000 },
    { date: '2025-11-08', dayAge: 6, expected: 1534900, actual: 1534900 - 20000 },
    { date: '2025-11-09', dayAge: 7, expected: 1533000, actual: 1533000 - 22000 },
    { date: '2025-11-10', dayAge: 8, expected: 1531100, actual: 1531100 - 24000 },
    { date: '2025-11-11', dayAge: 9, expected: 1529200, actual: 1529200 - 26000 },
    { date: '2025-11-12', dayAge: 10, expected: 1527300, actual: 1527300 - 28000 },
    { date: '2025-11-13', dayAge: 11, expected: 1525400, actual: 1525400 - 30000 },
    { date: '2025-11-14', dayAge: 12, expected: 1523500, actual: 1523500 - 32000 },
    { date: '2025-11-15', dayAge: 13, expected: 1521600, actual: 1521600 - 34000 },
    { date: '2025-11-16', dayAge: 14, expected: 1519700, actual: 1519700 - 36000 },
    { date: '2025-11-17', dayAge: 15, expected: 1517800, actual: 1517800 - 38000 },
    { date: '2025-11-18', dayAge: 16, expected: 1515900, actual: null },
    { date: '2025-11-19', dayAge: 17, expected: 1514000, actual: null },
    { date: '2025-11-20', dayAge: 18, expected: 1512100, actual: null },
    { date: '2025-11-21', dayAge: 19, expected: 1510200, actual: null },
    { date: '2025-11-22', dayAge: 20, expected: 1508300, actual: null },
    { date: '2025-11-23', dayAge: 21, expected: 1506400, actual: null },
    { date: '2025-11-24', dayAge: 22, expected: 1504500, actual: null },
    { date: '2025-11-25', dayAge: 23, expected: 1502600, actual: null },
    { date: '2025-11-26', dayAge: 24, expected: 1500700, actual: null },
    { date: '2025-11-27', dayAge: 25, expected: 1498800, actual: null },
    { date: '2025-11-28', dayAge: 26, expected: 1496900, actual: null },
    { date: '2025-11-29', dayAge: 27, expected: 1495000, actual: null },
    { date: '2025-11-30', dayAge: 28, expected: 1493100, actual: null },
    { date: '2025-12-01', dayAge: 29, expected: 1491200, actual: null },
];

// Mock data for Tỷ lệ sống (Survival Rate)
export const survivalData: GrowthDataPoint[] = productionData.map((d, i) => ({
    ...d,
    expected: 100 - i * 0.1,
    actual: i < 15 ? 100 - i * 0.12 : null,
}));

// Mock data for Trọng lượng con (Animal Weight)
export const weightData: GrowthDataPoint[] = productionData.map((d, i) => ({
    ...d,
    expected: 10 + i * 1.5,
    actual: i < 15 ? 9.5 + i * 1.6 : null,
}));
