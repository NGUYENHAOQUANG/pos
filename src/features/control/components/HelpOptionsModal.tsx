import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Platform,
    TouchableWithoutFeedback,
    Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';
import { ButtonMaterialList } from '@/features/material/components/material_form/ButtonMaterialList';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface HelpOptionsModalRef {
    open: (position: { x: number; y: number; width: number; height: number }) => void;
    close: () => void;
}

interface HelpOptionsModalProps {
    onPressUserManual: () => void;
    onPressDeviceExplanation: () => void;
}

export const HelpOptionsModal = forwardRef<HelpOptionsModalRef, HelpOptionsModalProps>(
    ({ onPressUserManual, onPressDeviceExplanation }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [buttonPosition, setButtonPosition] = useState<{
            x: number;
            y: number;
            width: number;
            height: number;
        } | null>(null);

        useImperativeHandle(ref, () => ({
            open: pos => {
                setButtonPosition(pos);
                setIsOpen(true);
            },
            close: () => {
                setIsOpen(false);
            },
        }));

        const onClose = () => setIsOpen(false);

        // Calculate position
        const safePosition = buttonPosition || { x: 0, y: 0, width: 0, height: 0 };
        const menuRight = SCREEN_WIDTH - safePosition.x - safePosition.width;
        const menuTop = safePosition.y + safePosition.height + 4;

        return (
            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={onClose}
                onDismiss={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay}>
                        <View
                            style={[
                                styles.menuContainer,
                                {
                                    top: menuTop,
                                    right: menuRight,
                                },
                            ]}
                        >
                            <View style={styles.content}>
                                <ButtonMaterialList
                                    title="Hướng dẫn sử dụng"
                                    onPress={() => {
                                        onClose();
                                        onPressUserManual();
                                    }}
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
                                    onPress={() => {
                                        onClose();
                                        onPressDeviceExplanation();
                                    }}
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
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: 16, // Kept 16 from previous design
        paddingVertical: spacing.xs,
        minWidth: 250, // Kept 250 from previous design
        zIndex: 1001,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    content: {
        overflow: 'hidden',
        borderRadius: 16,
    },
    // Override ButtonMaterialList styles
    customButton: {
        borderWidth: 0,
        backgroundColor: 'transparent',
        paddingVertical: spacing.md,
        borderRadius: 0,
        justifyContent: 'flex-start',
    },
    customButtonText: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginHorizontal: spacing.md,
    },
});
