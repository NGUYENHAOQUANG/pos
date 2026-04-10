export interface ShrimpPrice {
    id: string;
    name: string;
    size: string;
    price: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
    dateInfo: string;
    image?: string;
}

/** Data point for price chart rendering */
export interface GraphDataPoint {
    date: string;
    originalDate: Date;
    value: number;
    isPrediction?: boolean;
}
