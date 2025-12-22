import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';

interface WorkUnitItem {
  id: string;
  name: string;
}

interface WorkUnitProps {
  visible: boolean;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
  type: 'farm' | 'pond';
  data: WorkUnitItem[];
  initialSelected?: string[];
}

export const WorkUnit: React.FC<WorkUnitProps> = ({
  visible,
  onClose,
  onSave,
  data,
  initialSelected = [],
  type: _type,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  // Reset selection when modal opens or data changes
  useEffect(() => {
    if (visible) {
      setSelectedIds(initialSelected);
    }
  }, [visible, initialSelected]);

  const isAllSelected = data.length > 0 && data.every(item => selectedIds.includes(item.id));

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  const handleSave = () => {
    onSave(selectedIds);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Thêm đơn vị công tác</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Select All */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={toggleAll}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isAllSelected && styles.checkboxChecked]}>
                    {isAllSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </View>
                  <Text style={styles.itemText}>Chọn tất cả</Text>
                </TouchableOpacity>

                {/* List Items */}
                {data.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.checkboxRow}
                      onPress={() => toggleItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
                      </View>
                      <Text style={styles.itemText}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <Button
                  onPress={onClose}
                  variant="outline"
                  title="Huỷ"
                  style={[styles.button, styles.cancelButton]}
                  textStyle={styles.cancelButtonText}
                />
                <Button onPress={handleSave} variant="primary" title="Lưu" style={styles.button} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    maxHeight: '80%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 400,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  itemText: {
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    minWidth: 80,
    height: 40,
  },
  cancelButton: {
    borderColor: colors.borderDark,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
