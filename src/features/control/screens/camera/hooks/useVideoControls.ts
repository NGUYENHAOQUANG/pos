import { useCallback, useEffect, useRef, useState } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { CONTROLS_TIMEOUT } from '@/features/control/screens/camera/constants/videoPlayer.constants';

interface UseVideoControlsReturn {
    /** Whether controls overlay is visible */
    showControls: boolean;
    /** Animated style for controls fade */
    controlsAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
    /** Controls opacity shared value */
    controlsOpacity: ReturnType<typeof useSharedValue<number>>;
    /** Show controls and reset auto-hide timer */
    showControlsUI: () => void;
    /** Toggle controls on/off */
    toggleControls: () => void;
}

/**
 * Manages the show/hide logic for the video player controls overlay,
 * including auto-hide timer and fade animations.
 */
export const useVideoControls = (): UseVideoControlsReturn => {
    const [showControls, setShowControls] = useState(true);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const controlsOpacity = useSharedValue(1);

    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    // Start auto-hide timer
    const startHideTimer = useCallback(() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
            controlsOpacity.value = withTiming(0, { duration: 300 }, () => {
                runOnJS(setShowControls)(false);
            });
        }, CONTROLS_TIMEOUT);
    }, [controlsOpacity]);

    // Show controls and reset timer
    const showControlsUI = useCallback(() => {
        setShowControls(true);
        controlsOpacity.value = withTiming(1, { duration: 200 });
        startHideTimer();
    }, [controlsOpacity, startHideTimer]);

    // Toggle controls visibility
    const toggleControls = useCallback(() => {
        if (showControls) {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            controlsOpacity.value = withTiming(0, { duration: 300 }, () => {
                runOnJS(setShowControls)(false);
            });
        } else {
            showControlsUI();
        }
    }, [showControls, controlsOpacity, showControlsUI]);

    // Start initial hide timer on mount
    useEffect(() => {
        startHideTimer();
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, [startHideTimer]);

    return {
        showControls,
        controlsAnimatedStyle,
        controlsOpacity,
        showControlsUI,
        toggleControls,
    };
};
