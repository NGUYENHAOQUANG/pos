import NetInfo from '@react-native-community/netinfo';
export const checkNetworkForHD = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();

    if (state.type === 'cellular') {
        const generation = state.details?.cellularGeneration;
        if (generation === '3g' || generation === '2g') {
            return false;
        }
    }
    return true;
};
