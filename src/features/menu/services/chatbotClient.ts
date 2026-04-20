import { ENV } from '@/core/config/env';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { AIResponse } from '@/features/menu/types/chatbot.types';
import { chatbotState } from '@/features/menu/services/chatbotState';

export const callBackendAI = async (text: string, sessionId: string = '1'): Promise<AIResponse> => {
    try {
        const requestBody = {
            session_id: sessionId,
            farm_id: chatbotState.selectedZoneId || null,
            message: text,
        };
        console.log('[ChatbotClient] Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${ENV.CHATBOT_API_URL}${API_ENDPOINTS.CHATBOT.CHAT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { text: data.answer || 'Tôi không hiểu ý bạn.' };
    } catch (error: any) {
        console.error('Backend AI Error:', error);
        return { text: `Lỗi kết nối AI: ${error.message}` };
    }
};
