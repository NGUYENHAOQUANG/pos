import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import { TimePickerModal } from './TimePickerModal';
import { colors } from '@/styles';

interface ModalAddTurnProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ModalAddTurn({
  label,
  value,
  onChange,
  placeholder = 'chọn thời gian',
  style,
}: ModalAddTurnProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
        <View style={[styles.inputContainer, value ? { borderColor: colors.primary } : undefined]}>
          <TextInput
            style={[styles.input, value ? styles.activeInput : undefined]}
            placeholder={placeholder}
            placeholderTextColor={colors.gray[400]}
            value={formatTime(value)}
            editable={false}
            pointerEvents="none"
          />
          <Icon
            name="clock"
            size={16}
            color={value ? colors.primary : colors.gray[400]}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>

      <TimePickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        time={value}
        onSelectTime={date => {
          onChange(date);
          setPickerVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    height: 45,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text,
  },
  activeInput: {
    color: colors.text,
  },
  icon: {
    marginLeft: 5,
  },
});
