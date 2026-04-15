import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    AppState,
    ActivityIndicator,
    TouchableWithoutFeedback,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useVideoOrientation } from '@/features/control/screens/camera/hooks/useVideoOrientation';
import { useVideoControls } from '@/features/control/screens/camera/hooks/useVideoControls';
import { VideoTopBar } from '@/features/control/screens/camera/components/VideoTopBar';
import { RTCView } from 'react-native-webrtc';
import { useWebRTCStream } from '@/features/control/screens/camera/hooks/useWebRTCStream';
import { Text } from '@/shared/components/typography/Text';

type VideoPlayerRouteProp = RouteProp<AppStackParamList, 'CameraPlayer'>;

export const VideoPlayerScreen: React.FC = () => {
    const route = useRoute<VideoPlayerRouteProp>();
    const navigation = useNavigation<any>();
    const { videoUrl, cameraName, pondName, isHd, deviceCode } = route.params;

    const { contentAnimatedStyle, handleClose } = useVideoOrientation();

    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (navigation.pop) {
                    navigation.pop();
                } else if (navigation.canGoBack()) {
                    navigation.goBack();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [navigation]);

    const { stream, error, statusText, isConnected, progress } = useWebRTCStream(videoUrl);
    const { showControls, controlsAnimatedStyle, toggleControls } = useVideoControls();

    const [isFullView, setIsFullView] = useState(false);

    const onPinchStateChange = (event: any) => {
        if (event.nativeEvent.state === 5) {
            // State.END = 5
            if (event.nativeEvent.scale > 1.1) {
                setIsFullView(true);
            } else if (event.nativeEvent.scale < 0.9) {
                setIsFullView(false);
            }
        }
    };

    return (
        <GestureHandlerRootView style={styles.root}>
            <Animated.View style={[styles.container, contentAnimatedStyle]}>
                {error ? (
                    <View style={styles.centered}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <>
                        <PinchGestureHandler onHandlerStateChange={onPinchStateChange}>
                            <Animated.View style={styles.videoContainer}>
                                <TouchableWithoutFeedback onPress={toggleControls}>
                                    <View style={styles.touchTarget}>
                                        {stream && (
                                            <RTCView
                                                streamURL={stream.toURL()}
                                                style={styles.video}
                                                objectFit={isFullView ? 'cover' : 'contain'}
                                            />
                                        )}
                                    </View>
                                </TouchableWithoutFeedback>
                            </Animated.View>
                        </PinchGestureHandler>

                        {(!stream || !isConnected) && (
                            <View style={styles.centeredOverlay} pointerEvents="none">
                                <ActivityIndicator size="large" color={colors.white} />
                                <Text style={styles.loadingText}>
                                    {statusText} {progress > 0 ? `(${progress}%)` : ''}
                                </Text>
                            </View>
                        )}
                    </>
                )}

                {/* Auto-hiding top bar overlay */}
                <Animated.View
                    style={[styles.overlayBar, controlsAnimatedStyle]}
                    pointerEvents={showControls ? 'box-none' : 'none'}
                >
                    <VideoTopBar
                        pondName={pondName}
                        cameraName={cameraName}
                        onClose={handleClose}
                        isHd={isHd}
                        deviceCode={deviceCode}
                    />
                </Animated.View>
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
    videoContainer: {
        width: '100%',
        height: '100%',
    },
    touchTarget: {
        width: '100%',
        height: '100%',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    centered: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 5,
    },
    loadingText: {
        color: colors.white,
        marginTop: 12,
        fontSize: 16,
    },
    errorText: {
        color: colors.error,
        fontSize: 16,
        paddingHorizontal: 24,
        textAlign: 'center',
    },
    overlayBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
});

export default VideoPlayerScreen;
