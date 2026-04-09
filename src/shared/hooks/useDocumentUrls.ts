import { useState, useEffect, useRef } from 'react';
import { documentApi } from '@/features/material/api/documentApi';

export function useDocumentUrls(documentIds: string[] | undefined | null) {
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

    // Use stringified JSON to track stable reference of document IDs
    const loadedDocIdsRef = useRef<string>('');

    useEffect(() => {
        const currentDocIds = documentIds || [];
        const docIdsKey = JSON.stringify(currentDocIds);

        if (docIdsKey !== loadedDocIdsRef.current) {
            loadedDocIdsRef.current = docIdsKey;

            if (currentDocIds.length > 0) {
                setIsLoadingImages(true);
                documentApi
                    .getUrls(currentDocIds)
                    .then(urls => {
                        setImageUris(urls);
                        setIsLoadingImages(false);
                    })
                    .catch(error => {
                        console.error('[useDocumentUrls] Failed to fetch image URLs:', error);
                        setImageUris([]);
                        setIsLoadingImages(false);
                    });
            } else {
                setImageUris([]);
                setIsLoadingImages(false);
            }
        }
    }, [documentIds]);

    return { imageUris, isLoadingImages, setImageUris };
}
