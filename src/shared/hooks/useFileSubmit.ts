/**
 * @file useFileSubmit.ts
 * @description Hook to handle file upload followed by form submission
 * @created 2026-01-27
 */
import { useState } from 'react';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { documentApi } from '@/features/material/api/documentApi';

export const useFileSubmit = () => {
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Uploads files -> Gets IDs -> Calls submitCallback with IDs
     * @param files List of selected files
     * @param submitCallback Function to call after upload (receives documentIds)
     */
    const submitWithFiles = async <T>(
        files: DocumentPickerResponse[],
        submitCallback: (documentIds: string[]) => Promise<T>
    ) => {
        try {
            setIsUploading(true);
            let documentIds: string[] = [];
            const filesToUpload: DocumentPickerResponse[] = [];

            // Separate files that need uploading vs ones already uploaded
            if (files && files.length > 0) {
                files.forEach((file: any) => {
                    if (file.id) {
                        documentIds.push(file.id);
                    } else {
                        filesToUpload.push(file);
                    }
                });

                // Upload new files if any
                if (filesToUpload.length > 0) {
                    const uploadResponse = await documentApi.upload(filesToUpload);
                    if (Array.isArray(uploadResponse)) {
                        const newIds = uploadResponse.map(doc => doc.id);
                        documentIds = [...documentIds, ...newIds];
                    }
                }
            }

            // Call the actual submit action with the document IDs
            return await submitCallback(documentIds);
        } catch (error) {
            console.error('File upload or submission failed:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        submitWithFiles,
        isUploading,
    };
};
