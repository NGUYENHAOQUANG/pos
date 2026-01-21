import {
    View,
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
                    let borderColor: string = colors.gray[200];
                    if (isError) borderColor = colors.red[600];
                    else if (digit) borderColor = colors.blue[600];

                    return (
                        <TextInput
                            key={index}
                            ref={el => {
                                inputRefs.current[index] = el;
                            }}
                            style={[styles.otpBoxInput, { borderColor }]}
                            value={digit}
                            onChangeText={text => handleCodeChange(text, index)}
                            onKeyPress={e => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={length}
                            textContentType="oneTimeCode"
                            autoComplete="sms-otp"
                            importantForAutofill="yes"
                            selectTextOnFocus={true}
                            textAlign="center"
                            cursorColor={colors.blue[600]}
                        />
                    );
                })}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    boxesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 6,
    },
    otpBoxInput: {
        width: 56,
        height: 56,
        borderWidth: 1.5,
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '500',
        color: colors.gray[900],
        backgroundColor: colors.white,
        padding: 0,
        textAlign: 'center',
    },
});

export default OTPInput;
