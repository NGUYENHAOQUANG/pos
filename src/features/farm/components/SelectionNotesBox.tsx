import React, { useRef } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { colors } from '@/styles';
import { showLimitCharacterToast } from '@/features/farm/utils/toastMessages';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

interface SelectionNotesBoxProps {
    notes: string;
    onNotesChange: (value: string) => void;
}

export const SelectionNotesBox: React.FC<SelectionNotesBoxProps> = ({ notes, onNotesChange }) => {
    const inputRef = useRef<RNTextInput>(null);

    const handleChangeText = (text: string) => {
        if (text.length > 1999) {
            showLimitCharacterToast();
            onNotesChange(text.substring(0, 1999));
        } else {
            onNotesChange(text);
        }
    };

    return (
        <View style={styles.container}>
            <SelectionInfoBox title="Ghi chú">
                <TextInput
                    ref={inputRef}
                    style={styles.textArea}
                    placeholder="Nhập ghi chú"
                    placeholderTextColor={colors.borderSubtle}
                    value={notes}
                    onChangeText={handleChangeText}
                    multiline
                    textAlignVertical="top"
                    maxLength={2000}
                />
            </SelectionInfoBox>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    textArea: {
        minHeight: 104,
        maxHeight: 160,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        borderRadius: 8,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 24,
        color: colors.text,
        textAlignVertical: 'top',
    },
});
