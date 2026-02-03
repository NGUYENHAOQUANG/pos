import response1 from '@/features/farm/data/mockjson/response_1769483165029.json';
import response2 from '@/features/farm/data/mockjson/response_1769484988047.json';

export const mockAiResponse = {
    response1,
    response2,
};

export const getMockResponse = (fileName: string | null, uri: string | null = null) => {
    if (
        fileName &&
        (fileName.includes('102547') || fileName.includes('040') || fileName.includes('22'))
    ) {
        return response2;
    }
    if (uri && (uri.includes('102547') || uri.includes('040') || uri.includes('22'))) {
        return response2;
    }
    return response1;
};
