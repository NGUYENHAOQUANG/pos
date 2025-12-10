import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import IconTrash from 'react-native-vector-icons/Feather';
import IconAdd from 'react-native-vector-icons/Ionicons';
import ModalAddTurn from './ModalAddTurn';
import { colors } from '@/styles';

interface ScheduleItem {
  id: string;
  startTime: Date | null;
  endTime: Date | null;
}

export default function ActivitySchedule() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Hàm thêm một lượt mới
  const handleAddTurn = () => {
    const newTurn: ScheduleItem = {
      id: Date.now().toString(),
      startTime: null,
      endTime: null,
    };
    setSchedules([...schedules, newTurn]);
  };

  // Hàm xóa một lượt
  const handleDeleteTurn = (id: string) => {
    setSchedules(schedules.filter(item => item.id !== id));
  };

  // Hàm cập nhật thời gian
  const handleTimeChange = (id: string, type: 'start' | 'end', newDate: Date) => {
    setSchedules(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            [type === 'start' ? 'startTime' : 'endTime']: newDate,
          };
        }
        return item;
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>Lịch hoạt động</Text>

        {/* Danh sách các lượt */}
        {schedules.map((item, index) => (
          <View key={item.id} style={styles.rowItem}>
            <Text style={styles.labelTurn}>Lần {index + 1}</Text>

            {/* Khu vực chọn giờ */}
            <View style={styles.timeInputsWrapper}>
              <ModalAddTurn
                value={item.startTime}
                onChange={date => handleTimeChange(item.id, 'start', date)}
                style={styles.timeInput}
                placeholder="00:00"
              />

              <Text style={styles.dashSeparator}>-</Text>

              <ModalAddTurn
                value={item.endTime}
                onChange={date => handleTimeChange(item.id, 'end', date)}
                style={styles.timeInput}
                placeholder="00:00"
              />
            </View>

            {/* Nút xóa */}
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTurn(item.id)}>
              <IconTrash name="trash" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Nút Thêm lượt */}
        <TouchableOpacity style={styles.addBtn} onPress={handleAddTurn}>
          <IconAdd name="add" size={20} color={colors.textSecondary} />
          <Text style={styles.addBtnText}>Thêm lượt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    // Shadow properties
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  labelTurn: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    width: 45,
  },
  timeInputsWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timeInput: {
    flex: 1,
  },
  dashSeparator: {
    marginHorizontal: 8,
    color: colors.text,
    fontWeight: '500',
  },
  deleteButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundIconBtn,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundButton,
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[700],
    marginLeft: 8,
  },
});
