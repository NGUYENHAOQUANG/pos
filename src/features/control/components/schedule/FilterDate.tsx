import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import ArrowLeftIcon from '@/assets/Icon/ArrowLeft.svg';
import ArrowRightIcon from '@/assets/Icon/ArrowRight.svg';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import CalenderIcon from '@/assets/Icon/Calender.svg';

export default function FilterDate() {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalVisible, setModalVisible] = useState(false);

    const formatDate = (date: Date) => {
        const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dayName = days[date.getDay()];

        const dateString = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        return `${dayName}, ${dateString}`;
    };

    const handleChangeDay = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={themedStyles.navButton} onPress={() => handleChangeDay(-1)}>
                <ArrowLeftIcon width={20} height={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
                style={themedStyles.dateDisplay}
                onPress={() => setModalVisible(true)}
            >
                <Text style={themedStyles.dateText} numberOfLines={1}>
                    {formatDate(selectedDate)}
                </Text>
                <CalenderIcon width={16} height={16} style={styles.icon} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity style={themedStyles.navButton} onPress={() => handleChangeDay(1)}>
                <ArrowRightIcon width={20} height={20} color={theme.text} />
            </TouchableOpacity>

            <DatePickerModal
                visible={isModalVisible}
                date={selectedDate}
                onClose={() => setModalVisible(false)}
                onSelectDate={newDate => {
                    setSelectedDate(newDate);
                    setModalVisible(false);
                }}
            />
        </View>
    );
}

// Static styles
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    icon: {
        position: 'absolute',
        right: 12,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        navButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
        },
        dateDisplay: {
            flex: 1,
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 16,
            paddingRight: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
        },
        dateText: {
            fontSize: 16,
            color: theme.text,
            fontWeight: '500',
            flexShrink: 1,
            textAlign: 'left',
        },
    });
