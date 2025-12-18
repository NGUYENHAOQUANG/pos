import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { useCycle } from '../../context/CycleContext';
import { SelectionInfoBox } from '../pondwork/SelectionInfoBox';
import { SelectionNotesBox } from '../SelectionNotesBox';
import { DropDownButtonBasic } from '../DropDownButtonBasic';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { IconCalender } from '@/assets/icons';
import BreedInfoCard from '../BreedInfoCard';

interface Props {}

const CreateCycleForm: React.FC<Props> = () => {
  const { formData, updateField, breedOptions, seasonOptions } = useCycle();

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'dd-mm-yyyy, hr:mm (hiện tại)';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  const handleDateConfirm = (date: Date) => {
    updateField('stockingDate', date.toISOString());
    setDatePickerVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* ===== SECTION 1: Nguồn giống và vụ nuôi ===== */}
      <SelectionInfoBox title="Chọn nguồn giống và vụ nuôi">
        {/* Chọn tôm giống */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.required}>* </Text>
            Chọn tôm giống
          </Text>
          <DropDownButtonBasic
            data={breedOptions.map(opt => ({ id: opt.value, label: opt.label }))}
            value={
              breedOptions.find(opt => opt.value === formData.breedSource)
                ? {
                    id: formData.breedSource!,
                    label:
                      breedOptions.find(opt => opt.value === formData.breedSource)?.label || '',
                  }
                : undefined
            }
            onSelect={item => updateField('breedSource', String(item.id))}
            style={styles.dropdown}
            showIcon={false}
          />
        </View>

        {/* Hiển thị thông tin giống sau khi chọn */}
        {formData.breedSource && breedOptions.find(opt => opt.value === formData.breedSource) && (
          <BreedInfoCard
            materialCode={
              breedOptions.find(opt => opt.value === formData.breedSource)?.materialCode || ''
            }
            price={breedOptions.find(opt => opt.value === formData.breedSource)?.price || 0}
            supplier={breedOptions.find(opt => opt.value === formData.breedSource)?.supplier || ''}
          />
        )}

        <View style={styles.row}>
          {/* Chọn vụ nuôi */}
          <View style={[styles.col, { paddingRight: spacing.xs }]}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>
              Chọn vụ nuôi
            </Text>
            <DropDownButtonBasic
              data={seasonOptions.map(opt => ({ id: opt.value, label: opt.label }))}
              value={
                seasonOptions.find(opt => opt.value === formData.season)
                  ? {
                      id: formData.season!,
                      label: seasonOptions.find(opt => opt.value === formData.season)?.label || '',
                    }
                  : undefined
              }
              onSelect={item => updateField('season', String(item.id))}
              style={styles.dropdown}
              showIcon={false}
            />
          </View>

          {/* Tên chu kỳ */}
          <View style={[styles.col, { paddingLeft: spacing.xs }]}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>
              Tên chu kỳ
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Tên chu kỳ"
              value={formData.cycleName || ''}
              onChangeText={text => updateField('cycleName', text)}
              placeholderTextColor={colors.text}
            />
          </View>
        </View>
      </SelectionInfoBox>

      {/* ===== SECTION 2: Thông tin thả giống ===== */}
      <SelectionInfoBox title="Thông tin thả giống">
        {/* Ngày thả */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày thả</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setDatePickerVisible(true)}>
            <Text style={[styles.dateText, !formData.stockingDate && styles.placeholderText]}>
              {formatDateTime(formData.stockingDate)}
            </Text>
            <IconCalender width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          {/* Tổng số lượng thả */}
          <View style={[styles.col, { paddingRight: spacing.xs }]}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>
              Tổng số lượng thả (PLs)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Vd: 200.000"
              keyboardType="numeric"
              value={formData.stockingQuantity ? String(formData.stockingQuantity) : ''}
              onChangeText={text => updateField('stockingQuantity', Number(text))}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Ngày tuổi (PLs) */}
          <View style={[styles.col, { paddingLeft: spacing.xs }]}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>
              Ngày tuổi (PLs)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Vd: 10"
              keyboardType="numeric"
              value={formData.age ? String(formData.age) : ''}
              onChangeText={text => updateField('age', Number(text))}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Mật độ & Chi phí */}
        <View style={styles.calcBox}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Mật độ (con/m²)</Text>
            <Text style={styles.calcValue}>{formData.density || '-'}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Tổng chi phí giống ước tính (VNĐ)</Text>
            <Text style={styles.calcValue}>{formData.estimatedCost || '-'}</Text>
          </View>
        </View>
        <Text style={styles.calcHint}>
          Kết quả được hệ thống tính tự động từ các số liệu bạn đã nhập
        </Text>
      </SelectionInfoBox>

      {/* ===== SECTION 3: Ghi chú ===== */}
      <SelectionNotesBox
        notes={formData.notes || ''}
        onNotesChange={text => updateField('notes', text)}
      />

      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        date={formData.stockingDate ? new Date(formData.stockingDate) : new Date()}
        onSelectDate={handleDateConfirm}
      />
    </ScrollView>
  );
};

export default CreateCycleForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  inputGroup: {
    marginBottom: spacing.sm,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  col: {
    flex: 1,
  },
  dropdown: {
    width: '100%',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  calcBox: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  calcLabel: {
    fontSize: 14,
    color: colors.text,
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  calcHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  disabledInput: {
    backgroundColor: colors.gray[100],
  },
});
