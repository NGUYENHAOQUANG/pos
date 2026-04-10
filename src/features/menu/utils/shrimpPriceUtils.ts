import { GraphDataPoint } from '@/features/menu/types/shrimpPrice.types';

export type Point = { x: number; y: number };

const getControlPoint = (
    current: Point,
    previous: Point,
    next: Point,
    reverse?: boolean
): number[] => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.15;
    const lenX = (n.x - p.x) * smoothing;
    const lenY = (n.y - p.y) * smoothing * 0.5;
    const angle = Math.atan2(lenY, lenX);
    const length = Math.sqrt(lenX * lenX + lenY * lenY);
    const actAngle = angle + (reverse ? Math.PI : 0);
    const x = current.x + Math.cos(actAngle) * length;
    const y = current.y + Math.sin(actAngle) * length;
    return [x, y];
};

export const generateBezierPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    let path = '';
    points.forEach((point, i, a) => {
        if (i === 0) {
            path += `M ${point.x},${point.y}`;
        } else {
            const [cpsX, cpsY] = getControlPoint(a[i - 1], a[i - 2], point);
            const [cpeX, cpeY] = getControlPoint(point, a[i - 1], a[i + 1], true);
            path += ` C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x},${point.y}`;
        }
    });
    return path;
};

export const formatPrice = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatYLabel = (value: number): string => {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        const k = value / 1_000;
        return Number.isInteger(k) ? `${k}K` : `${k.toFixed(0)}K`;
    }
    return `${Math.round(value)}`;
};

export const getShrimpImage = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('sú')) return require('@/assets/images/shrimpSU.png');
    if (lowerName.includes('thẻ')) return require('@/assets/images/shrimpWhite.png');
    return require('@/assets/images/shrimp.png');
};

const getRelativeDate = (daysOffset: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d;
};

const formatShortDate = (d: Date): string => `${d.getDate()}/${d.getMonth() + 1}`;

const fluctuatePrice = (price: number, range: number, bias: number): number =>
    Math.round(price * (1 + Math.random() * range - bias));

export const generateHistoricalData = (currentPrice: number): GraphDataPoint[] => {
    const HISTORY_DAYS = 7;
    const PREDICTION_DAYS = 3;

    let price = currentPrice;
    const historyPoints: GraphDataPoint[] = [];

    for (let i = HISTORY_DAYS; i >= 0; i--) {
        if (i !== 0) {
            price = fluctuatePrice(price, 0.04, 0.02);
        } else {
            price = currentPrice;
        }
        const d = getRelativeDate(-i);
        historyPoints.push({
            date: formatShortDate(d),
            originalDate: d,
            value: price,
        });
    }

    let predictedPrice = currentPrice;
    const predictionPoints: GraphDataPoint[] = [];

    for (let i = 1; i <= PREDICTION_DAYS; i++) {
        predictedPrice = fluctuatePrice(predictedPrice, 0.03, 0.01);
        const d = getRelativeDate(i);
        predictionPoints.push({
            date: formatShortDate(d),
            originalDate: d,
            value: predictedPrice,
            isPrediction: true,
        });
    }

    return [...historyPoints, ...predictionPoints];
};
