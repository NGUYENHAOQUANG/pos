import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import ClockIcon from '@/assets/Icon/IconDevices/Clock.svg';
import { TimePickerModal } from '@/shared/components/modal/TimePickerModal';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { AutoScrollText } from '@/shared/components/ui/AutoScrollText';

interface ModalAddTurnProps {
    value: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
    style?: StyleProp<ViewStyle>;
}

export default function ModalAddTurn({
    value,
    onChange,
    placeholder = 'chọn thời gian',
    style,
}: ModalAddTurnProps) {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const [isPickerVisible, setPickerVisible] = useState(false);

    const formatTime = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    return (
        <View style={[staticStyles.container, style]}>
            <TouchableOpacity onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
                <View style={themedStyles.inputContainer}>
                    {value ? (
                        <Text
                            style={[
                                themedStyles.input,
                                {
                                    color: theme.textSecondary,
                                    fontSize: 16,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {formatTime(value)}
                        </Text>
                    ) : (
                        <AutoScrollText
                            text={placeholder}
                            containerStyle={{ flex: 1 }}
                            style={{
                                color: theme.gray[400],
                                fontSize: 14,
                            }}
                        />
                    )}
                    <ClockIcon
                        width={20}
                        height={20}
                        color={theme.text}
                        style={staticStyles.icon}
                    />
                </View>
            </TouchableOpacity>

            <TimePickerModal
                visible={isPickerVisible}
                onClose={() => setPickerVisible(false)}
                time={value}
                onSelectTime={date => {
                    onChange(date);
                    setPickerVisible(false);
                }}
            />
        </View>
    );
}

// Static styles
const staticStyles = StyleSheet.create({
    container: {
        width: '100%',
    },
    icon: {
        marginLeft: 5,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            height: 40,
            paddingHorizontal: 8,
        },
        input: {
            flex: 1,
            color: theme.text,
            textAlign: 'center',
        },
    });
