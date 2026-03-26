import { useMemo, useCallback, useRef, useState } from 'react';
import { OnLoadData, OnProgressData } from 'react-native-video';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import {
    SEEK_STEP,
    LANDSCAPE_W,
    LANDSCAPE_H,
} from '@/features/control/screens/camera/constants/videoPlayer.constants';

interface UseVideoGesturesParams {
    /** Toggle controls visibility */
    toggleControls: () => void;
    /** Show controls and reset auto-hide timer */
    showControlsUI: () => void;
}

interface UseVideoGesturesReturn {
    /** Composed gesture handler (pinch + pan + tap) */
    composedGesture: ReturnType<typeof Gesture.Simultaneous>;
    /** Animated style for video scale (pinch-to-zoom) */
    videoAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
    /** Video player ref (react-native-video) */
    videoRef: React.MutableRefObject<{ seek: (time: number) => void } | null>;
    /** Video playback state */
    paused: boolean;
    /** Set video paused state */
    setPaused: React.Dispatch<React.SetStateAction<boolean>>;
    /** Current playback time in seconds */
    currentTime: number;
    /** Total video duration in seconds */
    duration: number;
    /** Whether the video is currently buffering */
    isBuffering: boolean;
    /** Set buffering state */
    setIsBuffering: React.Dispatch<React.SetStateAction<boolean>>;
    /** Handler for react-native-video onLoad event */
    onLoad: (data: OnLoadData) => void;
    /** Handler for react-native-video onProgress event */
    onProgress: (data: OnProgressData) => void;
    /** Handler for react-native-video onBuffer event */
    onBuffer: (data: { isBuffering: boolean }) => void;
    /** Seek to a specific position */
    seekTo: (time: number) => void;
    /** Format seconds to MM:SS string */
    formatTime: (seconds: number) => string;
    /** Progress percentage (0-100) */
    progress: number;
}

/**
 * Manages all gesture interactions (tap, double-tap, pan, pinch)
 * and playback state for the video player.
 */
export const useVideoGestures = ({
    toggleControls,
    showControlsUI,
}: UseVideoGesturesParams): UseVideoGesturesReturn => {
    // Player ref
    const videoRef = useRef<{ seek: (time: number) => void } | null>(null);

    // Playback state
    const [paused, setPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isBuffering, setIsBuffering] = useState(true);
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

    // Pinch-to-zoom scale values
    const videoScale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const videoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: videoScale.value }],
    }));

    // Video callbacks
    const onLoad = useCallback((data: OnLoadData) => {
        setDuration(data.duration);
        setIsBuffering(false);
        if (data.naturalSize) {
            setVideoDimensions({
                width: data.naturalSize.width,
                height: data.naturalSize.height,
            });
        }
    }, []);

    const onProgress = useCallback((data: OnProgressData) => {
        setCurrentTime(data.currentTime);
    }, []);

    const onBuffer = useCallback(({ isBuffering: buffering }: { isBuffering: boolean }) => {
        setIsBuffering(buffering);
    }, []);

    const seekTo = useCallback(
        (time: number) => {
            const clampedTime = Math.max(0, Math.min(time, duration));
            videoRef.current?.seek(clampedTime);
            setCurrentTime(clampedTime);
        },
        [duration]
    );

    // Max scale for pinch-to-zoom (fill screen)
    const maxFillScale = useMemo(() => {
        if (!videoDimensions.width || !videoDimensions.height) return 1.5;
        const videoAspect = videoDimensions.width / videoDimensions.height;
        const screenAspect = LANDSCAPE_W / LANDSCAPE_H;
        if (videoAspect > screenAspect) {
            return videoAspect / screenAspect;
        }
        return screenAspect / videoAspect;
    }, [videoDimensions]);

    // ===== Gestures =====

    // Double tap → seek forward/backward
    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(300)
        .onEnd(event => {
            const halfWidth = LANDSCAPE_W / 2;
            if (event.absoluteX < halfWidth) {
                runOnJS(seekTo)(currentTime - SEEK_STEP);
            } else {
                runOnJS(seekTo)(currentTime + SEEK_STEP);
            }
            runOnJS(showControlsUI)();
        });

    // Single tap → toggle controls
    const singleTap = Gesture.Tap()
        .numberOfTaps(1)
        .onEnd(() => {
            runOnJS(toggleControls)();
        });

    // Pan gesture for seeking (single finger only)
    const panStartTime = useSharedValue(0);
    const panGesture = Gesture.Pan()
        .maxPointers(1)
        .onStart(() => {
            panStartTime.value = currentTime;
        })
        .onUpdate(event => {
            const seekDelta = (event.translationX / LANDSCAPE_W) * duration * 0.5;
            const newTime = panStartTime.value + seekDelta;
            runOnJS(seekTo)(newTime);
        })
        .onEnd(() => {
            runOnJS(showControlsUI)();
        });

    // Pinch gesture for zoom (contain ↔ fill)
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            savedScale.value = videoScale.value;
        })
        .onUpdate(event => {
            videoScale.value = Math.max(
                1,
                Math.min(savedScale.value * event.scale, maxFillScale * 1.1)
            );
        })
        .onEnd(() => {
            if (videoScale.value > 1.15) {
                videoScale.value = withTiming(maxFillScale, { duration: 200 });
                savedScale.value = maxFillScale;
            } else {
                videoScale.value = withTiming(1, { duration: 200 });
                savedScale.value = 1;
            }
        });

    // Compose all gestures
    const tapGestures = Gesture.Exclusive(doubleTap, singleTap);
    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        Gesture.Race(panGesture, tapGestures)
    );

    // Format time helper
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return {
        composedGesture,
        videoAnimatedStyle,
        videoRef,
        paused,
        setPaused,
        currentTime,
        duration,
        isBuffering,
        setIsBuffering,
        onLoad,
        onProgress,
        onBuffer,
        seekTo,
        formatTime,
        progress,
    };
};
