import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';

import { ButtonMaterialList } from '@/features/material/components/material/ButtonMaterialList';

interface HelpOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    onPressUserManual: () => void;
    onPressDeviceExplanation: () => void;
}

export const HelpOptionsModal: React.FC<HelpOptionsModalProps> = ({
    visible,
    onClose,
    onPressUserManual,
    onPressDeviceExplanation,
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <View style={styles.content}>
                                <ButtonMaterialList
                                    title="Hướng dẫn sử dụng"
                                    onPress={onPressUserManual}
                                    icon={
                                        <Ionicons
                                            name="book-outline"
                                            size={20}
                                            color={colors.text}
                                        />
                                    }
                                    style={styles.customButton}
                                    textStyle={styles.customButtonText}
                                />

                                <View style={styles.divider} />

                                <ButtonMaterialList
                                    title="Giải thích các thiết bị"
                                    onPress={onPressDeviceExplanation}
                                    icon={
                                        <Ionicons
                                            name="hardware-chip-outline"
                                            size={20}
                                            color={colors.text}
                                        />
                                    }
                                    style={styles.customButton}
                                    textStyle={styles.customButtonText}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: spacing.md,
    },
    container: {
        width: 250, // Slightly wider to fit icon + text
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 16,
        backgroundColor: colors.white,
    },
    content: {
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingVertical: spacing.xs,
        overflow: 'hidden',
    },
    // Override ButtonMaterialList styles to match popup look
    customButton: {
        borderWidth: 0, // Remove border
        backgroundColor: 'transparent',
        paddingVertical: spacing.md,
        borderRadius: 0,
        justifyContent: 'flex-start',
    },
    customButtonText: {
        fontSize: 15,
        fontWeight: '400',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginHorizontal: spacing.md,
    },
});
