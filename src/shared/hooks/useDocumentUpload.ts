import { useMutation } from '@tanstack/react-query';
import { documentApi } from '@/features/material/api/documentApi';
import { handleError } from '@/shared/utils';
import { StorageType } from '@/shared/types/common.types';
import type { IDocumentV2Response } from '@/shared/types/common.types';

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

// ── V2: Upload files via multipart/form-data with full IDocumentV2 response ──

export interface UploadV2Params {
    files: { uri: string; type?: string; name?: string }[];
    storageType?: StorageType;
}

/**
 * Hook upload documents V2 – dùng multipart/form-data.
 *
 * @example
 * const { mutateAsync: uploadDocs } = useDocumentUploadV2();
 * const docs = await uploadDocs({
 *     files: [{ uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' }],
 *     storageType: StorageType.Azure,
 * });
 * // result: IDocumentV2Response
 */
export const useDocumentUploadV2 = () => {
    return useMutation<IDocumentV2Response, Error, UploadV2Params>({
        mutationFn: async ({ files, storageType = StorageType.Azure }) => {
            return await documentApi.uploadV2(files, storageType);
        },
        onError: handleError,
    });
};
