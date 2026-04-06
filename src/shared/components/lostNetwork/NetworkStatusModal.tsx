import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, AppState, AppStateStatus, Modal } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { colors, spacing, borderRadius } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export const NetworkStatusModal = () => {
    const [visible, setVisible] = useState(false);
    const [statusType, setStatusType] = useState<'lost' | 'restored'>('lost');

    // Track previous status to detect restoration
    // Initialize as true to avoid showing "Restored" on app launch if connected
    const prevConnectedRef = useRef<boolean | null>(true);

    // Timers
    const lostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const restoredTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Dọn dẹp timer
    const clearTimers = () => {
        if (lostTimerRef.current) clearTimeout(lostTimerRef.current);
        if (restoredTimerRef.current) clearTimeout(restoredTimerRef.current);
        lostTimerRef.current = null;
        restoredTimerRef.current = null;
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            // Đôi khi isConnected có thể null (unknown state), ta chỉ xử lý khi nó thực sự true hoặc false
            if (state.isConnected === null) return;

            const connected = state.isConnected;

            // Nếu mất kết nối
            if (connected === false) {
                // Xoá mọi timer báo Khôi phục nếu đứt mạng lại
                if (restoredTimerRef.current) clearTimeout(restoredTimerRef.current);

                // Set timeout: Nếu rớt mạng quá 1 giây mới báo, tránh chớp nháy (blip) mạng trên iOS gây đóng băng
                if (!lostTimerRef.current && prevConnectedRef.current !== false) {
                    lostTimerRef.current = setTimeout(() => {
                        setStatusType('lost');
                        setVisible(true);
                        prevConnectedRef.current = false;
                    }, 1000); // 1s delay
                }
            }
            // Nếu có kết nối lại
            else if (connected === true) {
                // Huỷ báo mất mạng nếu mạng có lại ngay lặp tức
                if (lostTimerRef.current) {
                    clearTimeout(lostTimerRef.current);
                    lostTimerRef.current = null;
                }

                if (prevConnectedRef.current === false) {
                    // Update state inside a timeout to prevent React thread freezing from native events on iOS
                    setTimeout(() => {
                        setStatusType('restored');
                        setVisible(true);
                        prevConnectedRef.current = true;

                        // Tự động ẩn sau 1.5s
                        restoredTimerRef.current = setTimeout(() => {
                            setVisible(false);
                            restoredTimerRef.current = null;
                        }, 1500);
                    }, 0);
                }
            }
        });

        return () => {
            unsubscribe();
            clearTimers();
        };
    }, []);

    // Kiểm tra mạng khi app từ background quay lại (Active)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                NetInfo.fetch().then((state: NetInfoState) => {
                    if (state.isConnected === null) return;
                    const connected = state.isConnected;

                    if (connected === false) {
                        if (restoredTimerRef.current) clearTimeout(restoredTimerRef.current);
                        if (!lostTimerRef.current && prevConnectedRef.current !== false) {
                            lostTimerRef.current = setTimeout(() => {
                                setStatusType('lost');
                                setVisible(true);
                                prevConnectedRef.current = false;
                            }, 500);
                        }
                    } else if (connected === true) {
                        if (lostTimerRef.current) {
                            clearTimeout(lostTimerRef.current);
                            lostTimerRef.current = null;
                        }

                        if (prevConnectedRef.current === false) {
                            setTimeout(() => {
                                setStatusType('restored');
                                setVisible(true);
                                prevConnectedRef.current = true;

                                restoredTimerRef.current = setTimeout(() => {
                                    setVisible(false);
                                    restoredTimerRef.current = null;
                                }, 1500);
                            }, 0);
                        } else {
                            // Đảm bảo ẩn modal nếu đã có mạng từ trước
                            setVisible(false);
                        }
                    }
                });
            }
        });

        return () => subscription.remove();
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {statusType === 'lost' ? (
                        <>
                            <View
                                style={[styles.iconContainer, { backgroundColor: colors.red[50] }]}
                            >
                                <Ionicons name="cloud-offline" size={32} color={colors.red[600]} />
                            </View>
                            <Text style={styles.title}>Mất kết nối mạng</Text>
                            <Text style={styles.message}>
                                Vui lòng kiểm tra lại đường truyền internet của bạn để tiếp tục sử
                                dụng ứng dụng.
                            </Text>
                        </>
                    ) : (
                        <>
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: colors.green[50] },
                                ]}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={32}
                                    color={colors.green[600]}
                                />
                            </View>
                            <Text style={styles.title}>Đã kết nối lại</Text>
                            <Text style={styles.message}>Kết nối mạng đã ổn định.</Text>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    container: {
        width: width - 48,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
