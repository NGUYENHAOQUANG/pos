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

    getUrl: async (id: string): Promise<string> => {
        const { data } = await apiClient.get<any>(API_ENDPOINTS.DOCUMENT.GET_URL(id));

        // Handle various response structures
        if (typeof data === 'string') return data;
        if (data?.result && typeof data.result === 'string') return data.result;
        if (data?.data) {
            if (typeof data.data === 'string') return data.data;
            if (data.data.documentUrl && typeof data.data.documentUrl === 'string')
                return data.data.documentUrl;
        }

        if (data?.url && typeof data.url === 'string') return data.url;
        return '';
    },

    getUrls: async (documentIds: string[]): Promise<string[]> => {
        if (!documentIds?.length) return [];
        const urls = await Promise.all(
            documentIds.map(async id => {
                try {
                    const url = await documentApi.getUrl(id);
                    return url || '';
                } catch {
                    return '';
                }
            })
        );
        return urls.filter((u): u is string => !!u);
    },

    delete: async (id: string): Promise<boolean> => {
        try {
            const { data } = await apiClient.delete<any>(API_ENDPOINTS.DOCUMENT.DELETE(id));
            if (data?.success || data?.result) return true;
            return false;
        } catch (_error) {
            return false;
        }
    },

    uploadBase64: async (payload: {
        base64Content: string;
        fileName: string;
        contentType: string;
        storageType?: string;
    }): Promise<UploadDocumentsResponse> => {
        console.log('DEBUG: Calling endpoint:', API_ENDPOINTS.DOCUMENT.UPLOAD_BASE64);
        const { data } = await apiClient.post<{
            success: boolean;
            data: UploadDocumentsResult;
            message?: string;
        }>(API_ENDPOINTS.DOCUMENT.UPLOAD_BASE64, {
            ...payload,
            storageType: payload.storageType || 'Unspecified',
        });

        console.log('DEBUG: uploadBase64 raw response:', JSON.stringify(data, null, 2));

        if (data && 'data' in data && (data as any).data) {
            const result = (data as any).data;

            // Case 1: Response has 'document' property (as seen in logs)
            if (result.document && result.document.id) {
                return [result.document];
            }

            // Case 2: Response is directly the document object
            if (result.id && result.fileName) {
                return [result as DocumentResponse];
            }

            // Case 3: Response has 'documents' array (legacy/standard)
            if (result.documents && Array.isArray(result.documents)) {
                return result.documents;
            }
        }
        if (Array.isArray(data)) {
            return data;
        }

        return [];
    },
};
