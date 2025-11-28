/**
 * @file homeApi.ts
 * @description Home API
 * @author Kindy
 * @created 2025-11-16
 */
import {apiClient} from '@/core/api/client';
import {API_ENDPOINTS} from '@/core/api/endpoints';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

export const homeApi = {
  getProducts: async (): Promise<Product[]> => {
    const {data} = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST);
    return data;
  },

  getProductDetail: async (id: string): Promise<Product> => {
    const {data} = await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return data;
  },
};

