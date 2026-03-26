import { useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import ViewShot from 'react-native-view-shot';

interface UseVideoSnapshotParams {
    cameraName: string;
    viewShotRef: React.RefObject<ViewShot | null>;
}

interface UseVideoSnapshotReturn {
    handleSnapshot: () => Promise<void>;
}

export const useVideoSnapshot = ({
    cameraName,
    viewShotRef,
}: UseVideoSnapshotParams): UseVideoSnapshotReturn => {
    const handleSnapshot = useCallback(async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED && Platform.Version < 29) {
                    Toast.show({
                        type: 'error',
                        text1: 'Không có quyền lưu ảnh',
                    });
                    return;
                }
            }

            const uri = await viewShotRef.current?.capture?.();
            if (!uri) {
                Toast.show({ type: 'error', text1: 'Không thể chụp ảnh' });
                return;
            }

            // Save to Pictures directory
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `Camera_${cameraName.replace(/\s/g, '_')}_${timestamp}.jpg`;
            const picturesDir =
                Platform.OS === 'android'
                    ? `${RNFS.ExternalStorageDirectoryPath}/Pictures/MebiOne`
                    : `${RNFS.DocumentDirectoryPath}/Pictures`;

            // Ensure directory exists
            const dirExists = await RNFS.exists(picturesDir);
            if (!dirExists) {
                await RNFS.mkdir(picturesDir);
            }

            const destPath = `${picturesDir}/${fileName}`;
            await RNFS.copyFile(uri, destPath);
            if (Platform.OS === 'android') {
                await RNFS.scanFile(destPath);
            }

            Toast.show({
                type: 'success',
                text1: 'Đã lưu ảnh',
                text2: fileName,
            });
        } catch (error) {
            console.error('[Snapshot] Error:', error);
            Toast.show({ type: 'error', text1: 'Lỗi khi lưu ảnh' });
        }
    }, [cameraName, viewShotRef]);

    return { handleSnapshot };
};
