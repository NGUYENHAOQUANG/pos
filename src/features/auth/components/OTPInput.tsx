import {
    View,
    Text,
    TextInput,
    StyleSheet,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from 'react-native';
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { colors } from '@/styles';

interface OTPInputProps {
    code: string[]; // Array of 4 characters ['1', '2', '', '']
    onCodeChanged: (code: string[]) => void;
    isError?: boolean;
    length?: number; // Default is 4
}

export interface OTPInputHandle {
    focusFirst: () => void;
    reset: () => void;
}

const OTPInput = forwardRef<OTPInputHandle, OTPInputProps>(
    ({ code, onCodeChanged, isError = false, length = 4 }, ref) => {
        // Refs for each input
        const inputRefs = useRef<Array<TextInput | null>>([]);

        // Expose functions to parent (for "Resend Code" button)
        useImperativeHandle(ref, () => ({
            focusFirst: () => {
                inputRefs.current[0]?.focus();
            },
            reset: () => {
                // Optional reset logic if needed internally
            },
        }));

        // Handle Input
        const handleCodeChange = (text: string, index: number) => {
            const cleanText = text.replace(/[^0-9]/g, '');

            // Case 1: Pasting/Autofill full code (or part of it)
            if (cleanText.length > 1) {
                const newCode = [...code];
                // Distribute characters starting from current index
                for (let i = 0; i < cleanText.length; i++) {
                    if (index + i < length) {
                        newCode[index + i] = cleanText[i];
                    }
                }
                onCodeChanged(newCode);

                // Focus the last filled box or the next empty one
                const nextIndex = Math.min(index + cleanText.length, length - 1);
                inputRefs.current[nextIndex]?.focus();
                return;
            }

            // Case 2: Standard single character input
            const newVal = cleanText.slice(-1); // Take last char
            const newCode = [...code];
            newCode[index] = newVal;
            onCodeChanged(newCode);

            // Auto focus next input if value exists
            if (newVal && index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        };

        // Handle Backspace - automatically move to previous input
        const handleKeyPress = (
            e: NativeSyntheticEvent<TextInputKeyPressEventData>,
            index: number
        ) => {
            if (e.nativeEvent.key === 'Backspace') {
                const newCode = [...code];

                // If current input has value, just clear it (stay in current box)
                if (code[index]) {
                    newCode[index] = '';
                    onCodeChanged(newCode);
                    // After clearing, the box is now empty, next backspace will move to previous
                } else if (index > 0) {
                    // Current input is empty, move to previous and clear it
                    newCode[index - 1] = '';
                    onCodeChanged(newCode);
                    // Focus the previous input AFTER state update
                    setTimeout(() => {
                        inputRefs.current[index - 1]?.focus();
                    }, 0);
                }
            }
        };

        return (
            <View style={styles.boxesContainer}>
                {code.map((digit, index) => {
                    return (
                        <View
                            key={index}
                            style={[
                                styles.otpBoxInput,
                                { borderColor: isError ? colors.error : colors.gray[100] },
                                digit ? styles.otpBoxInputFilled : null,
                            ]}
                        >
                            <TextInput
                                ref={el => {
                                    inputRefs.current[index] = el;
                                }}
                                style={styles.innerInput}
                                value={digit}
                                onChangeText={text => handleCodeChange(text, index)}
                                onKeyPress={e => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                textContentType="oneTimeCode"
                                autoComplete="sms-otp"
                                importantForAutofill="yes"
                                selectTextOnFocus={true}
                                textAlign="center"
                                cursorColor={colors.primary}
                                selectionColor={colors.primary}
                                underlineColorAndroid="transparent"
                            />
                            {!digit && (
                                <Text style={styles.dashPlaceholder} pointerEvents="none">
                                    -
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    boxesContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
        gap: 12,
    },
    otpBoxInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderRadius: 30,
        fontSize: 20,
        fontWeight: '500',
        color: colors.text,
        backgroundColor: colors.white,
        padding: 0,
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    innerInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        fontSize: 20,
        fontWeight: '500',
        color: colors.text,
        textAlign: 'center',
        padding: 0,
    },
    dashPlaceholder: {
        position: 'absolute',
        fontSize: 20,
        color: colors.gray[400],
        textAlign: 'center',
        width: '100%',
        lineHeight: 56,
        zIndex: -1,
    },
    otpBoxInputFilled: {
        borderColor: colors.primary,
    },
});

export default OTPInput;
