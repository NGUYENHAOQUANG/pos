import response1 from '@/features/farm/data/mockjson/response_1769483165029.json';
import response2 from '@/features/farm/data/mockjson/response_1769484988047.json';

export const mockAiResponse = {
    response1,
    response2,
};

export const getMockResponse = (
    fileName: string | null,
    uri: string | null = null,
    fileSize: number | null = null
) => {
    // Priority 1: Check fileName
    if (
        fileName &&
        (fileName.includes('102547') || fileName.includes('040') || fileName.includes('22'))
    ) {
        return response2;
    }

    if (uri && (uri.includes('102547') || uri.includes('040') || uri.includes('22'))) {
        return response2;
    }

    // Priority 3: Check fileSize range
    // Range: 400KB to 600KB (400,000 - 600,000 bytes)
    // This handles the compressed size from image picker
    if (fileSize && fileSize >= 400000 && fileSize <= 600000) {
        return response2;
    }

    return response1;
};
