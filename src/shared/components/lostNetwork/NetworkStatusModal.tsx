import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, AppState, AppStateStatus } from 'react-native';
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

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const connected = state.isConnected;

            // If currently disconnected
            if (connected === false) {
                setStatusType('lost');
                setVisible(true);
            }
            // If connected now but was previously disconnected
            else if (connected === true && prevConnectedRef.current === false) {
                setStatusType('restored');
                setVisible(true);

                // Auto hide after 2 seconds
                setTimeout(() => {
                    setVisible(false);
                }, 2000);
            }

            prevConnectedRef.current = connected;
        });

        return () => unsubscribe();
    }, []);

    // Khi app trở lại foreground (vd: thoát camera, quay từ màn hình khác)
    // cần kiểm tra lại mạng vì event NetInfo có thể bị bỏ qua khi app ở background
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                NetInfo.fetch().then((state: NetInfoState) => {
                    const connected = state.isConnected;
                    if (connected === false) {
                        setStatusType('lost');
                        setVisible(true);
                        prevConnectedRef.current = false;
                    } else {
                        prevConnectedRef.current = true;
                    }
                });
            }
        });
        return () => subscription.remove();
    }, []);

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible}>
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
