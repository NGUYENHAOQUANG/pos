import { useQuery } from '@tanstack/react-query';
import { shrimpHealthCheckApi } from '@/features/farm/api/shrimpHealthCheckApi';
import { useMemo } from 'react';

/**
 * Hook to aggregate AI diagnosis data from all health checks in the current cycle
 * @param pondId - The ID of the pond
 * @param currentDiagnosisDetails - Optional current diagnosis details from the form (for create/edit preview)
 * @param editingId - Optional ID of the record currently being edited (to exclude it from API list and replace with current form data)
 */
export const useAggregatedAIDiagnosis = (
    pondId: string | undefined,
    currentDiagnosisDetails?: Array<{ diseaseType: string; probabilityPercent: number }> | null,
    editingId?: string
) => {
    // Fetch all health check records for this pond
    const { data: healthChecks, isLoading } = useQuery({
        queryKey: ['shrimpHealthChecks', pondId],
        queryFn: async () => {
            if (!pondId) return [];

            const response = await shrimpHealthCheckApi.list(pondId);
            return response.data?.items || [];
        },
        enabled: !!pondId,
    });

    // Calculate aggregated diagnosis statistics
    const aggregatedStats = useMemo(() => {
        // If no API data and no current data, return null
        if (
            (!healthChecks || healthChecks.length === 0) &&
            (!currentDiagnosisDetails || currentDiagnosisDetails.length === 0)
        ) {
            return null;
        }

        // Aggregate diagnosis counts from all records
        const diagnosisCounts: Record<string, number> = {};
        let totalShrimp = 0;
        let recordCount = 0;

        // 1. Process API records (exclude editingId if provided)
        if (healthChecks) {
            healthChecks.forEach((record: any) => {
                // Skip the record being edited, we will use current form data instead
                if (editingId && record.id === editingId) {
                    return;
                }

                const details = record.healthCheck?.diagnosisDetails;
                if (processDiagnosisDetails(details, diagnosisCounts)) {
                    totalShrimp += 100; // Assume 100 shrimp per record
                    recordCount++;
                }
            });
        }

        // 2. Process current form data (if available)
        if (currentDiagnosisDetails && currentDiagnosisDetails.length > 0) {
            if (processDiagnosisDetails(currentDiagnosisDetails, diagnosisCounts)) {
                totalShrimp += 100; // Assume 100 shrimp per record
                recordCount++;
            }
        }

        if (totalShrimp === 0) {
            return null;
        }

        // Convert to percentages
        const percentages = Object.entries(diagnosisCounts)
            .filter(([diagnosis]) => diagnosis !== 'Khỏe mạnh')
            .map(([diagnosis, count]) => ({
                diagnosis,
                count,
                percentage: parseFloat(((count / totalShrimp) * 100).toFixed(1)),
            }));

        // Sort by percentage descending
        percentages.sort((a, b) => b.percentage - a.percentage);

        return {
            totalShrimp,
            percentages,
            recordCount,
        };
    }, [healthChecks, currentDiagnosisDetails, editingId]);

    return {
        aggregatedStats,
        isLoading,
    };
};

/**
 * Helper to process diagnosis details and update counts
 */
const processDiagnosisDetails = (details: any[], counts: Record<string, number>): boolean => {
    if (details && Array.isArray(details) && details.length > 0) {
        // Assume 100 shrimp for calculation based on percentages
        const estimatedTotal = 100;

        details.forEach((detail: any) => {
            const diagnosis = mapEnumToVietnamese(detail.diseaseType);
            const count = Math.round((detail.probabilityPercent / 100) * estimatedTotal);

            counts[diagnosis] = (counts[diagnosis] || 0) + count;
        });
        return true;
    }
    return false;
};

/**
 * Map backend enum to Vietnamese
 */
const mapEnumToVietnamese = (diseaseType: string): string => {
    const map: Record<string, string> = {
        Healthy: 'Khỏe mạnh',
        WSSV: 'Đốm trắng',
        BlackGill: 'Mang đen',
        Yellowhead: 'Đầu vàng',
    };
    return map[diseaseType] || diseaseType;
};
