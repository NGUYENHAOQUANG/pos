/**
 * @file chatbotApi.ts
 * @description API Service for AI Chatbot.
 * Acts as a simple relay to the Backend AI where DB logic and NLP is handled.
 */

import { callBackendAI } from '@/features/menu/services/chatbotClient';
import { AIResponse } from '@/features/menu/types/chatbot.types';

export const sendMessageToAI = async (text: string): Promise<AIResponse> => {
    try {
        return await callBackendAI(text);
    } catch (error: any) {
        console.error('Lỗi khi gọi AI:', error);
        return { text: `Đã xảy ra lỗi kết nối: ${error.message}` };
    }
};
