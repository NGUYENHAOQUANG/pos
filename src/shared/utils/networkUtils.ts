import NetInfo from '@react-native-community/netinfo';

/**
 * Hàm kiểm tra đường truyền mạng để quyết định xem có nên bật HD stream WebRTC hay không.
 * Chỉ 3G truyền false, còn lại (Wifi, 4G, 5G, v.v.) truyền true.
 */
export const checkNetworkForHD = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();

    if (state.type === 'cellular') {
        const generation = state.details?.cellularGeneration;
        // Nếu chính xác là 3g thì trả về false
        if (generation === '3g' || generation === '2g') {
            return false;
        }
    }

    // Tất cả các trường hợp còn lại ưu tiên true
    return true;
};
