import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export const farmDocumentApi = {
    uploadImage: async (file: { uri: string; name?: string; type?: string }): Promise<any> => {
        const formData = new FormData();

        formData.append('Files', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.name || `image_${Date.now()}.jpg`,
        } as any);

        formData.append('StorageType', 'Azure');

        const response = await apiClient.post(API_ENDPOINTS.DOCUMENT.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },
};
