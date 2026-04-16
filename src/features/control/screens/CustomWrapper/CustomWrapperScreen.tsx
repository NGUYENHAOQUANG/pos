import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/styles/themeContext';
import { colors, Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import Toast from 'react-native-toast-message';
import CheckCircleFilled from '@/assets/Icon/CheckCircleFilled.svg';
import VideoPlayerBg from '@/assets/Icon/IconDevices/VideoPlayer.svg';
import { RTCView } from 'react-native-webrtc';
import { useWebRTCStream } from '@/features/control/screens/camera/hooks/useWebRTCStream';
import { useIsFocused } from '@react-navigation/native';
import { cameraApi, CameraItem } from '@/features/control/api/cameraApi';
import { useCameras } from '@/features/control/hooks/useCameras';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { checkNetworkForHD } from '@/shared/utils/networkUtils';
import { handleError } from '@/shared/utils/errorHandler';
import {
    getLocationCategoryName,
    getCameraStatusColor,
    getCameraStatusText,
} from '@/features/control/utils/cameraUtils';

type WrapperAction = 'raise' | 'lower';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const VIDEO_HEIGHT = VIDEO_WIDTH * 0.56;

const CustomCameraPreview: React.FC<{
    camera: CameraItem;
    onPress: (camera: CameraItem) => void;
}> = ({ camera, onPress }) => {
    const theme = useAppTheme();
    const isFocused = useIsFocused();
    const isOnline = camera.status === 'On';

    const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);

    React.useEffect(() => {
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
        isOnline && isFocused && localStreamUrl ? localStreamUrl : '',
        { enableAudio: false }
    );

    const skeletonColor = theme.isDark ? theme.background : theme.gray[200];

    if (isOnline && (!localStreamUrl || !isConnected)) {
        return (
            <View style={previewStyles.container}>
                <Skeleton
                    width={VIDEO_WIDTH}
                    height={VIDEO_HEIGHT}
                    borderRadius={12}
                    backgroundColor={skeletonColor}
                />
            </View>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            disabled={!isOnline}
            onPress={() => onPress(camera)}
            style={previewStyles.container}
        >
            <View
                style={[
                    previewStyles.placeholderBg,
                    { backgroundColor: theme.backgroundSecondary },
                ]}
            >
                {localStreamUrl && stream ? (
                    <RTCView
                        streamURL={stream.toURL()}
                        style={previewStyles.snapshotImage}
                        objectFit="cover"
                        zOrder={0}
                    />
                ) : (
                    <VideoPlayerBg
                        width={VIDEO_WIDTH}
                        height={VIDEO_HEIGHT}
                        preserveAspectRatio="xMidYMid slice"
                        color={theme.border}
                    />
                )}

                <View style={previewStyles.badgesRow}>
                    {isOnline && (
                        <View
                            style={[previewStyles.liveBadge, { backgroundColor: theme.red[500] }]}
                        >
                            <View style={previewStyles.liveDot} />
                            <Text style={previewStyles.liveBadgeText}>LIVE</Text>
                        </View>
                    )}
                    {!!camera.pondName && (
                        <View
                            style={[
                                previewStyles.infoBadge,
                                { backgroundColor: theme.cameraOverlay },
                            ]}
                        >
                            <Text style={previewStyles.infoBadgeText} numberOfLines={1}>
                                {camera.deviceCode}
                            </Text>
                        </View>
                    )}
                    <View
                        style={[previewStyles.infoBadge, { backgroundColor: theme.cameraOverlay }]}
                    >
                        <Text style={previewStyles.infoBadgeText} numberOfLines={1}>
                            {getLocationCategoryName(camera.locationCategory)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const CustomWrapperScreen: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
    const route = useRoute<RouteProp<ControlStackParamList, 'CustomWrapper'>>();
    const { setTabBarVisible } = useTabBarVisibility();

    const { deviceId: _deviceId, pondName } = route.params;
    const [action, setAction] = useState<WrapperAction>('raise');
    const [isExecuting, setIsExecuting] = useState(false);

    const { data: cameras = [], isLoading: isLoadingCameras } = useCameras();

    // Filter cameras by pond, prioritize FeedingTray type for wrapper device
    const activeCamera = useMemo(() => {
        const pondCameras = cameras.filter(cam => cam.pondName === pondName);
        return pondCameras.find(cam => cam.cameraType === 'FeedingTray') ?? pondCameras[0] ?? null;
    }, [cameras, pondName]);

    const cameraInfo = useMemo(() => {
        if (!activeCamera) return null;
        return {
            code: activeCamera.deviceCode || activeCamera.modelCode,
            area: activeCamera.pondName || pondName,
            rawStatus: activeCamera.status,
        };
    }, [activeCamera, pondName]);

    const isRaised = false;

    const statusMessage = isRaised
        ? 'Nhá đang ở vị trí trên mặt ao — sẵn sàng hạ'
        : 'Nhá đang ở vị trí dưới ao — sẵn sàng nâng';

    React.useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const handleExecute = useCallback(async () => {
        if (isExecuting) return;
        setIsExecuting(true);

        try {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: action === 'raise' ? 'Đã gửi lệnh nâng nhá' : 'Đã gửi lệnh hạ nhá',
                visibilityTime: 2000,
            });

            navigation.goBack();
        } catch (err) {
            handleError(err);
        } finally {
            setIsExecuting(false);
        }
    }, [action, isExecuting, navigation]);

    const handleCameraPress = useCallback(
        async (camera: CameraItem) => {
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
            } catch (err) {
                handleError(err);
            }
        },
        [navigation, pondName]
    );

    const handleCancel = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <HeaderDevices title="Tùy chỉnh Nhá" onBackPress={handleCancel} />

            <ScrollView
                style={staticStyles.flex1}
                contentContainerStyle={staticStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isLoadingCameras || !activeCamera ? (
                    <Skeleton
                        width={'100%'}
                        height={200}
                        borderRadius={12}
                        style={{ marginBottom: spacing.sm }}
                    />
                ) : (
                    <CustomCameraPreview camera={activeCamera} onPress={handleCameraPress} />
                )}

                {cameraInfo && (
                    <View style={styles.infoTable}>
                        <View style={[styles.infoColumn, { width: '65%' }]}>
                            <Text style={[styles.infoLabel, { color: theme.text }]}>Mã cam</Text>
                            <Text
                                style={[styles.infoValue, { color: theme.text }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {cameraInfo.code}
                            </Text>
                        </View>
                        <View style={[styles.infoColumn, { width: '35%', paddingLeft: 8 }]}>
                            <Text style={[styles.infoLabel, { color: theme.text }]}>Tên ao</Text>
                            <Text
                                style={[styles.infoValue, { color: theme.text }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {cameraInfo.area}
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
                                        {
                                            backgroundColor: getCameraStatusColor(
                                                cameraInfo.rawStatus,
                                                theme
                                            ),
                                        },
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.infoStatusText,
                                        {
                                            color: getCameraStatusColor(
                                                cameraInfo.rawStatus,
                                                theme
                                            ),
                                        },
                                    ]}
                                >
                                    {getCameraStatusText(cameraInfo.rawStatus)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Cấu hình máy</Text>

                    <Text style={styles.fieldLabel}>Chế độ hoạt động</Text>
                    <Text style={styles.fieldSubLabel}>Chọn loại hoạt động</Text>

                    <RadioButton
                        options={[
                            { label: 'Nâng nhá', value: 'raise' as WrapperAction },
                            { label: 'Hạ nhá', value: 'lower' as WrapperAction },
                        ]}
                        value={action}
                        onValueChange={val => {
                            setAction(val as WrapperAction);
                            Toast.show({
                                type: 'success',
                                text1:
                                    val === 'raise' ? 'Đã đổi sang Nâng nhá' : 'Đã đổi sang Hạ nhá',
                                visibilityTime: 2000,
                            });
                        }}
                    />
                </View>

                <View style={styles.statusCard}>
                    <CheckCircleFilled width={22} height={22} color={theme.status.activeText} />
                    <Text style={styles.statusText}>{statusMessage}</Text>
                </View>
            </ScrollView>

            <ButtonBar
                mode="double"
                primaryTitle={isExecuting ? 'Đang xử lý...' : 'Thực hiện hành động'}
                secondaryTitle="Hủy"
                onPrimaryPress={handleExecute}
                onSecondaryPress={handleCancel}
                primaryButtonDisabled={isExecuting}
                primaryButtonLoading={isExecuting}
                secondaryButtonDisabled={isExecuting}
            />
        </View>
    );
};

const staticStyles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
});

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        infoTable: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            rowGap: 16,
            borderWidth: 1,
            borderRadius: 16,
            overflow: 'hidden',
            marginTop: 8,
            marginBottom: spacing.sm,
            paddingVertical: 16,
            paddingHorizontal: 16,
            backgroundColor: theme.background,
            borderColor: theme.borderDark ? theme.borderDark : theme.border,
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
        infoStatusText: {
            fontSize: 14,
            fontWeight: '400',
        },
        statusText: {
            flex: 1,
            fontSize: 14,
            color: theme.text,
            fontWeight: '500',
            lineHeight: 20,
        },
        card: {
            backgroundColor: theme.background,
            padding: 16,
            marginBottom: spacing.sm,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
            lineHeight: 20,
            marginBottom: 16,
        },
        fieldLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            lineHeight: 20,
            marginBottom: 4,
        },
        fieldSubLabel: {
            fontSize: 14,
            color: theme.textSecondary,
            fontWeight: '400',
            lineHeight: 20,
            marginBottom: 16,
        },
        statusCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.background,
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 10,
        },
    });

const previewStyles = StyleSheet.create({
    container: {
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    placeholderBg: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    snapshotImage: {
        width: '100%',
        height: '100%',
    },
    badgesRow: {
        position: 'absolute',
        top: 15,
        left: 8,
        right: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.white,
    },
    liveBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '800',
    },
    infoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        flexShrink: 1,
    },
    infoBadgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
});
