import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Input } from '@/shared/components/forms/Input';
import SimpleDropdown from '../SimpleDropdown';
import { DateTimePickerField } from '../DateTimePickerField';
import { RequiredLabel } from '../RequiredLabel';
import BreedInfoCard from '../BreedInfoCard';
import { colors, spacing, typography, borderRadius, shadows } from '@/styles';
import { useCycle } from '../../context/CycleContext';
import NoteInput from "../NoteInput";
import CustomInput from '../CustomInput';
interface Props {
}

const CreateCycleForm: React.FC<Props> = () => {
  // Lấy dữ liệu và logic từ Context
  const {
    formData,
    updateField,
    breedOptions,
    seasonOptions,
    handleCreateSeason,
    selectedBreed,
    selectedSeason,
  } = useCycle();

  /* ===== SECTION 1 ===== */
  const Section1 = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn nguồn giống và vụ nuôi</Text>
        <RequiredLabel label="Chọn tôm giống" />
        <SimpleDropdown
          placeholder="Chọn"
          data={breedOptions}
          value={selectedBreed}
          onSelect={item => updateField('breedSource', item.value)}
        />

        {selectedBreed && (
          <BreedInfoCard
            materialCode={selectedBreed.materialCode}
            price={selectedBreed.price}
            supplier={selectedBreed.supplier}
          />
        )}

        <View style={styles.row}>
          <View style={styles.col}>
            <RequiredLabel label="Chọn vụ nuôi" />
            <SimpleDropdown
              placeholder="Chọn"
              data={seasonOptions}
              value={selectedSeason}
              onSelect={item => updateField('seasonSource', item.value)}
              onCreate={handleCreateSeason}
              createLabel="+ Tạo vụ nuôi"
            />
          </View>

          <View style={styles.col}>
            <CustomInput
              label="Tên chu kỳ"
              placeholder="Tên chu kỳ"
              value={formData.cycleName}
              onChangeText={text => updateField('cycleName', text)}
              required={true}
              inputStyle={{ backgroundColor: '#E2E8F0' }}
              placeholderTextColor={colors.text}
            />
          </View>
        </View>
      </View>
    );
  };

  /* ===== SECTION 2 ===== */
  const Section2 = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thông tin thả giống</Text>

      <DateTimePickerField
        label="Ngày thả"
        value={formData.stockingDate ? new Date(formData.stockingDate) : null}
        onChange={date => updateField('stockingDate', date.toISOString())}
      />

      <View style={styles.row}>
        <View style={styles.col65}>
          <CustomInput
            label="Tổng số lượng thả (PLs)"
            keyboardType="numeric"
            placeholder="Vd: 200.000"
            value={formData.stockingQuantity ? String(formData.stockingQuantity) : ''}
            onChangeText={t => updateField('stockingQuantity', Number(t))}
            required
          />
        </View>

        <View style={styles.col35}>
          <CustomInput
            label="Ngày tuổi (PLs)"
            keyboardType="numeric"
            placeholder="Vd: 10"
            value={formData.age ? String(formData.age) : ''}
            onChangeText={t => updateField('age', Number(t))}
            required
          />
        </View>
      </View>
      <View style={styles.calcBox}>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Mật độ (con/m²)</Text>
          <Text style={styles.calcValue}>
            {formData.density || '-'}
          </Text>
        </View>

        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>
            Tổng chi phí giống ước tính (VNĐ)
          </Text>
          <Text style={styles.calcValue}>
            {formData.estimatedCost || '-'}
          </Text>
        </View>
      </View>

      <Text style={styles.calcHint}>
        Kết quả được hệ thống tính tự động từ các số liệu bạn đã nhâp
      </Text>
    </View>
  );

  /* ===== SECTION 3 ===== */
  const Section3 = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, styles.noBorderTitle]}>Ghi chú</Text>
      <NoteInput
          placeholder="Nhập ghi chú"
          value={formData.notes}
          onChangeText={t => updateField('notes', t)}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Section1 />
      <Section2 />
      <Section3 />
    </ScrollView>
  );
};

export default CreateCycleForm;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },

  section: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: 0,
    width: '100%',
    borderRadius: 0,
    ...shadows.sm,
  },

  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,

    paddingVertical: spacing.sm,
    textAlignVertical: 'center',

    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,

    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 0,
    alignItems: 'flex-start',
  },

  col: { flex: 1 },
  col65: {
    flex: 65,
  },

  col35: {
    flex: 35,
  },
  verticalSpacing: {
    marginBottom: spacing.sm,
  },

  /* ===== CALC BOX ===== */
  calcBox: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    marginTop: spacing.md,
  },

  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },

  calcLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
  },

  calcValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },

  calcHint: {
    fontSize: typography.fontSize.xs - 2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  noBorderTitle: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
});