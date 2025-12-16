import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DatePickerModal } from '../../../home/components/DatePickerModal';
import { LayoutChangeEvent } from 'react-native';
import { colors } from '@/styles';

export default function FilterDate() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  const ICON_WIDTH = 26;

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
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>

      {/* Hiển thị ngày đã chọn */}
      <TouchableOpacity
        style={styles.dateDisplay}
        onPress={() => setModalVisible(true)}
        onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Text
          style={styles.dateText}
          onLayout={(e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width)}
        >
          {formatDate(selectedDate)}
        </Text>

        {textWidth + ICON_WIDTH + 32 < containerWidth && (
          <Ionicons
            name="calendar-outline"
            size={18}
            color={colors.gray[400]}
            style={styles.icon}
          />
        )}
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
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  icon: {
    position: 'absolute',
    right: 16,
  },
});
