import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

// Kích hoạt LayoutAnimation trên Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Định nghĩa kiểu dữ liệu cho 1 dòng vật tư trong phiếu
export interface InventoryDetailItem {
  id: string;
  materialName: string;
  beforeQuantity: number;
  afterQuantity: number;
}

// Định nghĩa kiểu dữ liệu cho Phiếu kiểm kê
export interface InventoryTicket {
  id: string;
  checkerName: string;
  date: string;
  note: string;
  totalDifference: number;
  items: InventoryDetailItem[];
}

interface InventoryCardProps {
  data: InventoryTicket;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Header: Người kiểm & Ngày kiểm */}
      <View style={styles.col}>
        <View style={styles.row}>
          <Text style={styles.label}>Người kiểm:</Text>
          <Text style={styles.value}>{data.checkerName}</Text>
        </View>
        <View style={[styles.row, styles.alignRight]}>
          <Text style={styles.label}>Ngày kiểm:</Text>
          <Text style={styles.value}>{data.date}</Text>
        </View>
      </View>
      <View style={styles.separator} />
      {/* Body: Ghi chú & Tổng chênh lệch */}
      <View style={[styles.col, styles.colWithMargin]}>
        <View style={[styles.row, styles.rowFlex2]}>
          <Text style={styles.label}>Ghi chú</Text>
          <Text style={styles.noteText} numberOfLines={2}>
            {data.note}
          </Text>
        </View>
        <View style={[styles.row, styles.alignRight, styles.rowFlex1]}>
          <Text style={styles.label}>Tổng chênh lệch:</Text>
          <Text style={[styles.value, styles.valueBold]}>{data.totalDifference}</Text>
        </View>
      </View>

      {/* Expanded Content: Chi tiết vật tư */}
      {isExpanded && (
        <View style={styles.expandedContainer}>
          {data.items.map(item => (
            <View key={item.id} style={styles.detailItemContainer}>
              <Text style={styles.materialName}>{item.materialName}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tồn kho trước khi điều chỉnh:</Text>
                <Text style={styles.detailValue}>{item.beforeQuantity}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tồn kho sau khi điều chỉnh:</Text>
                <Text style={styles.detailValue}>{item.afterQuantity}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Footer: Toggle Button */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleExpand} activeOpacity={0.7}>
        <Text style={styles.toggleText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.primary || '#1890FF'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  col: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: colors.text,
  },
  noteText: {
    fontSize: 14,
    color: colors.textSecondary || '#666',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  toggleText: {
    fontSize: 14,
    color: colors.primary || '#1890FF',
    marginRight: 4,
  },
  // Styles cho phần mở rộng
  expandedContainer: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: spacing.md,
  },
  detailItemContainer: {
    backgroundColor: '#FAFAFA', // Màu nền nhạt cho item con
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  materialName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
  },
  separator: {
    marginTop: spacing.sm,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  colWithMargin: {
    marginTop: spacing.sm,
  },
  rowFlex2: {
    flex: 2,
  },
  rowFlex1: {
    flex: 1,
  },
  valueBold: {
    fontWeight: 'bold',
  },
});
