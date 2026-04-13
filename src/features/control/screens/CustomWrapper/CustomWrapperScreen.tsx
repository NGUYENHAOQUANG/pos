import React, { useState, useCallback } from 'react';
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
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import Toast from 'react-native-toast-message';
import CheckCircleFilled from '@/assets/Icon/CheckCircleFilled.svg';
import { CameraCard } from '@/features/control/components/camera/CameraCard';
import { CameraItem } from '@/features/control/api/cameraApi';

// Mock camera thumbnail for demo
const MOCK_CAMERA_THUMBNAIL =
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=400&fit=crop';

type WrapperAction = 'raise' | 'lower';

export const CustomWrapperScreen: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ControlStackParamList, 'CustomWrapper'>>();
    const { setTabBarVisible } = useTabBarVisibility();

    const { deviceId: _deviceId, pondName } = route.params;

    const [action, setAction] = useState<WrapperAction>('raise');
    const [isExecuting, setIsExecuting] = useState(false);

    // ==========================================
    // [TODO]: XÓA ĐOẠN MOCK NÀY KHI CÓ API
    // Hiện tại thiết bị chưa có API trả về thông tin camera và thời gian
    // nên mình mock dữ liệu giả lập cho UI.
    // ==========================================
    const cameraInfo = {
        code: `CAM-${pondName.replace('Ao ', '')}-A`,
        area: pondName,
        status: 'Online',
        time: pondName,
    };

    const mockCameraItem: CameraItem = {
        deviceSn: cameraInfo.code,
        name: cameraInfo.area,
        status: 'On',
        snapshotUrl: MOCK_CAMERA_THUMBNAIL,
    } as CameraItem;
    // ==========================================

    // Determine wrapper position status
    const isRaised = false; // Mock: wrapper is currently lowered

    const statusMessage = isRaised
        ? 'Nhá đang ở vị trí trên mặt ao — sẵn sàng hạ'
        : 'Nhá đang ở vị trí dưới ao — sẵn sàng nâng';

    // Hide tab bar on mount
    React.useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const handleExecute = useCallback(async () => {
        if (isExecuting) return;
        setIsExecuting(true);

        try {
            // Simulate API call
            await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));

            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: action === 'raise' ? 'Đã gửi lệnh nâng nhá' : 'Đã gửi lệnh hạ nhá',
                visibilityTime: 2000,
            });

            navigation.goBack();
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể gửi lệnh điều khiển',
            });
        } finally {
            setIsExecuting(false);
        }
    }, [action, isExecuting, navigation]);

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
                {/* Camera Preview Card */}
                <CameraCard camera={mockCameraItem} onPress={() => {}} />

                {/* Camera Info Card */}
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

                {/* Machine Configuration Card */}
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

                {/* Status Indicator */}
                <View style={styles.statusCard}>
                    <CheckCircleFilled width={22} height={22} color={theme.status.activeText} />
                    <Text style={styles.statusText}>{statusMessage}</Text>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
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

// Static styles (theme-independent)
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

// Dynamic styles (theme-dependent)
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
