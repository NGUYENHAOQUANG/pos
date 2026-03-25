import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { WebView } from 'react-native-webview';
import { useRoute, RouteProp } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import ViewShot from 'react-native-view-shot';
import { SEEK_STEP } from '@/features/control/screens/camera/constants/videoPlayer.constants';
import { useVideoOrientation } from '@/features/control/screens/camera/hooks/useVideoOrientation';
import { useVideoControls } from '@/features/control/screens/camera/hooks/useVideoControls';
import { useVideoGestures } from '@/features/control/screens/camera/hooks/useVideoGestures';
import { useVideoSnapshot } from '@/features/control/screens/camera/hooks/useVideoSnapshot';
import { VideoTopBar } from '@/features/control/screens/camera/components/VideoTopBar';
import { VideoCenterControls } from '@/features/control/screens/camera/components/VideoCenterControls';
import { VideoBottomBar } from '@/features/control/screens/camera/components/VideoBottomBar';
import { CameraStreamMode } from '@/features/control/constants/cameraServer.constants';

type VideoPlayerRouteProp = RouteProp<AppStackParamList, 'CameraPlayer'>;

/**
 * Full-screen landscape video player.
 * Uses react-native-orientation-locker to natively rotate to landscape.
 * Supports 3 modes:
 * - 'rtsp'   : VLCPlayer (legacy, may lag on iOS real devices)
 * - 'webrtc' : WebView loading go2rtc web player (< 500ms latency)
 * - 'hls'    : react-native-video playing HLS m3u8 (~3s latency)
 */
export const VideoPlayerScreen: React.FC = () => {
    const route = useRoute<VideoPlayerRouteProp>();
    const { videoUrl, cameraName, pondName, streamMode = 'rtsp' } = route.params;

    // Determine stream type
    const mode: CameraStreamMode = streamMode;
    const isLiveStream = mode === 'rtsp' && videoUrl.toLowerCase().startsWith('rtsp://');
    const isWebRTC = mode === 'webrtc';
    const isHLS = mode === 'hls';

    // ViewShot ref for snapshot capture
    const viewShotRef = useRef<ViewShot>(null);
    // Buffering auto-hide timeout for live streams
    const bufferingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ===== Custom Hooks =====
    const { contentAnimatedStyle, handleClose, isMountedRef, isClosingRef, vlcRef } =
        useVideoOrientation();

    const { showControls, controlsAnimatedStyle, showControlsUI, toggleControls } =
        useVideoControls();

    const {
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
    } = useVideoGestures({ toggleControls, showControlsUI });

    const { handleSnapshot } = useVideoSnapshot({ cameraName, viewShotRef });

    // ===== VLC Cleanup (only for rtsp mode) =====
    useEffect(() => {
        if (mode !== 'rtsp') return;
        const vlcPlayer = vlcRef.current;
        return () => {
            if (vlcPlayer) {
                try {
                    (vlcPlayer as { stopPlayer?: () => void }).stopPlayer?.();
                } catch (_e) {
                    // Ignore errors during cleanup
                }
            }
            if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
        };
    }, [vlcRef, mode]);

    // Auto-hide buffering indicator after 5s for live streams
    useEffect(() => {
        if (isBuffering && isLiveStream) {
            bufferingTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) setIsBuffering(false);
            }, 5000);
            return () => {
                if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
            };
        }
    }, [isBuffering, isLiveStream, isMountedRef, setIsBuffering]);

    // ===== WebRTC Mode (WebView with go2rtc player) =====
    if (isWebRTC) {
        return (
            <GestureHandlerRootView style={styles.root}>
                <Animated.View style={[styles.container, contentAnimatedStyle]}>
                    <WebView
                        source={{ uri: videoUrl }}
                        style={styles.video}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mediaPlaybackRequiresUserAction={false}
                        allowsInlineMediaPlayback={true}
                        allowsFullscreenVideo={false}
                        scrollEnabled={false}
                        mixedContentMode="always"
                        allowFileAccess={true}
                        originWhitelist={['*']}
                        onError={e => console.error('[WebView] Error:', e.nativeEvent)}
                        onHttpError={e => console.error('[WebView] HTTP Error:', e.nativeEvent)}
                        onLoad={() => console.log('[WebView] Loaded')}
                    />

                    {/* Close button overlay */}
                    <View style={styles.webrtcCloseOverlay} pointerEvents="box-none">
                        <VideoTopBar
                            pondName={pondName}
                            cameraName={cameraName}
                            onSnapshot={handleSnapshot}
                            onClose={handleClose}
                        />
                    </View>
                </Animated.View>
            </GestureHandlerRootView>
        );
    }

    // ===== HLS Mode (react-native-video) =====
    if (isHLS) {
        return (
            <GestureHandlerRootView style={styles.root}>
                <Animated.View style={[styles.container, contentAnimatedStyle]}>
                    <Animated.View style={[styles.videoWrapper, videoAnimatedStyle]}>
                        <Video
                            ref={videoRef as never}
                            source={{ uri: videoUrl }}
                            style={styles.video}
                            resizeMode="contain"
                            paused={paused}
                            onLoad={onLoad}
                            onProgress={onProgress}
                            onBuffer={onBuffer}
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

                    {/* Gesture area */}
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
                            <VideoTopBar
                                pondName={pondName}
                                cameraName={cameraName}
                                onSnapshot={handleSnapshot}
                                onClose={handleClose}
                            />

                            <VideoCenterControls
                                paused={paused}
                                isLiveStream={true}
                                onTogglePause={() => {
                                    setPaused(!paused);
                                    showControlsUI();
                                }}
                                onSeekBack={() => {
                                    seekTo(currentTime - SEEK_STEP);
                                    showControlsUI();
                                }}
                                onSeekForward={() => {
                                    seekTo(currentTime + SEEK_STEP);
                                    showControlsUI();
                                }}
                            />

                            <VideoBottomBar
                                isLiveStream={true}
                                currentTime={currentTime}
                                duration={duration}
                                progress={progress}
                                formatTime={formatTime}
                                seekTo={seekTo}
                                showControlsUI={showControlsUI}
                            />
                        </Animated.View>
                    )}
                </Animated.View>
            </GestureHandlerRootView>
        );
    }

    // ===== RTSP Mode (VLCPlayer - legacy) =====
    return (
        <GestureHandlerRootView style={styles.root}>
            <Animated.View style={[styles.container, contentAnimatedStyle]}>
                {/* Video with pinch-to-zoom scale */}
                <Animated.View style={[styles.videoWrapper, videoAnimatedStyle]}>
                    <ViewShot
                        ref={viewShotRef}
                        options={{ format: 'jpg', quality: 0.95 }}
                        style={styles.video}
                    >
                        {isLiveStream ? (
                            <VLCPlayer
                                ref={vlcRef}
                                source={
                                    {
                                        initType: 2,
                                        hwDecoderEnabled: 1,
                                        hwDecoderForced: 1,
                                        uri: videoUrl,
                                        initOptions: [
                                            '--no-audio',
                                            '--rtsp-tcp',
                                            '--network-caching=150',
                                            '--rtsp-caching=150',
                                            '--no-stats',
                                            '--tcp-caching=150',
                                            '--realrtsp-caching=150',
                                        ],
                                    } as any
                                }
                                style={styles.video}
                                autoplay={true}
                                videoAspectRatio="16:9"
                                resizeMode="contain"
                                {...({ isLive: true, autoReloadLive: true } as any)}
                                paused={paused}
                                onBuffering={() => {
                                    if (isMountedRef.current && !isClosingRef.current)
                                        setIsBuffering(true);
                                }}
                                onPlaying={() => {
                                    if (isMountedRef.current && !isClosingRef.current)
                                        setIsBuffering(false);
                                }}
                                onError={(e: unknown) => {
                                    console.error('[VLC] Error:', e);
                                    if (isMountedRef.current && !isClosingRef.current)
                                        setIsBuffering(false);
                                }}
                                onStopped={() => {}}
                            />
                        ) : (
                            <Video
                                ref={videoRef as never}
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
                        )}
                    </ViewShot>
                </Animated.View>

                {/* Buffering indicator */}
                {isBuffering && (
                    <View style={styles.bufferingContainer}>
                        <ActivityIndicator size="large" color={colors.white} />
                    </View>
                )}

                {/* Gesture area */}
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
                        <VideoTopBar
                            pondName={pondName}
                            cameraName={cameraName}
                            onSnapshot={handleSnapshot}
                            onClose={handleClose}
                        />

                        <VideoCenterControls
                            paused={paused}
                            isLiveStream={isLiveStream}
                            onTogglePause={() => {
                                setPaused(!paused);
                                showControlsUI();
                            }}
                            onSeekBack={() => {
                                seekTo(currentTime - SEEK_STEP);
                                showControlsUI();
                            }}
                            onSeekForward={() => {
                                seekTo(currentTime + SEEK_STEP);
                                showControlsUI();
                            }}
                        />

                        <VideoBottomBar
                            isLiveStream={isLiveStream}
                            currentTime={currentTime}
                            duration={duration}
                            progress={progress}
                            formatTime={formatTime}
                            seekTo={seekTo}
                            showControlsUI={showControlsUI}
                        />
                    </Animated.View>
                )}
            </Animated.View>
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
    webrtcCloseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
});

export default VideoPlayerScreen;
