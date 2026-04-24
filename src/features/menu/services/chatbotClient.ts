import { ENV } from '@/core/config/env';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { AIResponse } from '@/features/menu/types/chatbot.types';
import { chatbotState } from '@/features/menu/services/chatbotState';

import { useAuthStore } from '@/features/auth/store/authStore';

export const callBackendAI = async (text: string, sessionId: string = '1'): Promise<AIResponse> => {
    try {
        const userProfile = useAuthStore.getState().userProfile;
        const roleCode = userProfile?.roleCode || '';

        console.log('[ChatbotClient] === BẮT ĐẦU GỬI TIN NHẮN ===');
        console.log('[ChatbotClient] userProfile:', JSON.stringify(userProfile, null, 2));
        console.log('[ChatbotClient] roleCode:', roleCode);

        let role = 'farmer'; // default
        if (roleCode === 'ADMIN') role = 'admin';
        else if (roleCode === 'MANAGER') role = 'manager';
        else if (roleCode === 'EMPLOYEE_MANAGER' || roleCode === 'EMPLOYEE_WAREHOUSE')
            role = 'employee';
        else if (roleCode === 'FARMER') role = 'farmer';

        console.log('[ChatbotClient] role (mapped):', role);

        const url = `${ENV.CHATBOT_API_URL}${API_ENDPOINTS.CHATBOT.CHAT}`;
        const requestBody = {
            session_id: sessionId,
            farm_id: chatbotState.selectedZoneId || null,
            role: role,
            message: text,
        };

        console.log('[ChatbotClient] URL:', url);
        console.log('[ChatbotClient] Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        console.log('[ChatbotClient] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[ChatbotClient] Response error body:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[ChatbotClient] Response data:', JSON.stringify(data, null, 2));
        console.log('[ChatbotClient] === KẾT THÚC ===');

        return { text: data.answer || 'Tôi không hiểu ý bạn.' };
    } catch (error: any) {
        console.error('[ChatbotClient] Backend AI Error:', error);
        return { text: `Lỗi kết nối AI: ${error.message}` };
    }
};
