import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

interface WaterSupplyInfoBoxProps {
  // Inputs
  targetLevel: string;
  onTargetLevelChange: (val: string) => void;
  supplyLevel: string;
  onSupplyLevelChange: (val: string) => void;

  // Read-only calculated values (giả định được tính toán từ parent hoặc API)
  drainLevel?: string | number;
  volumeAfterDrain?: string | number;
  volumeSupply?: string | number;
  volumeAfterSupply?: string | number;
}

export const WaterSupplyInfoBox: React.FC<WaterSupplyInfoBoxProps> = ({
  targetLevel,
  onTargetLevelChange,
  supplyLevel,
  onSupplyLevelChange,
  drainLevel = '-',
  volumeAfterDrain = '-',
  volumeSupply = '-',
  volumeAfterSupply = '-',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mực nước và thể tích</Text>
      <View style={styles.divider} />

      {/* Input Row */}
      <View style={styles.rowInput}>
        <View style={styles.colInput}>
          <Text style={styles.label}>
            <Text style={styles.required}>* </Text>
            Mực nước mục tiêu (cm)
          </Text>
          <TextInput
            style={styles.input}
            value={targetLevel}
            onChangeText={onTargetLevelChange}
            placeholder="Input"
            placeholderTextColor={colors.gray[400]}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.colGap} />
        <View style={styles.colInput}>
          <Text style={styles.label}>
            <Text style={styles.required}>* </Text>
            Số cm cấp
          </Text>
          <TextInput
            style={styles.input}
            value={supplyLevel}
            onChangeText={onSupplyLevelChange}
            placeholder="Input"
            placeholderTextColor={colors.gray[400]}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Read-only Info Block */}
      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mực nước xả xuống (cm)</Text>
          <Text style={styles.infoValue}>{drainLevel}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Thể tích sau xả (m³)</Text>
          <Text style={styles.infoValue}>{volumeAfterDrain}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Thể tích nước cấp vào (m³)</Text>
          <Text style={styles.infoValue}>{volumeSupply}</Text>
        </View>
        <View style={styles.infoRowLast}>
          <Text style={styles.infoLabel}>Thể tích nước sau cấp (m³)</Text>
          <Text style={styles.infoValue}>{volumeAfterSupply}</Text>
        </View>
      </View>

      <Text style={styles.helperText}>
        Kết quả được hệ thống tính tự động từ các số liệu bạn đã nhập
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 16,

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 12,
    marginHorizontal: -16,
  },
  rowInput: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  colInput: {
    flex: 1,
  },
  colGap: {
    width: 12,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.red[900],
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  infoBlock: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    padding: 12,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
