import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DatePickerModal } from '../../../home/components/DatePickerModal';
import { colors } from '@/styles';

export default function FilterDate() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);

  // 1. Hàm Format ngày theo kiểu Việt Nam: "Thứ 2, 20/12/2025"
  const formatDate = (date: Date) => {
    // Lấy thứ
    const dayOfWeek = date.toLocaleDateString('vi-VN', { weekday: 'short' });
    // Lấy ngày tháng năm
    const dateString = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Capitalize chữ cái đầu của Thứ (th 2 -> Th 2)
    const formattedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

    return `${formattedDay}, ${dateString}`;
  };

  // 2. Logic tăng/giảm ngày
  const handleChangeDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <View style={styles.container}>
      {/* Nút lùi ngày */}
      <TouchableOpacity style={styles.navButton} onPress={() => handleChangeDay(-1)}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>

      {/* Ô hiển thị ngày - Bấm vào sẽ mở Modal */}
      <TouchableOpacity style={styles.dateDisplay} onPress={() => setModalVisible(true)}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <Ionicons style={styles.icon} name="calendar-outline" size={18} color={colors.text} />
      </TouchableOpacity>

      {/* Nút tiến ngày */}
      <TouchableOpacity style={styles.navButton} onPress={() => handleChangeDay(1)}>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
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
    gap: 16,
    backgroundColor: colors.white,
    padding: 16,
    elevation: 2,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
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
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  icon: {
    position: 'absolute',
    right: 16,
  },
});
