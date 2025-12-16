import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, spacing, borderRadius, shadows } from '@/styles';
import IconEnvironment from '@/assets/images/Icon/IconDevices/EnvironmentOutlined.svg';

export interface DropDownItem {
  id: string | number;
  label: string;
  value?: any;
}

interface DropDownButtonBasicProps {
  data?: DropDownItem[];
  value?: DropDownItem;
  onSelect?: (item: DropDownItem) => void;
  style?: StyleProp<ViewStyle>;
  showIcon?: boolean;
}

const DEFAULT_DATA: DropDownItem[] = [
  { id: '1', label: 'Trại Kiên Giang' },
  { id: '2', label: 'Trại Cà Mau' },
  { id: '3', label: 'Trại Bạc Liêu' },
];

export const DropDownButtonBasic: React.FC<DropDownButtonBasicProps> = ({
  data = DEFAULT_DATA,
  value,
  onSelect,
  style,
  showIcon = true,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<DropDownItem>(value || data[0]);
  const dropdownButtonRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const handleDropdownPress = () => {
    if (dropdownButtonRef.current) {
      dropdownButtonRef.current.measureInWindow((x, y, width, height) => {
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
    setCurrentItem(item);
    setIsDropdownVisible(false);
    onSelect?.(item);
  };

  const renderItem = ({ item }: { item: DropDownItem }) => {
    const isSelected = item.id === currentItem.id;
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
    <View style={[styles.container, style]}>
      {/* Dropdown Picker */}
      <View ref={dropdownButtonRef} collapsable={false}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleDropdownPress}
          activeOpacity={0.7}
        >
          {showIcon && <IconEnvironment width={18} height={18} style={styles.locationIcon} />}
          <Text style={styles.locationText} numberOfLines={1}>
            {currentItem.label}
          </Text>
          <Ionicons
            name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
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
              data={data}
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
  container: {
    // Just a wrapper mostly for positioning the modal relative to button if needed,
    // but measureInWindow is used so simpler view is fine.
    // Removing header styles.
    zIndex: 1000,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  locationIcon: {
    width: 18,
    height: 18,
    marginRight: spacing.xs,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginRight: spacing.xs,
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
