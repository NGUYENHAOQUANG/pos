import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CollapseHead } from '../../components/CollapseHead';
import { colors, spacing, borderRadius } from '@/styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InventoryGeneralInfoProps {
  date: string; // Định dạng hiển thị 'YYYY-MM-DD'
  note: string;
  onDatePress: () => void;
  onNoteChange: (text: string) => void;
}

export const InventoryGeneralInfo: React.FC<InventoryGeneralInfoProps> = ({
  date,
  note,
  onDatePress,
  onNoteChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <CollapseHead
        title="Chi tiết"
        isExpanded={isExpanded}
        onToggle={toggleExpand}
        style={styles.header}
        showIcon={true}
      />

      {isExpanded && (
        <View style={styles.body}>
          {/* Read-only info rows */}
          <InfoRow label="Kho" value="{Tên trại nuôi}" />
          <InfoRow label="Ngày tạo phiếu:" value="11:00 28/11/2025" />
          <InfoRow label="Người tạo phiếu:" value="Nguyễn Phương Duy" />
          <InfoRow label="Nhóm vật tư" value="Nuôi" isLast />

          {/* Input: Ngày kiểm kê (Bấm vào để chọn ngày) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>Ngày kiểm kê
            </Text>
            <TouchableOpacity style={styles.dateInput} onPress={onDatePress} activeOpacity={0.7}>
              <Text style={styles.inputText}>{date}</Text>
              <Ionicons name="calendar-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Input: Ghi chú */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>Ghi chú lý do điều chỉnh
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Nhập ghi chú"
              placeholderTextColor="#ccc"
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={onNoteChange}
            />
          </View>
        </View>
      )}
    </View>
  );
};

// Helper Component cho dòng thông tin
const InfoRow = ({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) => (
  <View style={[styles.row, isLast && { marginBottom: 0 }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    // Shadow nhẹ giống card
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
    marginBottom: spacing.md,
  },
  header: {
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    borderBottomWidth: 0,
  },
  body: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: colors.textSecondary || '#666',
    textAlign: 'right',
  },
  inputGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '400',
  },
  required: {
    color: colors.error || '#FF4D4F',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  inputText: {
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.sm,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
});
