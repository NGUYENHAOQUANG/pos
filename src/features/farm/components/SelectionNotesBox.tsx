import React, { useRef } from 'react';
import { StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { typography } from '@/styles';
import { showLimitCharacterToast } from '@/features/farm/utils/toastMessages';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

interface SelectionNotesBoxProps {
    notes: string;
    onNotesChange: (value: string) => void;
    title?: string;
    plain?: boolean;
}

export const SelectionNotesBox: React.FC<SelectionNotesBoxProps> = ({
    notes,
    onNotesChange,
    title = 'Ghi chú',
    plain,
}) => {
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

    const inputElement = (
        <TextInput
            ref={inputRef}
            style={styles.textArea}
            placeholder="Nhập ghi chú"
            placeholderTextColor={theme.textTertiary || theme.borderSubtle}
            value={notes}
            onChangeText={handleChangeText}
            multiline
            textAlignVertical="top"
            maxLength={2000}
        />
    );

    if (plain) {
        return (
            <View style={styles.plainContainer}>
                {title && (
                    <View style={styles.labelWrapper}>
                        <Text style={styles.label}>{title}</Text>
                    </View>
                )}
                {inputElement}
            </View>
        );
    }

    return <SelectionInfoBox title={title}>{inputElement}</SelectionInfoBox>;
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        textArea: {
            minHeight: 104,
            maxHeight: 160,
            paddingVertical: 12,
            paddingHorizontal: 12,
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: '400',
            letterSpacing: 0,
            color: theme.text,
            textAlignVertical: 'top',
        },
        plainContainer: {
            marginBottom: 12,
        },
        labelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
        },
        label: {
            fontSize: typography.fontSize.sm,
            fontWeight: '500',
            color: theme.text,
            lineHeight: 20,
        },
    });
