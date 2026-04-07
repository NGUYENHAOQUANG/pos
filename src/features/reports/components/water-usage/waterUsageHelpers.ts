import dayjs from 'dayjs';
import { WaterUsageResponse } from '../../types/water-usage';
import { DailyBar } from '@/features/reports/types/water-usage';
export type { DailyBar };

export const scaleLinear = (value: number, domain: [number, number], range: [number, number]) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    if (d1 === d0) return r0;
    return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
};

export const formatNumberVietnamese = (value: number, abbreviate: boolean = true): string => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    if (abbreviate && value >= 1e9) {
        const inBillions = value / 1e9;
        let str = inBillions.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
        str = str.replace(/,/g, 'T').replace(/\./g, ',').replace(/T/g, '.');
        return `${str} tỷ`;
    }
    let normalStr = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    normalStr = normalStr.replace(/,/g, 'T').replace(/\./g, ',').replace(/T/g, '.');
    return normalStr;
};

export const parseWaterUsageData = (statsData?: WaterUsageResponse) => {
    if (!statsData?.data) {
        return {
            totalWaterSupplied: 0,
            bars: [] as DailyBar[],
            yMax: 0,
            yTicks: [0, 1000, 2000, 3000, 4000],
        };
    }

    const { kpi, days } = statsData.data;

    // One bar per day using totalWaterAdded directly
    const bars: DailyBar[] = [];
    let maxDayTotal = 0;

    days.forEach((day, dayIndex) => {
        const dateLabel = dayjs(day.date).format('DD/MM/YYYY');
        bars.push({
            dateLabel,
            value: day.totalWaterAdded,
            dayIndex,
        });

        if (day.totalWaterAdded > maxDayTotal) {
            maxDayTotal = day.totalWaterAdded;
        }
    });

    // Calculate nice Y ticks based on max daily total
    if (maxDayTotal <= 0) maxDayTotal = 1000;

    const magnitude = Math.pow(10, Math.floor(Math.log10(maxDayTotal)));
    const niceMax = Math.ceil(maxDayTotal / magnitude) * magnitude;
    const finalMax =
        niceMax > maxDayTotal * 1.5
            ? Math.ceil(maxDayTotal / (magnitude / 2)) * (magnitude / 2)
            : niceMax;

    const TICK_COUNT = 4;
    const rawInterval = finalMax / TICK_COUNT;
    const intervalMag = Math.pow(10, Math.floor(Math.log10(rawInterval || 1)));
    const tickInterval = Math.ceil(rawInterval / intervalMag) * intervalMag;

    const yTicks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => tickInterval * i);
    const yMax = yTicks[yTicks.length - 1];

    return {
        totalWaterSupplied: kpi?.totalWaterAdded || 0,
        bars,
        yMax,
        yTicks,
    };
};
