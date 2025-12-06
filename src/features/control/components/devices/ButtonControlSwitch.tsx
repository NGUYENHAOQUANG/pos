import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ButtonControlSwitchProps {
    onSwitchToSchedule?: () => void;
    onSwitchToManual?: () => void;
}

export const ButtonControlSwitch: React.FC<ButtonControlSwitchProps> = ({
    onSwitchToSchedule,
    onSwitchToManual,
}) => {
    const [visible, setVisible] = useState(false);
    // In a real app we might measure the button position to place the modal correctly,
    // or use a library like react-native-modal-dropdown.
    // For simplicity and "like image" verification, we'll try a simple absolute positioning or modal overlay.
    // Since the image suggests a popover, a Modal with an absolute positioned view inside is common.

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Ionicons name="ellipsis-vertical" size={20} color="#1F2937" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            {/* Position hardcoded relative to where we expect the button to be, 
                                or just centered for now if we can't measure. 
                                Actually, usually these buttons are in headers. 
                                Let's put it top rightish or measuring context. 
                                Without measurement, let's put it in a generic position or hope it renders relative. 
                                Ah, inside Modal absolute coordinates are screen relative.
                                I'll center it or put it slightly offset for demo purposes, 
                                but to be "like image" it should align with the button. 
                                Since I can't guarantee position without onLayout, 
                                I'll position it assuming the button is right aligned.
                            */}
                            <View style={styles.menuContainer}>
                                <TouchableOpacity 
                                    style={styles.menuItem} 
                                    onPress={() => {
                                        onSwitchToSchedule?.();
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={styles.menuText}>Chuyển tất cả máy theo lịch trình</Text>
                                </TouchableOpacity>
                                <View style={styles.separator} />
                                <TouchableOpacity 
                                    style={styles.menuItem} 
                                    onPress={() => {
                                        onSwitchToManual?.();
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={styles.menuText}>Chuyển tất cả máy theo thủ công</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
    },
    button: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        // Just minimal overlay or transparent
    },
    menuContainer: {
        position: 'absolute',
        top: 200, // Placeholder, usually measured
        right: 40,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        minWidth: 250,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuText: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '400',
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    }
});
