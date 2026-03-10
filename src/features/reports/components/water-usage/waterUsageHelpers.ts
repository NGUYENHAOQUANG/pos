import dayjs from 'dayjs';
import { WaterUsageResponse } from '../../types/water-usage';

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
            cumulativeData: [],
            yMax: 0,
            yTicks: [0, 1000, 2000, 3000, 4000],
            xLabels: [],
        };
    }

    const { kpi, days } = statsData.data;

    // Map API data to cumulative sum
    let cumulative = 0;
    const cumulativeData = days.map(day => {
        cumulative += day.totalWaterAdded;
        return {
            date: dayjs(day.date).format('DD/MM/YYYY'),
            value: cumulative,
        };
    });

    // Safe max value
    const lastValue =
        cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1].value : 0;
    const maxCumulative = Math.max(lastValue, kpi?.totalWaterAdded || 0);

    // Calculate nice Y interval
    const yMaxEstimation = Math.ceil(maxCumulative * 1.1) || 1000;

    let power = Math.pow(10, Math.floor(Math.log10(yMaxEstimation)));
    if (power < 1) power = 1;

    let tickInterval = Math.ceil(yMaxEstimation / 4 / power) * power;
    if (tickInterval === 0) tickInterval = 1000;

    const Y_TICKS = [0, tickInterval, tickInterval * 2, tickInterval * 3, tickInterval * 4];
    const Y_MAX_ADJUSTED = Y_TICKS[Y_TICKS.length - 1];

    // Distributed X labels (upto 5 dates)
    const xLabels: string[] = [];
    if (cumulativeData.length > 0) {
        const count = cumulativeData.length;
        const step = Math.max(1, Math.floor(count / 4));
        for (let i = 0; i < count; i += step) {
            if (xLabels.length < 4) {
                xLabels.push(cumulativeData[i].date);
            }
        }
        if (xLabels.length < 5 && count > 1) {
            const lastDate = cumulativeData[count - 1].date;
            if (!xLabels.includes(lastDate)) {
                xLabels.push(lastDate);
            }
        }
    }

    return {
        totalWaterSupplied: kpi?.totalWaterAdded || 0,
        cumulativeData,
        yMax: Y_MAX_ADJUSTED,
        yTicks: Y_TICKS,
        xLabels,
    };
};
