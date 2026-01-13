import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export const unitApi = {
    getUnits: async (): Promise<string[]> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.UNITS.LIST);
            const data = response.data;

            // Handle structure: { data: { items: [{ name: "..." }] } }
            if (data?.data?.items && Array.isArray(data.data.items)) {
                return data.data.items.map((item: any) => item.name);
            }

            // Fallback for other structures
            if (Array.isArray(data)) {
                return data.map((item: any) => (typeof item === 'string' ? item : item.name));
            }

            if (data && Array.isArray(data.data)) {
                return data.data.map((item: any) => (typeof item === 'string' ? item : item.name));
            }

            return [];
        } catch (error) {
            console.error('Error fetching units:', error);
            return [];
        }
    },
};
