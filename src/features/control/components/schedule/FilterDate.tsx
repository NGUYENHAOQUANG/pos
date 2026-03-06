import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ArrowLeftIcon from '@/assets/Icon/ArrowLeft.svg';
import ArrowRightIcon from '@/assets/Icon/ArrowRight.svg';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
// removed LayoutChangeEvent
import { borderRadius, colors } from '@/styles';
import CalenderIcon from '@/assets/Icon/Calender.svg';

export default function FilterDate() {
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
            {/* Nút lùi ngày */}
            <TouchableOpacity style={styles.navButton} onPress={() => handleChangeDay(-1)}>
                <ArrowLeftIcon width={20} height={20} />
            </TouchableOpacity>

            {/* Hiển thị ngày đã chọn */}
            <TouchableOpacity style={styles.dateDisplay} onPress={() => setModalVisible(true)}>
                <Text style={styles.dateText} numberOfLines={1}>
                    {formatDate(selectedDate)}
                </Text>

                <CalenderIcon width={16} height={16} style={styles.icon} />
            </TouchableOpacity>

            {/* Nút tiến ngày */}
            <TouchableOpacity style={styles.navButton} onPress={() => handleChangeDay(1)}>
                <ArrowRightIcon width={20} height={20} />
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

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    navButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    dateDisplay: {
        flex: 1,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    dateText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '400',
        flexShrink: 1,
        textAlign: 'center',
    },
    icon: {
        position: 'absolute',
        right: 12,
    },
});
