import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Platform } from 'react-native';
import { colors } from '@/styles';
import { showLimitCharacterToast } from '@/features/farm/utils/toastMessages';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

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
            <SelectionInfoBox title="Ghi chú">
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
            </SelectionInfoBox>
            {isFocused && <View style={styles.keyboardSpacer} />}
        </>
    );
};

const styles = StyleSheet.create({
    textArea: {
        minHeight: 80,
        maxHeight: 160,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 24,
        color: colors.text,
        textAlignVertical: 'top',
    },
    keyboardSpacer: {
        height: Platform.OS === 'android' ? 150 : 80,
    },
});
