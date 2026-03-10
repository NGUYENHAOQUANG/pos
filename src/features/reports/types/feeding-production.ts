export interface FeedProdSummary {
    totalBiomass: number;
    totalFood: number;
    fcr: number;
    unit: string;
}

export interface FeedProdChartDataPoint {
    date: string;
    actualFood: number | null;
    actualBiomass: number | null;
    forecastFood: number | null;
    forecastBiomass: number | null;
    isForecast: boolean;
}

export interface FeedProdData {
    summary: FeedProdSummary;
    chartData: FeedProdChartDataPoint[];
}

export interface FeedProdResponse {
    success: boolean;
    data: FeedProdData;
    message: string | null;
}
