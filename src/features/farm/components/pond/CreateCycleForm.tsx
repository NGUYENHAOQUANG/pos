import React from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '../pondwork/SelectionInfoBox';
import { SelectionNotesBox } from '../SelectionNotesBox';
import { DropDownButtonBasic } from '../DropDownButtonBasic';
import { DateInputButton } from '../pondwork/DateInputButton';
import BreedInfoCard from '../BreedInfoCard';

import { useFarm } from '../../context/FarmContext';
import { CycleFormData } from '../../types/farm.types';

interface Props {
  formData: CycleFormData;
  setFormData: React.Dispatch<React.SetStateAction<CycleFormData>>;
}

const CreateCycleForm: React.FC<Props> = ({ formData, setFormData }) => {
  // Lấy danh mục từ FarmContext
  const { breedOptions, seasonOptions } = useFarm();

  const updateField = (key: keyof CycleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <SelectionInfoBox title="Chọn nguồn giống và vụ nuôi">
        <View style={styles.breedSection}>
          <View style={styles.inputGroupNoMargin}>
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
              height={40}
              borderRadius={6}
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
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
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
              height={40}
              borderRadius={6}
            />
          </View>
          <View style={styles.col}>
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
        <DateInputButton
          label="Ngày thả"
          date={formData.stockingDate ? new Date(formData.stockingDate) : null}
          onDateChange={date => updateField('stockingDate', date.toISOString())}
        />

        <View style={styles.row}>
          <View style={styles.col65}>
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
          <View style={styles.col35}>
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

        {/* Calculated Info Box */}
        <View style={styles.calcWrapper}>
          <View style={styles.calcBox}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Mật độ (con/m²)</Text>
              <Text style={styles.calcValue}>{formData.density || '-'}</Text>
            </View>
            <View style={styles.calcRowLast}>
              <Text style={styles.calcLabel}>Tổng chi phí giống ước tính (VNĐ)</Text>
              <Text style={styles.calcValue}>{formData.estimatedCost || '-'}</Text>
            </View>
          </View>
          <Text style={styles.calcHint}>
            Kết quả được hệ thống tính tự động từ các số liệu bạn đã nhập
          </Text>
        </View>
      </SelectionInfoBox>

      <SelectionNotesBox
        notes={formData.notes || ''}
        onNotesChange={text => updateField('notes', text)}
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
  breedSection: {
    gap: spacing.sm,
  },
  inputGroup: {
    width: '100%',
  },
  inputGroupNoMargin: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  required: {
    color: colors.error,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  calcWrapper: {
    gap: spacing.xs,
  },
  calcBox: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.defaultBorder,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  calcRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcLabel: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text,
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  calcHint: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  disabledInput: {
    backgroundColor: colors.gray[100],
  },
});
