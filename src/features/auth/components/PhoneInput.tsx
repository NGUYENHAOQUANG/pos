/**
 * @file PhoneInput.tsx
 * @description Phone input component using Ant Design React Native InputItem with country code picker
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-11-17 - Migrated to ANTD-RN InputItem
 * @see https://rn.mobile.ant.design/components/input-item
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { List, InputItem } from '@ant-design/react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, sizes } from '@/styles';

// Country codes data
const COUNTRY_CODES = [
  { code: "+84", country: "Vietnam", flag: "🇻🇳", length: 9 },
  { code: "+1", country: "USA", flag: "🇺🇸", length: 10 },
  { code: "+86", country: "China", flag: "🇨🇳", length: 11 },
  { code: "+81", country: "Japan", flag: "🇯🇵", length: 10 },
  { code: "+82", country: "South Korea", flag: "🇰🇷", length: 10 },
  { code: "+65", country: "Singapore", flag: "🇸🇬", length: 8 },
  { code: "+66", country: "Thailand", flag: "🇹🇭", length: 9 },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", length: 9 },
  { code: "+63", country: "Philippines", flag: "🇵🇭", length: 10 },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", length: 10 },
  { code: "+44", country: "UK", flag: "🇬🇧", length: 10 },
];

interface PhoneInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  required?: boolean;
  error?: string;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  placeholder = "909 123 456",
  value: _value,
  onChangeText,
  required = false,
  error,
  countryCode: externalCountryCode,
  onCountryCodeChange,
}) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (externalCountryCode) {
      const country = COUNTRY_CODES.find((c) => c.code === externalCountryCode);
      if (country) setSelectedCountry(country);
    }
  }, [externalCountryCode]);

  // Auto-detect country code from input
  const detectAndFormatPhone = (input: string) => {
    // Remove all non-numeric characters
    const cleaned = input.replace(/\D/g, "");

    // If starts with 0 (Vietnam format), convert to +84
    if (cleaned.startsWith("0") && cleaned.length >= 10) {
      const withoutZero = cleaned.substring(1);
      const detected = COUNTRY_CODES[0]; // Vietnam
      setSelectedCountry(detected);
      setPhoneNumber(withoutZero);
      onCountryCodeChange?.(detected.code);
      onChangeText(`${detected.code}${withoutZero}`);
      return;
    }

    // Check if input starts with country code
    for (const country of COUNTRY_CODES) {
      const code = country.code.replace("+", "");
      if (cleaned.startsWith(code)) {
        const numberWithoutCode = cleaned.substring(code.length);
        setSelectedCountry(country);
        setPhoneNumber(numberWithoutCode);
        onCountryCodeChange?.(country.code);
        onChangeText(`${country.code}${numberWithoutCode}`);
        return;
      }
    }

    // Normal input
    setPhoneNumber(cleaned);
    onChangeText(`${selectedCountry.code}${cleaned}`);
  };

  const handlePhoneChange = (text: string) => {
    detectAndFormatPhone(text);
  };

  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    onCountryCodeChange?.(country.code);
    setModalVisible(false);
    onChangeText(`${country.code}${phoneNumber}`);
  };

  const formatPhoneDisplay = (phone: string) => {
    // Format for display (add spaces every 3 digits)
    return phone.replace(/(\d{3})(?=\d)/g, "$1 ");
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <List style={[styles.listContainer, error && styles.listContainerError]}>
        <View style={styles.inputWrapper}>
          {/* Country Code Selector */}
          <TouchableOpacity
            style={styles.countryCodeButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>{selectedCountry.flag}</Text>
            <Text style={styles.countryCode}>{selectedCountry.code}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Phone Number Input with Icon */}
          <Ionicons
            name="call-outline"
            size={sizes.icon.sm}
            color={colors.textSecondary}
            style={styles.icon}
          />

          {/* ANTD-RN InputItem */}
          <View style={styles.inputItemWrapper}>
            <InputItem
              value={formatPhoneDisplay(phoneNumber)}
              onChange={handlePhoneChange}
              placeholder={placeholder}
              type="phone"
              clear={false}
              editable={true}
              styles={{
                container: styles.antdContainer,
                input: styles.antdInput,
              }}
            >
              {''}
            </InputItem>
          </View>
        </View>
      </List>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Country Code Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn mã vùng</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    item.code === selectedCountry.code &&
                      styles.countryItemSelected,
                  ]}
                  onPress={() => handleCountrySelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.country}</Text>
                  <Text style={styles.countryCodeText}>{item.code}</Text>
                  {item.code === selectedCountry.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  listContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  listContainerError: {
    borderColor: colors.error,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.md,
    minHeight: sizes.input.lg,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.sm,
    gap: spacing.xs,
  },
  flag: {
    fontSize: typography.fontSize.lg,
  },
  countryCode: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  inputItemWrapper: {
    flex: 1,
  },
  antdContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingLeft: 0,
    height: sizes.input.lg - 2,
    minHeight: sizes.input.lg - 2,
  },
  antdInput: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "70%",
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  countryItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  countryFlag: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing.md,
  },
  countryName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  countryCodeText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
});
