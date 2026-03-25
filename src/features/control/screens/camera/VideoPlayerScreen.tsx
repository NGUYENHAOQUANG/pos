import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, RouteProp } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import ViewShot from 'react-native-view-shot';
import { useVideoOrientation } from '@/features/control/screens/camera/hooks/useVideoOrientation';
import { useVideoSnapshot } from '@/features/control/screens/camera/hooks/useVideoSnapshot';
import { VideoTopBar } from '@/features/control/screens/camera/components/VideoTopBar';

type VideoPlayerRouteProp = RouteProp<AppStackParamList, 'CameraPlayer'>;

/**
 * Full-screen landscape camera viewer.
 * Uses WebView to render MJPEG stream via native browser engine.
 * Near-instant playback, no VLC dependency needed.
 */
export const VideoPlayerScreen: React.FC = () => {
    const route = useRoute<VideoPlayerRouteProp>();
    const { videoUrl, cameraName, pondName } = route.params;

    const viewShotRef = useRef<ViewShot>(null);

    const { contentAnimatedStyle, handleClose } = useVideoOrientation();
    const { handleSnapshot } = useVideoSnapshot({ cameraName, viewShotRef });

    const mjpegHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        img { width: 100%; height: 100%; object-fit: contain; }
    </style>
</head>
<body>
    <img src="${videoUrl}" alt="Camera Stream" />
</body>
</html>`;

    return (
        <GestureHandlerRootView style={styles.root}>
            <Animated.View style={[styles.container, contentAnimatedStyle]}>
                <ViewShot
                    ref={viewShotRef}
                    options={{ format: 'jpg', quality: 0.95 }}
                    style={styles.video}
                >
                    <WebView
                        source={{ html: mjpegHtml }}
                        style={styles.video}
                        javaScriptEnabled={false}
                        scrollEnabled={false}
                        bounces={false}
                        mediaPlaybackRequiresUserAction={false}
                        allowsInlineMediaPlayback={true}
                        mixedContentMode="always"
                        originWhitelist={['*']}
                    />
                </ViewShot>

                {/* Close + snapshot overlay */}
                <View style={styles.overlayBar} pointerEvents="box-none">
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
    video: {
        width: '100%',
        height: '100%',
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
