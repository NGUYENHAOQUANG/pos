import { useMutation } from '@tanstack/react-query';
import { documentApi } from '@/features/material/api/documentApi';
import { handleError } from '@/shared/utils';

export const useDocumentUpload = () => {
    return useMutation({
        mutationFn: async ({ uri, base64 }: { uri: string; base64: string }) => {
            if (!uri || !base64) return null;

            const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;
            const contentType = 'image/jpeg';

            console.log('Request Payload Info:', {
                fileName,
                contentType,
                storageType: 'Azure',
                base64Length: base64.length,
            });

            const response = await documentApi.uploadBase64({
                base64Content: base64,
                fileName: fileName,
                contentType: contentType,
                storageType: 'Azure',
            });

            if (response && response.length > 0) {
                const documentId = response[0].id;
                console.log('Upload ID:', documentId);
                return documentId;
            } else {
                console.warn('Không tìm thấy ID trong response:', response);
                return null;
            }
        },
        onError: handleError,
    });
};
