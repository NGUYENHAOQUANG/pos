import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { appUpdateApi, VersionCheckResult } from '@/features/app-update/api/appUpdateApi';
//import DeviceInfo from 'react-native-device-info';

export const useAppUpdate = () => {
    const [updateInfo, setUpdateInfo] = useState<VersionCheckResult>({
        needsUpdate: false,
        currentVersion: '',
        storeVersion: '',
        storeUrl: '',
    });
    const [loading, setLoading] = useState(false);

    const checkUpdate = useCallback(async () => {
        setLoading(true);
        const result = await appUpdateApi.checkUpdate();

        // if (__DEV__) {
        //     console.log('DEV MODE: Simulating Force Update');
        //     setUpdateInfo({
        //         needsUpdate: true,
        //         currentVersion: DeviceInfo.getVersion(),
        //         storeVersion: '1.0.2',
        //         storeUrl: 'https://play.google.com/store/apps/details?id=com.mebisoft.mebieco',
        //     });
        //     setLoading(false);
        //     return;
        // }

        setUpdateInfo(result);
        setLoading(false);
    }, []);

    // Check on mount
    useEffect(() => {
        checkUpdate();
    }, [checkUpdate]);

    // Check when app comes to foreground (optional, good for force update)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                checkUpdate();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [checkUpdate]);

    return {
        ...updateInfo,
        loading,
        checkUpdate,
        openStore: () => appUpdateApi.openStore(updateInfo.storeUrl),
    };
};
