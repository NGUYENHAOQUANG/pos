import { useMutation } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { documentApi } from '@/features/material/api/documentApi';
import { handleError } from '@/shared/utils';
import Toast from 'react-native-toast-message';
import { StorageType } from '@/shared/types/common.types';
import type { IDocumentV2Response } from '@/shared/types/common.types';
import type { UploadDocumentsResponse } from '@/features/material/api/documentApi';

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

export interface UploadFilesParams {
    files: { uri: string; type?: string; name?: string; fileSize?: number }[];
}

export const useDocumentUploadFiles = () => {
    return useMutation<UploadDocumentsResponse, Error, UploadFilesParams>({
        mutationFn: async ({ files }) => {
            return await documentApi.upload(files);
        },
        onError: (err: any) => {
            if (err?.message?.includes('504')) {
                Toast.show({
                    type: 'error',
                    text1: 'Thời gian tải ảnh quá lâu, vui lòng thử lại',
                });
            } else {
                handleError(err);
            }
        },
    });
};

export interface UploadV2Params {
    files: { uri: string; type?: string; name?: string }[];
    storageType?: StorageType;
}

export const useDocumentUploadV2 = () => {
    return useMutation<IDocumentV2Response, Error, UploadV2Params>({
        mutationFn: async ({ files, storageType = StorageType.Azure }) => {
            return await documentApi.uploadV2(files, storageType);
        },
        onError: (err: any) => {
            if (err?.message?.includes('504')) {
                Toast.show({
                    type: 'error',
                    text1: 'Thời gian tải ảnh quá lâu, vui lòng thử lại',
                });
            } else {
                handleError(err);
            }
        },
    });
};

export const useSyncDocuments = () => {
    const { mutateAsync: uploadFiles } = useDocumentUploadFiles();

    // Cache map: localUri -> uploaded document ID
    const uploadedLocalUrisMap = useRef<Map<string, string>>(new Map());
    // Tracking commitment: if user unmounts without committing, we delete orphans
    const isCommitted = useRef(false);

    useEffect(() => {
        const urisMap = uploadedLocalUrisMap.current;

        return () => {
            // If component unmounts and we haven't committed the save, delete the orphaned uploads
            if (!isCommitted.current && urisMap.size > 0) {
                const orphanedIds = Array.from(urisMap.values());
                Promise.all(orphanedIds.map(id => documentApi.delete(id))).catch(err =>
                    console.warn('Silent fail deleting orphaned documents:', err)
                );
            }
        };
    }, []);

    const markUploadsAsSaved = () => {
        isCommitted.current = true;
    };

    const uploadAndSyncDocuments = async (
        currentUris: string[],
        initialUris: string[] = [],
        initialDocIds: string[] = []
    ): Promise<string[]> => {
        const existingDocIds = initialDocIds.filter((id, i) => {
            const uri = initialUris[i];
            return currentUris.includes(uri);
        });

        // Determine which existing documents were dropped
        const deletedDocIds = initialDocIds.filter(id => !existingDocIds.includes(id));
        if (deletedDocIds.length > 0) {
            Promise.all(deletedDocIds.map(id => documentApi.delete(id))).catch(err =>
                console.warn('Silent fail deleting documents:', err)
            );
        }

        const localUris = currentUris.filter(
            uri => uri.startsWith('file://') || uri.startsWith('content://')
        );

        const filesToUpload: { uri: string; type: string; name: string }[] = [];
        const urisToUpload: string[] = [];
        let newDocIds: string[] = [];

        for (const uri of localUris) {
            if (uploadedLocalUrisMap.current.has(uri)) {
                newDocIds.push(uploadedLocalUrisMap.current.get(uri)!);
                continue;
            }
            filesToUpload.push({
                uri,
                type: 'image/jpeg',
                name: uri.split('/').pop() || `image-${Date.now()}.jpg`,
            });
            urisToUpload.push(uri);
        }

        if (filesToUpload.length > 0) {
            try {
                // Upload items concurrently
                const uploadPromises = filesToUpload.map(async (file, index) => {
                    const uri = urisToUpload[index];
                    const uploadedDocs = await uploadFiles({ files: [file] });
                    const uploadedIds = uploadedDocs.map(doc => doc.id).filter(Boolean) as string[];

                    if (uploadedIds.length > 0) {
                        uploadedLocalUrisMap.current.set(uri, uploadedIds[0]);
                        return uploadedIds;
                    }
                    return [];
                });

                const results = await Promise.all(uploadPromises);
                results.forEach(ids => newDocIds.push(...ids));
            } catch (err) {
                throw err;
            }
        }

        return [...existingDocIds, ...newDocIds];
    };

    return { uploadAndSyncDocuments, markUploadsAsSaved };
};
