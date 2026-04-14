import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { RouteProp, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import Toast from 'react-native-toast-message';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Text } from '@/shared/components/typography/Text';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { cameraApi } from '@/features/control/api/cameraApi';
import { useCameras } from '@/features/control/hooks/useCameras';
import { checkNetworkForHD } from '@/shared/utils/networkUtils';
import VideoPlayerBg from '@/assets/Icon/IconDevices/VideoPlayer.svg';
import FullscreenIcon from '@/assets/Icon/IconDevices/Fullscreen.svg';
import PlayButtonIcon from '@/assets/Icon/IconDevices/Playbutton.svg';
import { RTCView } from 'react-native-webrtc';
import { useWebRTCStream } from '@/features/control/screens/camera/hooks/useWebRTCStream';

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
    const isFocused = useIsFocused();

    useEffect(() => {
        let isMounted = true;
        if (!isOnline || !isFocused) {
            setLocalStreamUrl(null);
            return;
        }

        checkNetworkForHD().then(isHd => {
            if (!isMounted) return;
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

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handlePlay = async () => {
        if (!isOnline) return;
        try {
            const isHd = await checkNetworkForHD();
            const response = await cameraApi.getStream(camera.deviceCode, isHd);
            const streamData = response.data?.data;
            if (!streamData?.url) {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không lấy được URL stream',
                });
                return;
            }

            navigation.navigate('CameraPlayer', {
                videoUrl: streamData.url,
                cameraName: camera.name,
                pondName: pondName,
                isHd: isHd,
                deviceCode: camera.deviceCode,
            });
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Đã có lỗi xảy ra khi kết nối camera.',
            });
        }
    };

    const getStatusColor = () => {
        switch (camera.status) {
            case 'On':
                return theme.green[600];
            case 'Off':
                return theme.red[600];
            case 'Fault':
                return theme.orange[600];
            default:
                return theme.red[600];
        }
    };

    const getStatusText = () => {
        switch (camera.status) {
            case 'On':
                return 'Online';
            case 'Off':
                return 'Offline';
            case 'Fault':
                return 'Kết nối thất bại';
            case 'Connecting':
                return 'Đang kết nối';
            default:
                return camera.status || 'Offline';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
            <HeaderSection title={camera.name} onBack={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
            >
                {/* Video Preview Card */}
                <View style={styles.videoCard}>
                    {/* Snapshot / Placeholder */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.videoPreview}
                        onPress={handlePlay}
                    >
                        {localStreamUrl && isConnected && stream ? (
                            <RTCView
                                streamURL={stream.toURL()}
                                style={styles.snapshotImage}
                                objectFit="cover"
                                zOrder={0}
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
                                <Text style={styles.infoBadgeText}>{camera.pondName}</Text>
                            </View>
                            <View style={styles.infoBadge}>
                                <Text style={styles.infoBadgeText}>{camera.name}</Text>
                            </View>
                        </View>

                        {/* Center Play Button indicator */}
                        {isOnline && !isConnected && (
                            <View style={styles.playButton} pointerEvents="none">
                                {localStreamUrl ? (
                                    <ActivityIndicator size="large" color="#FFF" />
                                ) : (
                                    <PlayButtonIcon width={44} height={44} />
                                )}
                            </View>
                        )}

                        {/* Bottom-right Fullscreen */}
                        {isOnline && (
                            <TouchableOpacity
                                style={styles.fullscreenButton}
                                activeOpacity={0.7}
                                onPress={handlePlay}
                            >
                                <FullscreenIcon width={24} height={24} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    {/* Info Table */}
                    <View style={styles.infoTable}>
                        <View style={[styles.infoColumn, { width: '65%' }]}>
                            <Text style={[styles.infoLabel, { color: theme.text }]}>Mã cam</Text>
                            <Text
                                style={[styles.infoValue, { color: theme.text }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {camera.modelCode}
                            </Text>
                        </View>
                        <View style={[styles.infoColumn, { width: '35%', paddingLeft: 8 }]}>
                            <Text style={[styles.infoLabel, { color: theme.text }]}>Tên ao</Text>
                            <Text
                                style={[styles.infoValue, { color: theme.text }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {camera.pondName}
                            </Text>
                        </View>
                        <View style={[styles.infoColumn, { width: '100%', marginTop: 4 }]}>
                            <Text style={[styles.infoLabel, { color: theme.text }]}>
                                Trạng thái
                            </Text>
                            <View style={styles.statusRow}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        { backgroundColor: getStatusColor() },
                                    ]}
                                />
                                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                    {getStatusText()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
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
            borderRadius: borderRadius.lg,
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
            backgroundColor: '#EF4444',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            gap: 4,
        },
        liveDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#FFFFFF',
        },
        liveBadgeText: {
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '800',
        },
        infoBadge: {
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 16,
        },
        infoBadgeText: {
            color: '#FFFFFF',
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
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        infoTable: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            rowGap: 16,
            borderWidth: 1,
            borderRadius: borderRadius.lg,
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
