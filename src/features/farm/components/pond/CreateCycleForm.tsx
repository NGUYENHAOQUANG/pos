import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '../pondwork/SelectionInfoBox';
import { SelectionNotesBox } from '../SelectionNotesBox';
import { DropDownButtonBasic } from '../DropDownButtonBasic';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { IconCalender } from '@/assets/icons';
import BreedInfoCard from '../BreedInfoCard';

// Import useFarm thay vì useCycle
import { useFarm, FormData } from '../../context/FarmContext';

interface Props {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const CreateCycleForm: React.FC<Props> = ({ formData, setFormData }) => {
  // Lấy danh mục từ FarmContext
  const { breedOptions, seasonOptions } = useFarm();

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const updateField = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'dd-mm-yyyy, hr:mm (hiện tại)';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}/${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <SelectionInfoBox title="Chọn nguồn giống và vụ nuôi">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.required}>* </Text>Chọn tôm giống
          </Text>
          <DropDownButtonBasic
            data={breedOptions.map(opt => ({ id: opt.value, label: opt.label }))}
            value={
              formData.breedSource
                ? {
                    id: formData.breedSource,
                    label: breedOptions.find(o => o.value === formData.breedSource)?.label || '',
                  }
                : undefined
            }
            onSelect={item => updateField('breedSource', String(item.id))}
            style={styles.dropdown}
            showIcon={false}
          />
        </View>

        {formData.breedSource && (
          <BreedInfoCard
            materialCode={
              breedOptions.find(o => o.value === formData.breedSource)?.materialCode || ''
            }
            price={breedOptions.find(o => o.value === formData.breedSource)?.price || 0}
            supplier={breedOptions.find(o => o.value === formData.breedSource)?.supplier || ''}
          />
        )}

        <View style={styles.row}>
          <View style={[styles.col, { paddingRight: spacing.xs }]}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>Chọn vụ nuôi
            </Text>
            <DropDownButtonBasic
              data={seasonOptions.map(opt => ({ id: opt.value, label: opt.label }))}
              value={
                formData.season
                  ? {
                      id: formData.season,
                      label: seasonOptions.find(o => o.value === formData.season)?.label || '',
                    }
                  : undefined
              }
              onSelect={item => updateField('season', String(item.id))}
              style={styles.dropdown}
              showIcon={false}
            />
          </View>
          <View style={[styles.col, { paddingLeft: spacing.xs }]}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>Tên chu kỳ
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên chu kỳ"
              value={formData.cycleName || ''}
              onChangeText={text => updateField('cycleName', text)}
            />
          </View>
        </View>
      </SelectionInfoBox>

      <SelectionInfoBox title="Thông tin thả giống">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày thả</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setDatePickerVisible(true)}>
            <Text style={styles.dateText}>{formatDateTime(formData.stockingDate)}</Text>
            <IconCalender width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={[styles.col65, { paddingRight: spacing.xs }]}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>Tổng số lượng thả (PLs)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Vd: 200.000"
              keyboardType="numeric"
              value={formData.stockingQuantity ? String(formData.stockingQuantity) : ''}
              onChangeText={text => updateField('stockingQuantity', text)}
            />
          </View>
          <View style={[styles.col35, { paddingLeft: spacing.xs }]}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>Ngày tuổi (PLs)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Vd: 10"
              keyboardType="numeric"
              value={formData.age ? String(formData.age) : ''}
              onChangeText={text => updateField('age', text)}
            />
          </View>
        </View>
      </SelectionInfoBox>

      <SelectionNotesBox
        notes={formData.notes || ''}
        onNotesChange={text => updateField('notes', text)}
      />

      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        date={formData.stockingDate ? new Date(formData.stockingDate) : new Date()}
        onSelectDate={date => {
          updateField('stockingDate', date.toISOString());
          setDatePickerVisible(false);
        }}
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
  col65: {
    flex: 0.65,
  },
  col35: {
    flex: 0.35,
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
