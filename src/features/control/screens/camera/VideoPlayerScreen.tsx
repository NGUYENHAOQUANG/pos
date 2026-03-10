import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Video, { OnProgressData, OnLoadData } from 'react-native-video';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { borderRadius, colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { IconSkipBack, IconSkipForward } from '@/assets/icons';

// ===== Constants =====
const CONTROLS_TIMEOUT = 5000; // Auto-hide controls after 5s
const SEEK_STEP = 10; // Seek 10s per double tap
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');
const LANDSCAPE_W = Math.max(SCREEN_W, SCREEN_H);

type VideoPlayerRouteProp = RouteProp<AppStackParamList, 'CameraPlayer'>;

/**
 * Full-screen landscape video player with:
 * - Auto landscape orientation
 * - Tap to show/hide controls
 * - Auto-hide controls after 5s
 * - Double-tap left/right to seek ±10s
 * - Horizontal pan gesture to seek
 * - Progress bar with scrubbing
 */
export const VideoPlayerScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<VideoPlayerRouteProp>();
    const { videoUrl, cameraName, pondName } = route.params;

    // Video ref
    const videoRef = useRef<any>(null);

    // State
    const [paused, setPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isBuffering, setIsBuffering] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

    // Auto-hide timer
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Controls opacity animation
    const controlsOpacity = useSharedValue(1);

    // Pinch-to-zoom scale values
    const videoScale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    // ===== Controls Visibility =====
    const startHideTimer = useCallback(() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
            controlsOpacity.value = withTiming(0, { duration: 300 }, () => {
                runOnJS(setShowControls)(false);
            });
        }, CONTROLS_TIMEOUT);
    }, [controlsOpacity]);

    const showControlsUI = useCallback(() => {
        setShowControls(true);
        controlsOpacity.value = withTiming(1, { duration: 200 });
        startHideTimer();
    }, [controlsOpacity, startHideTimer]);

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

    // Start initial hide timer
    useEffect(() => {
        startHideTimer();
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, [startHideTimer]);

    // ===== Video Callbacks =====
    const onLoad = useCallback((data: OnLoadData) => {
        setDuration(data.duration);
        setIsBuffering(false);
        // Capture video natural size for pinch-to-zoom scale calculation
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

    // ===== Max scale for pinch-to-zoom (fill screen) =====
    const maxFillScale = useMemo(() => {
        if (!videoDimensions.width || !videoDimensions.height) return 1.5;
        const videoAspect = videoDimensions.width / videoDimensions.height;
        const screenAspect = LANDSCAPE_W / Math.min(SCREEN_W, SCREEN_H);
        if (videoAspect > screenAspect) {
            return videoAspect / screenAspect;
        }
        return screenAspect / videoAspect;
    }, [videoDimensions]);

    // Animated style for video pinch-to-zoom
    const videoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: videoScale.value }],
    }));

    // ===== Gestures =====

    // Double tap → seek forward/backward based on tap position
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
            // Horizontal pan: 1 pixel = duration / screenWidth seconds
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
            // Snap to fill or contain
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

    // ===== Format Time =====
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Progress bar percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <GestureHandlerRootView style={styles.root}>
            <StatusBar hidden />
            <View style={styles.container}>
                {/* Video with pinch-to-zoom scale */}
                <Animated.View style={[styles.videoWrapper, videoAnimatedStyle]}>
                    <Video
                        ref={videoRef}
                        source={{ uri: videoUrl }}
                        style={styles.video}
                        resizeMode="contain"
                        paused={paused}
                        onLoad={onLoad}
                        onProgress={onProgress}
                        onBuffer={onBuffer}
                        repeat
                        playInBackground={false}
                        playWhenInactive={false}
                    />
                </Animated.View>

                {/* Buffering indicator */}
                {isBuffering && (
                    <View style={styles.bufferingContainer}>
                        <ActivityIndicator size="large" color={colors.white} />
                    </View>
                )}

                {/* Gesture area - tap, double-tap, pan, pinch (always on top for touch) */}
                <GestureDetector gesture={composedGesture}>
                    <Animated.View
                        style={[styles.gestureContainer, { backgroundColor: 'transparent' }]}
                    />
                </GestureDetector>

                {/* Controls overlay */}
                {showControls && (
                    <Animated.View
                        style={[styles.controlsOverlay, controlsAnimatedStyle]}
                        pointerEvents="box-none"
                    >
                        {/* Top bar - Badges left, Close right */}
                        <View style={styles.topBar} pointerEvents="box-none">
                            <View style={styles.badgesRow}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{pondName}</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cameraName}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Center - Skip back, Play/Pause, Skip forward */}
                        <View style={styles.centerControls} pointerEvents="box-none">
                            <TouchableOpacity
                                onPress={() => {
                                    seekTo(currentTime - SEEK_STEP);
                                    showControlsUI();
                                }}
                                style={styles.seekButton}
                            >
                                <IconSkipBack width={32} height={32} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setPaused(!paused);
                                    showControlsUI();
                                }}
                                style={styles.playPauseButton}
                            >
                                {paused ? (
                                    <View style={styles.playIcon} />
                                ) : (
                                    <View style={styles.pauseIconRow}>
                                        <View style={styles.pauseBar} />
                                        <View style={styles.pauseBar} />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    seekTo(currentTime + SEEK_STEP);
                                    showControlsUI();
                                }}
                                style={styles.seekButton}
                            >
                                <IconSkipForward width={32} height={32} />
                            </TouchableOpacity>
                        </View>

                        {/* Bottom bar - Time + Progress */}
                        <View style={styles.bottomBar} pointerEvents="box-none">
                            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                            <TouchableWithoutFeedback
                                onPress={e => {
                                    const locationX = e.nativeEvent.locationX;
                                    const barWidth = LANDSCAPE_W - 140;
                                    const seekPercent = locationX / barWidth;
                                    seekTo(seekPercent * duration);
                                    showControlsUI();
                                }}
                            >
                                <View style={styles.progressBarContainer}>
                                    <View style={styles.progressBarBackground}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                { width: `${progress}%` },
                                            ]}
                                        />
                                        <View
                                            style={[styles.progressDot, { left: `${progress}%` }]}
                                        />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                            <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.black,
    },
    container: {
        flex: 1,
        backgroundColor: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    bufferingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gestureContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
        justifyContent: 'space-between',
    },
    // Top bar - badges left, close right
    topBar: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        backgroundColor: colors.overlayBadge,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    badgeText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.full,
        backgroundColor: colors.overlayBadge,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    // Center controls
    centerControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
    },
    seekButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seekIcon: {
        color: colors.white,
        fontSize: 28,
    },
    playPauseButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playPauseText: {
        color: colors.white,
        fontSize: 28,
    },
    playIcon: {
        width: 0,
        height: 0,
        borderLeftWidth: 18,
        borderTopWidth: 12,
        borderBottomWidth: 12,
        borderLeftColor: colors.white,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        marginLeft: 4,
    },
    pauseIconRow: {
        flexDirection: 'row',
        gap: 5,
    },
    pauseBar: {
        width: 5,
        height: 22,
        backgroundColor: colors.white,
        borderRadius: 2,
    },
    // Bottom bar - Progress
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 10,
    },
    timeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
        minWidth: 42,
        textAlign: 'center',
    },
    progressBarContainer: {
        flex: 1,
        height: 30,
        justifyContent: 'center',
    },
    progressBarBackground: {
        height: 3,
        backgroundColor: colors.overlayLoading,
        borderRadius: 2,
        position: 'relative',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.white,
        borderRadius: 2,
    },
    progressDot: {
        position: 'absolute',
        top: -5,
        width: 13,
        height: 13,
        borderRadius: 7,
        backgroundColor: colors.white,
        marginLeft: -6,
    },
});

export default VideoPlayerScreen;
