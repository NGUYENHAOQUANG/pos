import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
    TouchableHighlight,
    Modal,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

interface ButtonMetaerialProps {
    onPressCreateImport?: () => void;
    onPressCreateAdjustment?: () => void;
    onPressCreateMaterial?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ButtonMetaerial: React.FC<ButtonMetaerialProps> = ({
    onPressCreateImport,
    onPressCreateAdjustment,
    onPressCreateMaterial,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const buttonRef = useRef<View>(null);

    const animation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        if (!isOpen) {
            // Measure button position before opening
            buttonRef.current?.measureInWindow((x, y, width, height) => {
                setButtonPosition({ x, y, width, height });
            });
        }

        const toValue = isOpen ? 0 : 1;

        Animated.spring(animation, {
            toValue,
            useNativeDriver: true,
            friction: 5,
            tension: 40,
        }).start();

        setIsOpen(!isOpen);
    };

    const menuItems = [
        { label: 'Tạo Phiếu Nhập Kho', onPress: onPressCreateImport },
        { label: 'Tạo Phiếu Điều Chỉnh Tồn Kho', onPress: onPressCreateAdjustment },
        { label: 'Tạo Vật Tư', onPress: onPressCreateMaterial },
    ];

    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
    });

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0],
    });

    // Calculate menu position - align right edge with button right edge
    const menuRight = SCREEN_WIDTH - buttonPosition.x - buttonPosition.width;
    const menuTop = buttonPosition.y + buttonPosition.height + spacing.xs;

    return (
        <View style={styles.container} ref={buttonRef}>
            {/* Main Button */}
            <TouchableOpacity style={styles.button} onPress={toggleMenu} activeOpacity={0.8}>
                <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>

            {/* Menu Modal */}
            <Modal
                visible={isOpen}
                transparent={true}
                animationType="none"
                onRequestClose={toggleMenu}
            >
                {/* Overlay */}
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={toggleMenu}
                    activeOpacity={1}
                >
                    {/* Menu Dropdown */}
                    <Animated.View
                        style={[
                            styles.menuContainer,
                            {
                                opacity,
                                transform: [{ scale }, { translateY }],
                                top: menuTop,
                                right: menuRight,
                            },
                        ]}
                    >
                        {menuItems.map((item, index) => (
                            <TouchableHighlight
                                key={index}
                                style={styles.menuItem}
                                underlayColor="#F5F5F5"
                                onPress={() => {
                                    toggleMenu();
                                    item.onPress?.();
                                }}
                            >
                                <Text style={styles.menuItemText}>{item.label}</Text>
                            </TouchableHighlight>
                        ))}
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-end',
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.xs,
        minWidth: 280,
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
    menuItem: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
        marginHorizontal: spacing.xs,
    },
    menuItemText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '400',
    },
});
