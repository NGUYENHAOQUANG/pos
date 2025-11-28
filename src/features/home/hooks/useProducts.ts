/**
 * @file useProducts.ts
 * @description useProducts hook with React Query
 * @author Kindy
 * @created 2025-11-16
 */
import {useQuery} from '@tanstack/react-query';
import {homeApi, Product} from '../api/homeApi';

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: homeApi.getProducts,
  });
}

export function useProductDetail(id: string) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => homeApi.getProductDetail(id),
    enabled: !!id,
  });
}

