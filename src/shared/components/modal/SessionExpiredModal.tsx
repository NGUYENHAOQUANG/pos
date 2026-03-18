import React from 'react';
import { View, StyleSheet, Modal, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '@/shared/components/buttons/Button';

const { width } = Dimensions.get('window');

interface SessionExpiredModalProps {
    visible: boolean;
    onConfirm: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ visible, onConfirm }) => {
    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.red[50] }]}>
                        <Ionicons name="warning-outline" size={32} color={colors.red[600]} />
                    </View>
                    <Text style={styles.title}>Hết phiên đăng nhập</Text>
                    <Text style={styles.message}>
                        Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử
                        dụng ứng dụng.
                    </Text>

                    <Button
                        title="Đăng nhập lại"
                        onPress={onConfirm}
                        fullWidth
                        style={styles.button}
                    />
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
        marginBottom: 24,
    },
    button: {
        marginTop: 8,
    },
});
