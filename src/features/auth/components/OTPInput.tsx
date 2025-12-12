import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
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
      const newCode = [...code];
      // Only take the last character to prevent paste errors
      const val = text.slice(-1).replace(/[^0-9]/g, '');

      newCode[index] = val;
      onCodeChanged(newCode);

      // Auto focus next input if value exists
      if (val && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    // Handle Backspace
    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace') {
        // If current input is empty and not the first one -> focus previous
        if (!code[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();

          // Optional: Clear previous input for smoother experience
          const newCode = [...code];
          newCode[index - 1] = '';
          onCodeChanged(newCode);
        }
      }
    };

    return (
      <View style={styles.boxesContainer}>
        {code.map((digit, index) => {
          let borderColor = '#E5E7EB'; // Default gray
          if (isError) borderColor = '#EF4444'; // Red on error
          else if (digit) borderColor = '#3B82F6'; // Blue when filled

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
              maxLength={1}
              selectTextOnFocus={true} // Auto select old value on focus
              textAlign="center"
              cursorColor="#3B82F6"
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
    color: '#111827',
    backgroundColor: '#FFFFFF',
    padding: 0,
    textAlign: 'center',
  },
});

export default OTPInput;
