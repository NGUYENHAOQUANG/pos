/**
 * @file env.ts
 * @description Environment configuration
 * @author Kindy
 * @created 2025-11-16
 */
import { API_URL, NODE_ENV, API_TIMEOUT } from '@env';

export const ENV = {
    API_URL: API_URL,
    ENVIRONMENT: NODE_ENV || 'development',
    API_TIMEOUT: API_TIMEOUT ? parseInt(API_TIMEOUT, 10) : 10000,
} as const;

export const isDevelopment = ENV.ENVIRONMENT === 'development';
export const isProduction = ENV.ENVIRONMENT === 'production';
