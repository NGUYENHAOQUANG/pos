import { Dimensions } from 'react-native';
import { spacing } from '@/styles';

// Chart dimensions
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
export const CHART_HEIGHT = 280;

// Chart configuration
export const DAY_MARKS = [0, 11, 22, 33, 44, 55, 66, 77, 88, 99, 110];
export const TOTAL_DAYS = 110;
export const START_DATE = new Date(2025, 8, 7); // Month is 0-indexed (8 = September)
export const DIVIDER_DAY = 77; // Divider position: predicts 4 columns (day 77)

// Chart padding
export const PADDING_LEFT = 40;
export const PADDING_RIGHT = 20;
export const PADDING_TOP = 30;
export const PADDING_BOTTOM = 40;

// Date helper
export const getDateForDay = (day: number): string => {
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + day);

    const dayStr = String(date.getDate()).padStart(2, '0');
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    const yearStr = String(date.getFullYear());

    return `${dayStr}/${monthStr}/${yearStr}`;
};

// Day labels
export const DAY_LABELS = DAY_MARKS.map(day => getDateForDay(day));

// Orange line: stops at divider (historical data)
export const ORANGE_DATA_HISTORICAL = (() => {
    const data = [];
    let currentValue = 0.02; // Starting value

    for (let day = 0; day <= 110; day++) {
        data.push({ day, value: Math.round(currentValue * 100) / 100 });

        if (day < 110) {
            // Increase 1-20% randomly compared to previous day
            const increaseRate = 0.01 + Math.random() * 0.19; // 1% to 20%
            currentValue = currentValue * (1 + increaseRate);
        }
    }

    return data;
})();

// Blue line: crosses divider (historical + forecast)
export const BLUE_DATA_HISTORICAL = Array.from({ length: 78 }, (_, i) => {
    const day = i;
    const progress = day / 77;

    // Start from low value, gradually increase with fluctuations
    const startValue = 6; // Low value at start
    const midValue = 16; // Mid value
    const endValue = 14; // Value at end of historical (after peaks/valleys)

    // Create base increasing curve
    let baseValue;
    if (progress < 0.4) {
        // First part: slight increase
        baseValue = startValue + (midValue - startValue) * (progress / 0.4);
    } else {
        // Later part: with fluctuations
        baseValue = midValue - (midValue - endValue) * ((progress - 0.4) / 0.6);
    }

    // Add specific peaks and valleys
    let fluctuation = 0;

    // Peak 1: around 30-40% progress
    if (progress >= 0.25 && progress <= 0.4) {
        const peakProgress = (progress - 0.25) / 0.15;
        fluctuation = Math.sin(peakProgress * Math.PI) * 3; // High peak
    }

    // Valley after peak 1: around 40-50%
    if (progress >= 0.4 && progress <= 0.5) {
        const valleyProgress = (progress - 0.4) / 0.1;
        fluctuation = -Math.sin(valleyProgress * Math.PI) * 2; // Valley
    }

    // Peak 2 (higher than peak 1): around 50-65%
    if (progress >= 0.5 && progress <= 0.65) {
        const peakProgress = (progress - 0.5) / 0.15;
        fluctuation = Math.sin(peakProgress * Math.PI) * 4; // Higher peak
    }

    // Deep valley: around 65-75%
    if (progress >= 0.65 && progress <= 0.75) {
        const valleyProgress = (progress - 0.65) / 0.1;
        fluctuation = -Math.sin(valleyProgress * Math.PI) * 3.5; // Deep valley
    }

    // Peak 3: around 75-85%
    if (progress >= 0.75 && progress <= 0.85) {
        const peakProgress = (progress - 0.75) / 0.1;
        fluctuation = Math.sin(peakProgress * Math.PI) * 2.5;
    }

    // Final valley: around 85-95%
    if (progress >= 0.85 && progress <= 0.95) {
        const valleyProgress = (progress - 0.85) / 0.1;
        fluctuation = -Math.sin(valleyProgress * Math.PI) * 2;
    }

    return { day, value: Math.max(0, baseValue + fluctuation) };
});

// Forecast: strong increase, almost linear upward
export const BLUE_DATA_FORECAST = Array.from({ length: 33 }, (_, i) => {
    const day = i + 78; // Start from day 78
    const progress = (day - 78) / 32; // 0 to 1 in forecast period

    // Strong increase, almost linear from end of historical
    const startValue = 12; // Continue from historical (after final valley)
    const endValue = 32; // High value at end

    // Almost linear increase with slight smoothness
    const baseValue = startValue + (endValue - startValue) * progress;

    // Very slight fluctuation for smoothness
    const smoothVariation = Math.sin(progress * Math.PI * 4) * 0.5;

    return { day, value: Math.max(0, baseValue + smoothVariation) };
});

// Calculate Y_MAX from maximum value in data
export const calculateYMax = () => {
    // Max from ORANGE_DATA_HISTORICAL (only up to DIVIDER_DAY)
    const orangeMax = Math.max(
        ...ORANGE_DATA_HISTORICAL.filter(p => p.day <= DIVIDER_DAY).map(p => p.value)
    );

    // Max from BLUE_DATA_HISTORICAL and BLUE_DATA_FORECAST
    const blueMax = Math.max(
        ...BLUE_DATA_HISTORICAL.map(p => p.value),
        ...BLUE_DATA_FORECAST.map(p => p.value)
    );

    // Get maximum value
    const maxValue = Math.max(orangeMax, blueMax);

    if (!maxValue) return 80; // Fallback if no data

    // Divide by 4 (for 4 parts on Y-axis), round up, then multiply by 4
    const valuePerPart = maxValue / 4;

    // Round up each part value by step:
    // - If < 100: round up to step 10 (e.g., 55 -> 60, 45 -> 60)
    // - If >= 100: round up to step 100 (e.g., 105 -> 200, 700 -> 800)
    let roundedPerPart;
    if (valuePerPart < 100) {
        roundedPerPart = Math.ceil(valuePerPart / 10) * 10;
    } else {
        roundedPerPart = Math.ceil(valuePerPart / 100) * 100;
    }

    // Multiply back by 4 to get Y_MAX
    return roundedPerPart * 4;
};

export const Y_MAX_CHART1 = calculateYMax();

// Calculate Y-axis label values: divide max into 4 equal parts
export const getYAxisLabels = () => {
    const labels = [];
    for (let i = 0; i <= 4; i++) {
        labels.push((Y_MAX_CHART1 / 4) * i);
    }
    return labels;
};
