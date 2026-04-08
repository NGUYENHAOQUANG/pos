import React, { useRef } from 'react';
import { StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { showLimitCharacterToast } from '@/features/farm/utils/toastMessages';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

interface SelectionNotesBoxProps {
    notes: string;
    onNotesChange: (value: string) => void;
}

export const SelectionNotesBox: React.FC<SelectionNotesBoxProps> = ({ notes, onNotesChange }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

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
        <SelectionInfoBox title="Ghi chú">
            <TextInput
                ref={inputRef}
                style={styles.textArea}
                placeholder="Nhập ghi chú"
                placeholderTextColor={theme.borderSubtle}
                value={notes}
                onChangeText={handleChangeText}
                multiline
                textAlignVertical="top"
                maxLength={2000}
            />
        </SelectionInfoBox>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        textArea: {
            minHeight: 104,
            maxHeight: 160,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 24,
            color: theme.text,
            textAlignVertical: 'top',
        },
    });
