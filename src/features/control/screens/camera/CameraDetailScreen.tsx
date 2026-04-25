import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Animated,
    StatusBar,
    BackHandler,
} from 'react-native';
import { RouteProp, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, colors } from '@/styles/colors';
import { Text } from '@/shared/components/typography/Text';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { cameraApi } from '@/features/control/api/cameraApi';
import { useCameras } from '@/features/control/hooks/useCameras';
import { checkNetworkForHD } from '@/shared/utils/networkUtils';
import {
    getLocationCategoryName,
    getCameraStatusColor,
    getCameraStatusText,
} from '@/features/control/utils/cameraUtils';
import VideoPlayerBg from '@/assets/Icon/IconDevices/VideoPlayer.svg';
import FullscreenIcon from '@/assets/Icon/IconDevices/Fullscreen.svg';
// import PlayButtonIcon from '@/assets/Icon/IconDevices/Playbutton.svg';
import { RTCView } from 'react-native-webrtc';
import { useWebRTCStream } from '@/features/control/screens/camera/hooks/useWebRTCStream';
import { CameraDetailSkeleton } from '@/features/control/components/skeleton/CameraDetailSkeleton';
import Orientation from 'react-native-orientation-locker';
import { PinchGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { VideoTopBar } from '@/features/control/screens/camera/components/VideoTopBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const VIDEO_HEIGHT = VIDEO_WIDTH * 0.56;

type CameraDetailRouteProp = RouteProp<AppStackParamList, 'CameraDetail'>;

export const CameraDetailScreen: React.FC = () => {
    const theme = useAppTheme();
    const route = useRoute<CameraDetailRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const styles = getStyles(theme);

    const { camera: routeCamera } = route.params;
    const { data: cameras = [], refetch, isRefetching } = useCameras();

    // Use fresh data from query cache if available, fallback to route params
    const camera = useMemo(() => {
        return cameras.find(c => c.deviceCode === routeCamera.deviceCode) ?? routeCamera;
    }, [cameras, routeCamera]);

    const isOnline = camera.status === 'On';

    const pondName = camera.pondName || 'Khu vực chưa phân bổ';

    // Call API stream to get URL
    const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);
    const [isStreamHd, setIsStreamHd] = useState<boolean>(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        let isMounted = true;
        if (!isOnline || !isFocused) {
            setLocalStreamUrl(null);
            return;
        }

        checkNetworkForHD().then(isHd => {
            if (!isMounted) return;
            setIsStreamHd(isHd);
            cameraApi
                .getStream(camera.deviceCode, isHd)
                .then(res => {
                    if (isMounted && res.data?.data?.url) {
                        setLocalStreamUrl(res.data.data.url);
                    }
                })
                .catch(() => {});
        });

        return () => {
            isMounted = false;
        };
    }, [camera.deviceCode, isOnline, isFocused]);

    const { stream, isConnected } = useWebRTCStream(
        isOnline && isFocused && localStreamUrl ? localStreamUrl : ''
    );

    // Track when WebRTC first frame is ready
    const [isVideoReady, setIsVideoReady] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [isSkeletonVisible, setIsSkeletonVisible] = useState(isOnline);

    useEffect(() => {
        if (!isOnline) {
            fadeAnim.setValue(0);
            setIsSkeletonVisible(false);
            return;
        }

        if (isVideoReady) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                setIsSkeletonVisible(false);
            });
        } else {
            fadeAnim.setValue(1);
            setIsSkeletonVisible(true);
        }
    }, [isVideoReady, isOnline, fadeAnim]);

    useEffect(() => {
        if (!isConnected) {
            setIsVideoReady(false);
        }
    }, [isConnected]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isFullZoom, setIsFullZoom] = useState(false); // for pinch to zoom 'cover' vs 'contain'

    const handleToggleFullscreen = useCallback(() => {
        if (!isFullscreen) {
            Orientation.lockToLandscape();
            StatusBar.setHidden(true);
            setIsFullscreen(true);
        } else {
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
            setIsFullscreen(false);
        }
    }, [isFullscreen]);

    // Back handler for fullscreen
    useEffect(() => {
        const backAction = () => {
            if (isFullscreen) {
                handleToggleFullscreen();
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isFullscreen, handleToggleFullscreen]);

    // Clean up orientation lock on unmount
    useEffect(() => {
        return () => {
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
        };
    }, []);

    const onPinchStateChange = (event: any) => {
        if (event.nativeEvent.state === 5) {
            // State.END = 5
            if (event.nativeEvent.scale > 1.1) {
                setIsFullZoom(true);
            } else if (event.nativeEvent.scale < 0.9) {
                setIsFullZoom(false);
            }
        }
    };

    // The stream is active if we are online and focused.
    // If the stream is still initializing and we need to show the skeleton:

    return (
        <GestureHandlerRootView
            style={{
                flex: 1,
                backgroundColor: isFullscreen ? colors.black : theme.backgroundPrimary,
            }}
        >
            <View
                style={[
                    styles.container,
                    { backgroundColor: isFullscreen ? colors.black : theme.backgroundPrimary },
                ]}
            >
                {/* Normal View */}
                {!isFullscreen && (
                    <>
                        <HeaderSection title={camera.name} onBack={() => navigation.goBack()} />

                        <ScrollView
                            contentContainerStyle={styles.content}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
                            }
                        >
                            {/* Video Preview Card */}
                            <View style={styles.videoCard}>
                                {/* Snapshot / Placeholder */}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    style={styles.videoPreview}
                                    onPress={handleToggleFullscreen}
                                >
                                    {localStreamUrl && isConnected && stream ? (
                                        <RTCView
                                            streamURL={stream.toURL()}
                                            style={styles.snapshotImage}
                                            objectFit="cover"
                                            zOrder={0}
                                            onDimensionsChange={e => {
                                                if (
                                                    e.nativeEvent.width > 0 &&
                                                    e.nativeEvent.height > 0
                                                ) {
                                                    setIsVideoReady(true);
                                                }
                                            }}
                                        />
                                    ) : camera.snapshotUrl ? (
                                        <Image
                                            source={{ uri: camera.snapshotUrl }}
                                            style={styles.snapshotImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                styles.placeholderBg,
                                                { backgroundColor: theme.background },
                                            ]}
                                        >
                                            <VideoPlayerBg
                                                width={VIDEO_WIDTH}
                                                height={VIDEO_HEIGHT}
                                                preserveAspectRatio="xMidYMid slice"
                                                color={theme.border}
                                            />
                                        </View>
                                    )}
                                    {/* Top-left Badges */}
                                    <View style={styles.badgesRow}>
                                        {isOnline && (
                                            <View style={styles.liveBadge}>
                                                <View style={styles.liveDot} />
                                                <Text style={styles.liveBadgeText}>LIVE</Text>
                                            </View>
                                        )}
                                        <View style={styles.infoBadge}>
                                            <Text style={styles.infoBadgeText}>
                                                {camera.deviceCode}
                                            </Text>
                                        </View>
                                        <View style={styles.infoBadge}>
                                            <Text style={styles.infoBadgeText}>
                                                {getLocationCategoryName(camera.locationCategory)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Center Loading indicator */}
                                    {isOnline && !isConnected && (
                                        <View style={styles.playButton} pointerEvents="none">
                                            <ActivityIndicator size="large" color={theme.white} />
                                        </View>
                                    )}

                                    {/* Bottom-right Fullscreen */}
                                    {isOnline && (
                                        <TouchableOpacity
                                            style={styles.fullscreenButton}
                                            activeOpacity={0.7}
                                            onPress={handleToggleFullscreen}
                                        >
                                            <FullscreenIcon width={24} height={24} />
                                        </TouchableOpacity>
                                    )}

                                    {/* Skeleton overlay - covers everything until first frame is ready */}
                                    {isSkeletonVisible && (
                                        <Animated.View
                                            style={[
                                                StyleSheet.absoluteFillObject,
                                                { opacity: fadeAnim },
                                            ]}
                                            pointerEvents="none"
                                        >
                                            <CameraDetailSkeleton />
                                        </Animated.View>
                                    )}
                                </TouchableOpacity>

                                {/* Info Table */}
                                <View style={styles.infoTable}>
                                    <View style={[styles.infoColumn, { width: '65%' }]}>
                                        <Text style={[styles.infoLabel, { color: theme.text }]}>
                                            Mã cam
                                        </Text>
                                        <Text
                                            style={[styles.infoValue, { color: theme.text }]}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {camera.deviceCode}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.infoColumn,
                                            { width: '35%', paddingLeft: 8 },
                                        ]}
                                    >
                                        <Text style={[styles.infoLabel, { color: theme.text }]}>
                                            Tên ao
                                        </Text>
                                        <Text
                                            style={[styles.infoValue, { color: theme.text }]}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {camera.pondName}
                                        </Text>
                                    </View>
                                    <View
                                        style={[styles.infoColumn, { width: '100%', marginTop: 4 }]}
                                    >
                                        <Text style={[styles.infoLabel, { color: theme.text }]}>
                                            Trạng thái
                                        </Text>
                                        <View style={styles.statusRow}>
                                            <View
                                                style={[
                                                    styles.statusDot,
                                                    {
                                                        backgroundColor: getCameraStatusColor(
                                                            camera.status,
                                                            theme
                                                        ),
                                                    },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    {
                                                        color: getCameraStatusColor(
                                                            camera.status,
                                                            theme
                                                        ),
                                                    },
                                                ]}
                                            >
                                                {getCameraStatusText(camera.status)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </>
                )}

                {/* Fullscreen View */}
                {isFullscreen && (
                    <View style={StyleSheet.absoluteFillObject}>
                        <PinchGestureHandler onHandlerStateChange={onPinchStateChange}>
                            <Animated.View style={StyleSheet.absoluteFillObject}>
                                {localStreamUrl && isConnected && stream ? (
                                    <RTCView
                                        streamURL={stream.toURL()}
                                        style={StyleSheet.absoluteFillObject}
                                        objectFit={isFullZoom ? 'cover' : 'contain'}
                                        zOrder={1}
                                        onDimensionsChange={e => {
                                            if (
                                                e.nativeEvent.width > 0 &&
                                                e.nativeEvent.height > 0
                                            ) {
                                                setIsVideoReady(true);
                                            }
                                        }}
                                    />
                                ) : (
                                    <View
                                        style={[
                                            styles.placeholderBg,
                                            { backgroundColor: theme.background },
                                        ]}
                                    >
                                        <ActivityIndicator size="large" color={theme.white} />
                                    </View>
                                )}
                            </Animated.View>
                        </PinchGestureHandler>

                        <VideoTopBar
                            pondName={pondName}
                            cameraName={camera.name}
                            onClose={handleToggleFullscreen}
                            isHd={isStreamHd}
                            deviceCode={camera.deviceCode}
                        />
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
        },
        videoCard: {
            // Act as a container for video and info without background
        },
        videoPreview: {
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
        },
        snapshotImage: {
            width: '100%',
            height: '100%',
        },
        placeholderBg: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        badgesRow: {
            position: 'absolute',
            top: 15,
            left: 8,
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center',
        },
        liveBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.red[500],
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: borderRadius.full,
            gap: 4,
        },
        liveDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.white,
        },
        liveBadgeText: {
            color: theme.white,
            fontSize: 10,
            fontWeight: '800',
        },
        infoBadge: {
            backgroundColor: theme.cameraOverlay,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 16,
        },
        infoBadgeText: {
            color: theme.white,
            fontSize: 12,
            fontWeight: '500',
        },
        playButton: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -22 }, { translateY: -22 }],
        },
        fullscreenButton: {
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.cameraIconBg,
            justifyContent: 'center',
            alignItems: 'center',
        },
        infoTable: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            rowGap: 16,
            borderWidth: 1,
            borderRadius: 16,
            overflow: 'hidden',
            marginTop: 8,
            paddingVertical: 16,
            paddingHorizontal: 16,
            backgroundColor: theme.background,
            borderColor: theme.borderDark,
        },
        infoColumn: {
            width: '50%',
            gap: 4,
        },
        infoLabel: {
            fontSize: 14,
            fontWeight: '400',
        },
        infoValue: {
            fontSize: 14,
            fontWeight: '600',
        },
        statusRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        statusDot: {
            width: 7,
            height: 7,
            borderRadius: 4,
        },
        statusText: {
            fontSize: 14,
            fontWeight: '400',
        },
    });
