/**
 * @file chatbotApi.ts
 * @description API Service for AI Chatbot.
 * Acts as a simple relay to the Backend AI where DB logic and NLP is handled.
 */

import { callBackendAI } from '@/features/menu/screens/chatbot/services/chatbotClient';
import { AIResponse } from '@/features/menu/screens/chatbot/types';

/**
 * Gửi tin nhắn tới Chatbot AI.
 * Frontend chỉ làm nhiệm vụ passthrough, mọi logic Đọc/Ghi DB và xử lý NLP do BE đảm nhận.
 */
export const sendMessageToAI = async (text: string): Promise<AIResponse> => {
    try {
        return await callBackendAI(text);
    } catch (error: any) {
        console.error('Lỗi khi gọi AI:', error);
        return { text: `Đã xảy ra lỗi kết nối: ${error.message}` };
    }
};
