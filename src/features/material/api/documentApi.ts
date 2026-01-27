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
    no?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface UploadDocumentsResult {
    id: string; // Request ID
    no?: number;
    createdAt?: string;
    editedAt?: string;
    creator?: any;
    editor?: any;
    documents: DocumentResponse[]; // Array of uploaded documents
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

        const { data } = await apiClient.post<{
            success: boolean;
            data: UploadDocumentsResult;
            message?: string;
        }>(API_ENDPOINTS.DOCUMENT.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (data && 'data' in data && (data as any).data) {
            const result = (data as any).data as UploadDocumentsResult;

            if (result.documents && Array.isArray(result.documents)) {
                return result.documents;
            }
        }

        // Legacy fallback - if response is already array (old API format)
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
