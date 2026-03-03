import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { colors, spacing } from '@/styles';
import { showLimitCharacterToast } from '@/features/farm/utils/toastMessages';

interface SelectionNotesBoxProps {
    notes: string;
    onNotesChange: (value: string) => void;
}

export const SelectionNotesBox: React.FC<SelectionNotesBoxProps> = ({ notes, onNotesChange }) => {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleChangeText = (text: string) => {
        if (text.length > 1999) {
            showLimitCharacterToast();
            onNotesChange(text.substring(0, 1999));
        } else {
            onNotesChange(text);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>Ghi chú</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        ref={inputRef}
                        style={styles.textArea}
                        placeholder="Nhập ghi chú"
                        placeholderTextColor={colors.borderSubtle}
                        value={notes}
                        onChangeText={handleChangeText}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        multiline
                        textAlignVertical="top"
                        maxLength={2000}
                    />
                </View>
            </View>
            {/* Dynamic spacer: placed outside the card so it doesn't stretch the white background */}
            {isFocused && <View style={styles.keyboardSpacer} />}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginTop: 8,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    title: {
        fontSize: 14,
        fontWeight: '400',
        fontStyle: 'normal',
        lineHeight: 22,
        letterSpacing: 0,
        color: colors.text,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    textArea: {
        minHeight: 80,
        maxHeight: 160,
        paddingVertical: 5,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        fontSize: 16,
        fontWeight: '400',
        fontStyle: 'normal',
        lineHeight: 24,
        letterSpacing: 0,
        color: colors.text,
        textAlignVertical: 'top',
    },
    keyboardSpacer: {
        height: Platform.OS === 'android' ? 150 : 80,
    },
});
