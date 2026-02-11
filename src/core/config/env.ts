/**
 * @file env.ts
 * @description Environment configuration
 * @author Kindy
 * @created 2025-11-16
 */
import { API_URL, API_URL_AI, API_KEY_AI, NODE_ENV, API_TIMEOUT } from '@env';

export const ENV = {
    API_URL: API_URL,
    API_URL_AI:
        API_URL_AI ||
        'https://mebieco-ai-executor-1.delightfulmeadow-8697d004.southeastasia.azurecontainerapps.io',
    API_KEY_AI: API_KEY_AI || 'mebieco-ai.2026@securekey!',
    ENVIRONMENT: NODE_ENV || 'development',
    API_TIMEOUT: API_TIMEOUT ? parseInt(API_TIMEOUT, 10) : 10000,
} as const;

export const isDevelopment = ENV.ENVIRONMENT === 'development';
export const isProduction = ENV.ENVIRONMENT === 'production';
