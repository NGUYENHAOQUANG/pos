import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';
import { useAppUpdate } from '@/features/app-update/hooks/useAppUpdate';
import MebiEcoLogo from '@/assets/MebiEco-Logo.svg';

export const UpdateModal: React.FC = () => {
    const { needsUpdate, openStore, currentVersion, storeVersion } = useAppUpdate();

    if (!needsUpdate) return null;

    return (
        <Modal visible={true} transparent={true} animationType="fade" statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <MebiEcoLogo width={60} height={60} />
                    </View>
                    <Text style={styles.title}>Đã có phiên bản mới!</Text>
                    <Text style={styles.description}>
                        Phiên bản hiện tại: <Text style={styles.versionText}>{currentVersion}</Text>
                        {'\n'}
                        Phiên bản mới nhất: <Text style={styles.versionText}>{storeVersion}</Text>
                    </Text>
                    <Text style={styles.message}>
                        Vui lòng cập nhật ứng dụng để trải nghiệm những tính năng mới nhất.
                    </Text>
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={openStore}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.updateButtonText}>Cập nhật ngay</Text>
                    </TouchableOpacity>
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
        padding: spacing.md,
    },
    container: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        alignItems: 'center',
        alignSelf: 'center',
    },
    iconContainer: {
        marginBottom: spacing.md,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.md,
        textAlign: 'center',
        lineHeight: 20,
    },
    versionText: {
        fontWeight: '700',
        color: colors.text,
    },
    message: {
        fontSize: 15,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    updateButton: {
        width: '100%',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
