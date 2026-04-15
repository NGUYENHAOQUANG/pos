import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
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
import { CameraCard } from '@/features/control/components/camera/CameraCard';
import { cameraApi, CameraItem } from '@/features/control/api/cameraApi';
import { useCameras } from '@/features/control/hooks/useCameras';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { checkNetworkForHD } from '@/shared/utils/networkUtils';
import { handleError } from '@/shared/utils/errorHandler';

type WrapperAction = 'raise' | 'lower';

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
            code: activeCamera.deviceCode,
            area: activeCamera.name || pondName,
            status: activeCamera.status === 'On' ? 'Online' : 'Offline',
            time: pondName,
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
                    <CameraCard camera={activeCamera} onPress={handleCameraPress} />
                )}

                {cameraInfo && (
                    <View style={styles.cameraInfoCard}>
                        <View style={staticStyles.infoItem}>
                            <Text style={styles.infoLabel}>Mã cam</Text>
                            <Text style={styles.infoValue}>{cameraInfo.code}</Text>
                        </View>
                        <View style={staticStyles.infoItem}>
                            <Text style={styles.infoLabel}>Khu vực</Text>
                            <Text style={styles.infoValue}>{cameraInfo.area}</Text>
                        </View>
                        <View style={staticStyles.infoItem}>
                            <Text style={styles.infoLabel}>Trạng thái</Text>
                            <View style={staticStyles.statusRow}>
                                <View
                                    style={[
                                        staticStyles.statusDot,
                                        {
                                            backgroundColor:
                                                cameraInfo.status === 'Online'
                                                    ? theme.status.activeText
                                                    : theme.status.warningText,
                                        },
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.statusOnlineText,
                                        {
                                            color:
                                                cameraInfo.status === 'Online'
                                                    ? theme.status.activeText
                                                    : theme.status.warningText,
                                        },
                                    ]}
                                >
                                    {cameraInfo.status}
                                </Text>
                            </View>
                        </View>
                        <View style={staticStyles.infoItem}>
                            <Text style={styles.infoLabel}>Thời gian</Text>
                            <Text style={styles.infoValue}>{cameraInfo.time}</Text>
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
    infoItem: {
        flex: 1,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        cameraInfoCard: {
            flexDirection: 'row',
            backgroundColor: theme.background,
            paddingHorizontal: 14,
            paddingVertical: 12,
            gap: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: spacing.sm,
        },
        infoLabel: {
            fontSize: 14,
            color: theme.textSecondary,
            fontWeight: '400',
            lineHeight: 20,
        },
        infoValue: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '600',
            lineHeight: 20,
        },
        statusOnlineText: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 18,
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
        statusText: {
            flex: 1,
            fontSize: 14,
            color: theme.text,
            fontWeight: '500',
            lineHeight: 20,
        },
    });
