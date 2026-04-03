import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, borderRadius } from '@/styles';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { haptics } from '@/shared/utils/haptics';

const PIN_LENGTH = 4;

interface PinEntryPadProps {
    /** Title displayed above the PIN dots */
    title: string;
    /** Subtitle/instruction text */
    subtitle?: string;
    /** Called when user completes PIN entry */
    onComplete: (pin: string) => void;
    /** Whether to show biometric button */
    showBiometric?: boolean;
    /** Called when biometric button is pressed */
    onBiometricPress?: () => void;
    /** Biometric icon element (SVG component) */
    biometricIcon?: React.ReactNode;
    /** Show error shake animation */
    error?: boolean;
    /** Reset error state after animation */
    onErrorReset?: () => void;
    /** Custom error message (defaults to 'Mã PIN không đúng') */
    errorMessage?: string;
}

/**
 * Reusable PIN entry pad with numeric keypad
 * Used for both PIN setup and PIN unlock screens
 */
export const PinEntryPad: React.FC<PinEntryPadProps> = ({
    title,
    subtitle,
    onComplete,
    showBiometric = false,
    onBiometricPress,
    biometricIcon,
    error = false,
    onErrorReset,
    errorMessage = 'Mã PIN không đúng',
}) => {
    const [pin, setPin] = useState('');
    const [showError, setShowError] = useState(false);
    const [dotError, setDotError] = useState(false);
    const shakeX = useSharedValue(0);

    // Shake animation when PIN is wrong
    React.useEffect(() => {
        if (error) {
            haptics.heavy();
            setShowError(true);
            setDotError(true);
            shakeX.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
            // Clear PIN digits and dot error after shake, keep text error visible
            setTimeout(() => {
                setPin('');
                setDotError(false);
            }, 400);
        }
    }, [error, shakeX]);

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    const handlePress = useCallback(
        (digit: string) => {
            haptics.light();
            // Clear error message when user starts typing again
            if (showError) {
                setShowError(false);
                onErrorReset?.();
            }
            setPin(prev => {
                const newPin = prev + digit;
                if (newPin.length === PIN_LENGTH) {
                    // Delay to show filled dot before processing
                    setTimeout(() => {
                        onComplete(newPin);
                        setPin('');
                    }, 150);
                    return newPin;
                }
                return newPin;
            });
        },
        [onComplete, showError, onErrorReset]
    );

    const handleDelete = useCallback(() => {
        haptics.light();
        setPin(prev => prev.slice(0, -1));
    }, []);

    const renderDots = () => (
        <Animated.View style={[styles.dotsContainer, shakeStyle]}>
            {Array.from({ length: PIN_LENGTH }, (_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i < pin.length && styles.dotFilled,
                        dotError && styles.dotError,
                    ]}
                />
            ))}
        </Animated.View>
    );

    const renderKey = (value: string, onPress: () => void) => (
        <TouchableOpacity key={value} style={styles.key} onPress={onPress} activeOpacity={0.6}>
            <Text style={styles.keyText}>{value}</Text>
        </TouchableOpacity>
    );

    const renderKeypad = () => {
        const rows = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
        ];

        return (
            <View style={styles.keypad}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.keyRow}>
                        {row.map(digit => renderKey(digit, () => handlePress(digit)))}
                    </View>
                ))}
                {/* Bottom row: biometric / 0 / delete */}
                <View style={styles.keyRow}>
                    {showBiometric ? (
                        <TouchableOpacity
                            style={styles.key}
                            onPress={onBiometricPress}
                            activeOpacity={0.6}
                        >
                            {biometricIcon}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.keyEmpty} />
                    )}
                    {renderKey('0', () => handlePress('0'))}
                    <TouchableOpacity
                        style={styles.key}
                        onPress={handleDelete}
                        activeOpacity={0.6}
                        disabled={pin.length === 0}
                    >
                        <Ionicons
                            name="backspace-outline"
                            size={26}
                            color={pin.length > 0 ? colors.text : colors.gray[300]}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && !showError && <Text style={styles.subtitle}>{subtitle}</Text>}
                {showError && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>
            {renderDots()}
            {renderKeypad()}
        </View>
    );
};

const KEY_SIZE = 72;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.error,
        textAlign: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 40,
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: colors.gray[300],
        backgroundColor: 'transparent',
    },
    dotFilled: {
        backgroundColor: colors.primaryOrange,
        borderColor: colors.primaryOrange,
    },
    dotError: {
        borderColor: colors.error,
        backgroundColor: colors.error,
    },
    keypad: {
        gap: 12,
    },
    keyRow: {
        flexDirection: 'row',
        gap: 20,
    },
    key: {
        width: KEY_SIZE,
        height: KEY_SIZE,
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        fontSize: 28,
        fontWeight: '500',
        color: colors.text,
    },
    keyEmpty: {
        width: KEY_SIZE,
        height: KEY_SIZE,
    },
});
