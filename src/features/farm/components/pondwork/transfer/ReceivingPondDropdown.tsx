import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, shadows } from '@/styles';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { ReceivingPondItem } from './TransferInfoBox';

interface ReceivingPondDropdownProps {
  pond: ReceivingPondItem;
  onSelect: (pondId: string, selectedPondId: string) => void;
  pondOptions: DropDownItem[];
}

export const ReceivingPondDropdown: React.FC<ReceivingPondDropdownProps> = ({
  pond,
  onSelect,
  pondOptions,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const selectedPond = pondOptions.find(p => p.id === pond.receivingPond);
  const displayText = selectedPond?.label || 'Chọn';

  const handleDropdownPress = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height + 4,
          left: x,
          width: width,
        });
        setIsDropdownVisible(true);
      });
    }
  };

  const handleSelect = (item: DropDownItem) => {
    onSelect(pond.id, item.id.toString());
    setIsDropdownVisible(false);
  };

  const renderItem = ({ item }: { item: DropDownItem }) => {
    const isSelected = item.id.toString() === pond.receivingPond;
    return (
      <TouchableOpacity
        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
          {item.label}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.dropdownWrapper}>
      <View ref={dropdownRef} collapsable={false}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleDropdownPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.selectText, !pond.receivingPond && styles.placeholderText]}>
            {displayText}
          </Text>
          <Ionicons
            name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdownContainer,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                minWidth: dropdownPosition.width,
              },
            ]}
          >
            <FlatList
              data={pondOptions}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              scrollEnabled={false}
              contentContainerStyle={styles.dropdownScrollContent}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownWrapper: {
    zIndex: 1000,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  selectText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...shadows.md,
  },
  dropdownScrollContent: {
    paddingVertical: spacing.xs,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dropdownItemSelected: {
    backgroundColor: colors.blue[50],
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '500',
    color: colors.text,
  },
});
