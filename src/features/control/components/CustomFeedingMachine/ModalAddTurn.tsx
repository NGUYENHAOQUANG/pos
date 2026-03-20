import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import ClockIcon from '@/assets/Icon/IconDevices/Clock.svg';
import { TimePickerModal } from '@/shared/components/modal/TimePickerModal';
import { colors } from '@/styles';
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
        <View style={[styles.container, style]}>
            <TouchableOpacity onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
                <View style={styles.inputContainer}>
                    {value ? (
                        <Text
                            style={[
                                styles.input,
                                {
                                    color: colors.textSecondary,
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
                                color: colors.gray[400],
                                fontSize: 14,
                            }}
                        />
                    )}
                    <ClockIcon width={20} height={20} color={colors.text} style={styles.icon} />
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

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        height: 40,
        paddingHorizontal: 8,
    },
    input: {
        flex: 1,
        color: colors.text,
        textAlign: 'center',
    },
    activeInput: {
        color: colors.text,
    },
    icon: {
        marginLeft: 5,
    },
});
