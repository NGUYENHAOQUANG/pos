import { checkVersion } from 'react-native-check-version';
import { Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export interface VersionCheckResult {
    needsUpdate: boolean;
    currentVersion: string;
    storeVersion: string;
    storeUrl: string;
}

export const appUpdateApi = {
    checkUpdate: async (): Promise<VersionCheckResult> => {
        try {
            const version = await checkVersion({
                bundleId: 'com.mebisoft.mebieco',
                country: 'vn',
            });
            const currentVersion = DeviceInfo.getVersion();
            const storeVersion = version.version || '0.0.0';
            const needsUpdate = version.needsUpdate || false;
            const storeUrl = version.url || '';

            return {
                needsUpdate,
                currentVersion,
                storeVersion,
                storeUrl,
            };
        } catch (error) {
            console.warn('App Update Check Failed:', error);
            return {
                needsUpdate: false,
                currentVersion: '0.0.0',
                storeVersion: '0.0.0',
                storeUrl: '',
            };
        }
    },

    openStore: (url: string) => {
        if (url) {
            Linking.openURL(url).catch(err =>
                console.error('An error occurred opening the store URL:', err)
            );
        }
    },
};
