/**
 * @file index.ts
 * @description Home feature - Public API
 * @author Kindy
 * @created 2025-11-16
 */
export {HomeScreen} from './screens/HomeScreen';
export {ProductDetailScreen} from './screens/ProductDetailScreen';
export {useProducts, useProductDetail} from './hooks/useProducts';
export {homeApi} from './api/homeApi';
export type {Product} from './api/homeApi';

