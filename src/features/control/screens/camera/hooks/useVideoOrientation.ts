import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

interface UseVideoOrientationReturn {
    isReady: boolean;
    contentAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
    contentOpacity: ReturnType<typeof useSharedValue<number>>;
    handleClose: () => void;
    isMountedRef: React.MutableRefObject<boolean>;
    isClosingRef: React.MutableRefObject<boolean>;
}

export const useVideoOrientation = (): UseVideoOrientationReturn => {
    const navigation = useNavigation();
    const isMountedRef = useRef(true);
    const isClosingRef = useRef(false);

    const [isReady, setIsReady] = useState(false);
    const contentOpacity = useSharedValue(0);

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    const performClose = useCallback(() => {
        StatusBar.setHidden(false);
        const onPortrait = (orientation: string) => {
            if (orientation === 'PORTRAIT' || orientation === 'PORTRAIT-UPSIDEDOWN') {
                Orientation.removeOrientationListener(onPortrait);
                if (fallback) clearTimeout(fallback);
                navigation.goBack();
            }
        };
        Orientation.addOrientationListener(onPortrait);
        Orientation.lockToPortrait();
        const fallback = setTimeout(() => {
            Orientation.removeOrientationListener(onPortrait);
            navigation.goBack();
        }, 500);
    }, [navigation]);

    const handleClose = useCallback(() => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;

        contentOpacity.value = withTiming(0, { duration: 150 }, finished => {
            if (finished) {
                runOnJS(performClose)();
            }
        });
    }, [performClose, contentOpacity]);

    // Lock to landscape on mount
    useEffect(() => {
        StatusBar.setHidden(true);

        const onOrientation = (orientation: string) => {
            if (orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT') {
                setIsReady(true);
            }
        };
        Orientation.addOrientationListener(onOrientation);

        let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
        const timer = setTimeout(() => {
            Orientation.lockToLandscape();

            fallbackTimer = setTimeout(() => {
                if (isMountedRef.current) {
                    setIsReady(true);
                }
            }, 600);
        }, 50);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
            if (fallbackTimer) clearTimeout(fallbackTimer);
            Orientation.removeOrientationListener(onOrientation);
            StatusBar.setHidden(false);
            Orientation.lockToPortrait();
        };
    }, []);

    useEffect(() => {
        if (isReady) {
            contentOpacity.value = withTiming(1, { duration: 250 });
        }
    }, [isReady, contentOpacity]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleClose();
            return true;
        });
        return () => backHandler.remove();
    }, [handleClose]);

    return {
        isReady,
        contentAnimatedStyle,
        contentOpacity,
        handleClose,
        isMountedRef,
        isClosingRef,
    };
};
