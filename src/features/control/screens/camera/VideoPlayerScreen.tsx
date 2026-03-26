import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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

/** Parse URL to extract basic auth credentials if embedded */
interface ParsedAuthUrl {
    cleanUrl: string;
    username: string;
    password: string;
    hasAuth: boolean;
}

const parseAuthFromUrl = (url: string): ParsedAuthUrl => {
    // Match pattern: http(s)://user:pass@host
    const authMatch = url.match(/^(https?:\/\/)([^:]+):([^@]+)@(.+)$/);
    if (authMatch) {
        return {
            cleanUrl: `${authMatch[1]}${authMatch[4]}`,
            username: authMatch[2],
            password: authMatch[3],
            hasAuth: true,
        };
    }
    return { cleanUrl: url, username: '', password: '', hasAuth: false };
};

export const VideoPlayerScreen: React.FC = () => {
    const route = useRoute<VideoPlayerRouteProp>();
    const { videoUrl, cameraName, pondName } = route.params;

    const viewShotRef = useRef<ViewShot>(null);

    const { contentAnimatedStyle, handleClose } = useVideoOrientation();
    const { handleSnapshot } = useVideoSnapshot({ cameraName, viewShotRef });

    const parsedUrl = useMemo(() => parseAuthFromUrl(videoUrl), [videoUrl]);

    // iOS: HTML img tag works with embedded auth in URL
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

    /**
     * Android WebView strips basic auth from <img> sub-resource URLs.
     * Use source={{ uri }} + basicAuthCredential to handle auth natively.
     * iOS works fine with HTML img tag approach.
     */
    const webViewSource =
        Platform.OS === 'android'
            ? { uri: parsedUrl.hasAuth ? parsedUrl.cleanUrl : videoUrl }
            : { html: mjpegHtml };

    const basicAuth = parsedUrl.hasAuth
        ? { username: parsedUrl.username, password: parsedUrl.password }
        : undefined;

    return (
        <GestureHandlerRootView style={styles.root}>
            <Animated.View style={[styles.container, contentAnimatedStyle]}>
                <ViewShot
                    ref={viewShotRef}
                    options={{ format: 'jpg', quality: 0.95 }}
                    style={styles.video}
                >
                    <WebView
                        source={webViewSource}
                        style={styles.video}
                        javaScriptEnabled={false}
                        scrollEnabled={false}
                        bounces={false}
                        mediaPlaybackRequiresUserAction={false}
                        allowsInlineMediaPlayback={true}
                        mixedContentMode="always"
                        originWhitelist={['*']}
                        basicAuthCredential={basicAuth}
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
