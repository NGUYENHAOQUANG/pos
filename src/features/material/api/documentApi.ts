import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export interface DocumentResponse {
    id: string;
    fileName: string;
    filePath: string;
    thumbnailPath?: string;
    publicUrl?: string;
    contentType?: string;
    size?: number;
}

export type UploadDocumentsResponse = DocumentResponse[];

export const documentApi = {
    upload: async (files: any[]): Promise<UploadDocumentsResponse> => {
        const formData = new FormData();

        files.forEach(file => {
            formData.append('Files', {
                uri: file.uri,
                type: file.type || 'application/octet-stream',
                name: file.name || 'file',
            } as any);
        });

        formData.append('StorageType', 'Azure');

        const { data } = await apiClient.post<UploadDocumentsResponse>(
            API_ENDPOINTS.DOCUMENT.UPLOAD,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        console.log('Upload to Azure SUCCESS:', data);

        // Unwrap the response if it's wrapped in { success: true, data: ... }
        if (data && 'data' in data) {
            const responseData = (data as any).data;
            if (Array.isArray(responseData)) {
                return responseData;
            } else if (responseData) {
                // Determine if responseData is a single object or something else
                return [responseData];
            }
        }

        // Fallback if data is already the array
        if (Array.isArray(data)) {
            return data;
        }

        return [];
    },
    delete: async (id: string): Promise<any> => {
        const { data } = await apiClient.delete(API_ENDPOINTS.DOCUMENT.DELETE(id));
        return data;
    },
};
