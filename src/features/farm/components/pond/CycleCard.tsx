import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface CycleCardProps {
  cycleName: string;
  startDate: string;
  doc: number;
  stockingQuantity: number;
  breed: string;
  onPress?: () => void;
}

export const CycleCard: React.FC<CycleCardProps> = ({
  cycleName,
  startDate,
  doc,
  stockingQuantity,
  breed,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Header chia làm 2 cột */}
      <View style={styles.header}>
        {/* Cột trái: Tên và Ngày thả */}
        <View style={styles.leftColumn}>
          <Text style={styles.cycleName}>{cycleName}</Text>
          <Text style={styles.dateText}>{startDate} - nay</Text>
        </View>

        {/* Cột phải: Badge trạng thái & Mũi tên (Căn phải + Giữa dọc) */}
        <View style={styles.rightColumn}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Chưa hoàn thành</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={styles.arrowIcon} />
        </View>
      </View>

      {/* Borderline tách biệt Header và Body */}
      <View style={styles.divider} />

      {/* Body: Thông tin chi tiết */}
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>Số ngày nuôi (DOC):</Text>
          <Text style={styles.value}>{doc}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Số lượng thả (Pls):</Text>
          <Text style={styles.value}>{stockingQuantity.toLocaleString()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tôm giống:</Text>
          <Text style={styles.value}>{breed}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', // Nền trắng
    width: '100%',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 0, // Không bo góc
  },
  header: {
    flexDirection: 'row', // Chia cột ngang
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center', // Căn giữa các cột theo chiều dọc
  },
  leftColumn: {
    flex: 1, // Chiếm không gian bên trái
  },
  cycleName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  rightColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#FFFBE6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '#FFE58F',
  },
  statusText: {
    fontSize: typography.fontSize.regular,
    color: '#D48806',
    fontWeight: typography.fontWeight.regular,
  },
  arrowIcon: {
    marginLeft: 8, // Khoảng cách giữa badge và mũi tên
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6', // Borderline ngăn cách
  },
  body: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs, // Khoảng cách giữa các dòng thông tin
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.regular,
  },
});
