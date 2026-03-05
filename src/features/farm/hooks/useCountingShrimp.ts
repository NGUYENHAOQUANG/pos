import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { aiApi } from '@/features/farm/api/aiApi';
import { DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';
import Toast from 'react-native-toast-message';

interface UploadBase64Response {
    data?: {
        document?: { id?: string };
    };
}

export interface CountingResult {
    count: number;
    detections: DetectionDot[];
}

export interface CountingShrimpInput {
    base64Content: string;
    imageUri: string;
}

async function uploadAndCount(input: CountingShrimpInput): Promise<CountingResult> {
    const { base64Content, imageUri } = input;
    const fileName = imageUri.split('/').pop() ?? `image_${Date.now()}.jpg`;
    const payload = {
        base64Content,
        fileName,
        contentType: 'image/jpeg',
        storageType: 'Azure',
    };
    const response = await apiClient.post<UploadBase64Response>(
        API_ENDPOINTS.DOCUMENT.UPLOAD_BASE64,
        payload
    );
    const data = response.data;
    const documentId = data?.data?.document?.id;
    if (!documentId) {
        throw new Error('Could not retrieve document ID from uploaded image.');
    }
    const aiResponse = await aiApi.countSeedstock({ documentId });
    const count = aiResponse?.totalCount ?? 0;
    let detections: DetectionDot[] = [];
    if (
        aiResponse?.detections &&
        Array.isArray(aiResponse.detections) &&
        aiResponse.detections.length > 0
    ) {
        detections = aiResponse.detections
            .map((d, index) => {
                if (!d?.center) return null;
                return { id: d.id ?? index, center: { x: d.center.x, y: d.center.y } };
            })
            .filter((d): d is DetectionDot => d !== null);
    }
    return { count, detections };
}

/**
 * Hook chỉ phục vụ gọi API: upload base64 -> count seedstock.
 * Dùng một mutation cho cả flow để isPending = true ngay khi bấm (kể cả lúc đang upload).
 */
export function useCountingShrimp() {
    const mutation = useMutation<CountingResult, Error, CountingShrimpInput>({
        mutationFn: uploadAndCount,
        onError: error => {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMessage = err?.response?.data?.message ?? 'Không thể xử lý ảnh này';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: errorMessage });
        },
    });

    const executeCounting = useCallback(
        async (base64Content: string, imageUri: string): Promise<CountingResult> => {
            return mutation.mutateAsync({ base64Content, imageUri });
        },
        [mutation]
    );

    return {
        executeCounting,
        isPending: mutation.isPending,
    };
}
