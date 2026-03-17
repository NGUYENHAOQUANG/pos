import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles';
import { MoreButton } from '@/shared/components/buttons/MoreButton';

interface ButtonControlSwitchProps {
    onSwitchToSchedule?: () => void;
    onSwitchToManual?: () => void;
}

export const ButtonControlSwitch: React.FC<ButtonControlSwitchProps> = ({
    onSwitchToSchedule,
    onSwitchToManual,
}) => {
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownRight, setDropdownRight] = useState(24);
    const buttonRef = React.useRef<View>(null);

    const openMenu = () => {
        if (buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                const windowWidth = Dimensions.get('window').width;
                const rightSpace = windowWidth - (x + width);

                setDropdownRight(rightSpace >= 0 ? rightSpace : 24);
                setDropdownTop(y + height + 4);

                setVisible(true);
            });
        }
    };

    return (
        <View style={styles.container}>
            <View ref={buttonRef} collapsable={false} style={styles.buttonWrapper}>
                <MoreButton onPress={openMenu} />
            </View>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View
                            style={[
                                styles.menuContainer,
                                { top: dropdownTop, right: dropdownRight },
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    onSwitchToSchedule?.();
                                    setVisible(false);
                                }}
                            >
                                <Text style={styles.menuText}>
                                    Chuyển tất cả máy theo lịch trình
                                </Text>
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
    buttonWrapper: {
        alignSelf: 'flex-start',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)', // Faint overlay
    },
    menuContainer: {
        position: 'absolute',
        // right: 24, // Handled dynamically
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        minWidth: 260,
        zIndex: 100,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuText: {
        fontSize: 16,
        color: colors.gray[800],
        fontWeight: '400',
    },
    separator: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: 16,
    },
});
