import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';

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
                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={onPressUserManual}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name="book-outline"
                                            size={20}
                                            color={colors.text}
                                        />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.optionTitle}>Hướng dẫn sử dụng</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={onPressDeviceExplanation}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name="hardware-chip-outline"
                                            size={20}
                                            color={colors.text}
                                        />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.optionTitle}>
                                            Giải thích các thiết bị
                                        </Text>
                                    </View>
                                </TouchableOpacity>
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
    header: {
        display: 'none',
    },
    titleContainer: {
        display: 'none',
    },
    title: {
        display: 'none',
    },
    closeButton: {
        display: 'none',
    },
    optionsContainer: {
        padding: 0,
    },
    optionButton: {
        flexDirection: 'row', // Row layout for icon + text
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    iconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text,
    },
    optionSubtitle: {
        display: 'none',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginHorizontal: spacing.md,
    },
});
