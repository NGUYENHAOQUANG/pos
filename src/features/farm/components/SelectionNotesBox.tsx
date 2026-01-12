import React, { useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { colors, spacing } from '@/styles';

interface SelectionNotesBoxProps {
    notes: string;
    onNotesChange: (value: string) => void;
    scrollViewRef?: React.RefObject<any>;
}

export const SelectionNotesBox: React.FC<SelectionNotesBoxProps> = ({
    notes,
    onNotesChange,
    scrollViewRef,
}) => {
    const containerRef = useRef<View>(null);
    const inputRef = useRef<TextInput>(null);

    const handleFocus = () => {
        if (Platform.OS === 'ios' && scrollViewRef?.current) {
            // Delay để đảm bảo keyboard đã mở
            setTimeout(() => {
                // Scroll to end để đảm bảo input được hiển thị
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
        }
    };

    return (
        <View ref={containerRef} style={styles.container}>
            <Text style={styles.title}>Ghi chú</Text>
            <View style={styles.inputGroup}>
                <TextInput
                    ref={inputRef}
                    style={styles.textArea}
                    placeholder="Nhập ghi chú"
                    placeholderTextColor={colors.borderSubtle}
                    value={notes}
                    onChangeText={onNotesChange}
                    onFocus={handleFocus}
                    multiline
                    textAlignVertical="top"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginTop: 8,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 1,
        gap: spacing.sm,
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
});
