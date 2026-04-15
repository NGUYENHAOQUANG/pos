import React from 'react';
import { StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { borderRadius } from '@/styles';

export const useInputStyles = () => {
    return React.useMemo(() => {
        return StyleSheet.create({
            wrapper: {
                backgroundColor: 'transparent',
                paddingHorizontal: 16,
                paddingTop: 8,
            },
            chipsContainer: {
                flexDirection: 'row',
                gap: 8,
                paddingBottom: 10,
                paddingHorizontal: 2,
                alignItems: 'center',
                minHeight: 40,
            },
            chip: {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.chatbot.glassButtonBorder,
                backgroundColor: colors.chatbot.glassButtonBg,
                justifyContent: 'center',
            },
            backChip: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            chipAction: {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.chatbot.glassButtonBorder,
                backgroundColor: colors.chatbot.glassButtonBg,
                justifyContent: 'center',
            },
            chipText: {
                fontSize: 13,
                fontWeight: '500',
                color: colors.text,
            },
            chipActionText: {
                fontSize: 13,
                fontWeight: '500',
                color: colors.text,
            },
            inputWrapper: {
                position: 'relative',
                zIndex: 1,
            },
            inputPrimary: {
                flexDirection: 'column',
                backgroundColor: colors.chatbot.glassInputBg,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.chatbot.glassInputBorder,
                paddingLeft: 4,
                paddingRight: 0,
                overflow: 'hidden',
            },
            inputPrimaryListening: {
                borderColor: 'transparent',
            },
            composerInput: {
                backgroundColor: 'transparent',
                borderRadius: 0,
                paddingHorizontal: 12,
                paddingTop: 16,
                paddingBottom: 8,
                fontSize: 16,
                color: colors.text,
                minHeight: 40,
                maxHeight: 130,
                borderWidth: 0,
                textAlignVertical: 'top',
            },
            actionButtonsContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
                padding: 8,
            },
            actionButton: {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.chatbot.glassButtonBg,
                borderColor: colors.chatbot.glassButtonBorder,
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
            },
            selectedZoneChip: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                height: 32,
                backgroundColor: colors.chatbot.glassButtonBg,
                borderRadius: borderRadius.full,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: colors.chatbot.glassButtonBorder,
                marginRight: 'auto',
            },
            selectedZoneText: {
                fontSize: 13,
                color: colors.text,
                fontWeight: '500',
            },
            disclaimer: {
                textAlign: 'center',
                fontSize: 11,
                color: colors.textSecondary,
                marginTop: 8,
                paddingHorizontal: 16,
            },
            zonePickerChip: {
                flexDirection: 'row',
                alignItems: 'center',
                height: 36,
                backgroundColor: colors.chatbot.glassButtonBg,
                borderRadius: borderRadius.full,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: colors.chatbot.glassButtonBorder,
            },
        });
    }, []);
};
