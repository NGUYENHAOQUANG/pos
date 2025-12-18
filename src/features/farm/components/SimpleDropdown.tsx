import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography, sizes, borderRadius, shadows } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
export interface DropdownItem {
  label: string;
  value: string;
}

interface Props {
  placeholder?: string;
  data: DropdownItem[];
  value: DropdownItem | null;
  onSelect: (item: DropdownItem) => void;
  onCreate?: () => void;
  createLabel?: string;
}

const SimpleDropdown: React.FC<Props> = ({
  placeholder = 'Chọn',
  data,
  value,
  onSelect,
  onCreate,
  createLabel = '+ Tạo vụ nuôi',
}) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<View | null>(null);

  const openDropdown = () => {
    if (buttonRef.current && (buttonRef.current as any).measureInWindow) {
      (buttonRef.current as any).measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setPos({ top: y + height + 6, left: x, width });
          setVisible(true);
        }
      );
    } else {
      setVisible(true);
    }
  };

  const closeDropdown = () => setVisible(false);

  const handleCreatePress = () => {
    if (onCreate) onCreate();
    closeDropdown();
  };

  const renderFooter = () => (
    <TouchableOpacity style={styles.createRow} onPress={handleCreatePress}>
      <Text style={styles.createText}>{createLabel}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View ref={buttonRef} collapsable={false as true}>
        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={openDropdown}>
          <Text style={[styles.text, !value && styles.placeholder]}>{value ? value.label : placeholder}</Text>
          <Ionicons
            name="chevron-down"
            size={18}
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={visible} animationType="none" onRequestClose={closeDropdown}>
        <View style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback onPress={closeDropdown}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.dropdown,
              {
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                minWidth: pos.width || undefined,
              } as ViewStyle,
            ]}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListFooterComponent={onCreate ? renderFooter : null}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SimpleDropdown;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.inputBackground,
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  icon: {
    fontSize: (sizes as any)?.icon?.md ?? 16,
    color: colors.textSecondary,
  },
  overlay: { flex: 1, backgroundColor: 'transparent' },
  dropdown: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: borderRadius?.sm ?? 8,
    maxHeight: 300,
    overflow: 'hidden',
    ...shadows?.sm,
    elevation: 4,
  },
  dropdownIcon: {
    color: colors.textSecondary,
    opacity: 0.5,
  },
  item: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundPrimary,
  },
  itemText: { fontSize: typography.fontSize.base, color: colors.text },
  createRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
  },
  createText: {
    fontSize: typography.fontSize.base,
    color: (colors as any).primary ?? '#2563EB',
    fontWeight: typography.fontWeight.semibold as unknown as string,
  },
});