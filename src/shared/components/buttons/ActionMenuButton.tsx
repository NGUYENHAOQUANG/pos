import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius, shadows } from '@/styles';

export interface ActionMenuItem {
    label: string;
    onPress: () => void;
    danger?: boolean; // Red text for delete variants
}

export interface ActionMenuPosition {
    top?: number;
    bottom?: number;
    right?: number;
    left?: number;
}

interface ActionMenuProps {
    visible: boolean;
    onClose: () => void;
    position: ActionMenuPosition;
    items: ActionMenuItem[];
    width?: number;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
    visible,
    onClose,
    position,
    items,
    width,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onDismiss={onClose}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View
                        style={[
                            styles.menu,
                            width ? { width } : { minWidth: 180, maxWidth: 250 },
                            position.right !== undefined ? { right: position.right } : {},
                            position.left !== undefined ? { left: position.left } : {},
                            position.top !== undefined ? { top: position.top } : {},
                            position.bottom !== undefined ? { bottom: position.bottom } : {},
                        ]}
                    >
                        {items.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => {
                                    // Close menu before executing action ? Or let action handle it?
                                    // Usually generic menu should close on press.
                                    // User code often does handleClose() anyway.
                                    // Let's rely on caller or modify this if needed.
                                    // But typically user expects one tap to trigger.
                                    item.onPress();
                                }}
                            >
                                <Text style={[styles.menuText, item.danger && styles.deleteText]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// Helper logic for positioning
export const getMenuPosition = (
    pageY: number,
    height: number,
    windowHeight: number,
    menuHeightApprox: number = 200 // Estimate
): { top?: number; bottom?: number } => {
    // Check if menu would go off screen
    if (pageY + height + menuHeightApprox > windowHeight) {
        // Position above the button
        return { bottom: windowHeight - pageY + 4 }; // 4px spacing
    } else {
        // Position below
        return { top: pageY + height + 4 };
    }
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    menu: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        ...shadows.md,
        paddingVertical: spacing.xs,
        elevation: 8,
    },
    menuItem: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    menuText: {
        fontSize: 14,
        color: colors.text,
    },
    deleteText: {
        color: colors.error,
    },
});
