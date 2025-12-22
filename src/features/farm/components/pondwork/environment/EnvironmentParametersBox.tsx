import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { IconError } from '@/assets/icons';

interface EnvironmentParametersBoxProps {
  pH: string;
  onPHChange: (value: string) => void;
  do: string;
  onDOChange: (value: string) => void;
  temperature: string;
  onTemperatureChange: (value: string) => void;
  salinity: string;
  onSalinityChange: (value: string) => void;
  alkalinity: string;
  onAlkalinityChange: (value: string) => void;
  transparency: string;
  onTransparencyChange: (value: string) => void;
  onSetupPress?: () => void;
  showError?: boolean;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  keyboardType = 'numeric',
}) => {
  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Input"
        placeholderTextColor={colors.borderSubtle}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export const EnvironmentParametersBox: React.FC<EnvironmentParametersBoxProps> = ({
  pH,
  onPHChange,
  do: doValue,
  onDOChange,
  temperature,
  onTemperatureChange,
  salinity,
  onSalinityChange,
  alkalinity,
  onAlkalinityChange,
  transparency,
  onTransparencyChange,
  onSetupPress,
  showError = false,
}) => {
  return (
    <SelectionInfoBox title="Chỉ số môi trường">
      {showError && (
        <View style={styles.errorBox}>
          <IconError width={16} height={16} />
          <Text style={styles.errorText}>Vui lòng nhập ít nhất 1 chỉ số</Text>
        </View>
      )}
      <View style={styles.inputsContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          <View style={styles.column}>
            <InputField label="pH (1-14)" value={pH} onChangeText={onPHChange} />
          </View>
          <View style={styles.column}>
            <InputField label="DO (mg/L)" value={doValue} onChangeText={onDOChange} />
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <View style={styles.column}>
            <InputField
              label="Nhiệt độ (°C)"
              value={temperature}
              onChangeText={onTemperatureChange}
            />
          </View>
          <View style={styles.column}>
            <InputField label="Độ mặn (ppt)" value={salinity} onChangeText={onSalinityChange} />
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <View style={styles.column}>
            <InputField
              label="Độ kiềm (mg/L)"
              value={alkalinity}
              onChangeText={onAlkalinityChange}
            />
          </View>
          <View style={styles.column}>
            <InputField
              label="Độ trong (cm)"
              value={transparency}
              onChangeText={onTransparencyChange}
            />
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Setup Button */}
      {onSetupPress && (
        <TouchableOpacity style={styles.setupButton} onPress={onSetupPress} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={16} color={colors.primary} />
          <Text style={styles.setupButtonText}>Thiết lập chỉ số môi trường</Text>
        </TouchableOpacity>
      )}
    </SelectionInfoBox>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: spacing.sm,
  },
  errorText: {
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    flex: 1,
  },
  inputsContainer: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  inputField: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  textInput: {
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    fontSize: 14,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: -spacing.md,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    height: 32,
  },
  setupButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primary,
    lineHeight: 22,
  },
});
