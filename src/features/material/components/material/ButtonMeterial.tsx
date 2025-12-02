import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
    LayoutChangeEvent,
    TouchableHighlight,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, sizes } from '@/styles';

interface ButtonMetaerialProps {
    onPressCreateImport?: () => void;
    onPressCreateAdjustment?: () => void;
    onPressCreateMaterial?: () => void;
}

export const ButtonMetaerial: React.FC<ButtonMetaerialProps> = ({
    onPressCreateImport,
    onPressCreateAdjustment,
    onPressCreateMaterial,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [buttonLayout, setButtonLayout] = useState<{ width: number; height: number } | null>(null);

    const animation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
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

    const onButtonLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setButtonLayout({ width, height });
    };

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

    return (
        <View style={styles.container}>
            {/* Menu Dropdown */}
            <Animated.View
                style={[
                    styles.menuContainer,
                    {
                        opacity,
                        transform: [{ scale }, { translateY }],
                        top: (buttonLayout?.height || 44) + spacing.xs,
                    },
                ]}
                pointerEvents={isOpen ? 'auto' : 'none'}
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

            {/* Main Button */}
            <TouchableOpacity
                style={styles.button}
                onPress={toggleMenu}
                activeOpacity={0.8}
                onLayout={onButtonLayout}
            >
                <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-end',
        zIndex: 100,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    menuContainer: {
        position: 'absolute',
        right: 0,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.xs,
        minWidth: 280, // Wider menu
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
        zIndex: 99,
        // Removed border to match the clean card look
    },
    menuItem: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
        marginHorizontal: spacing.xs,
    },
    menuItemBorder: {
        // Removed border separator
    },
    menuItemText: {
        fontSize: 16, // Larger font
        color: colors.text,
        fontWeight: '400',
    },
});
