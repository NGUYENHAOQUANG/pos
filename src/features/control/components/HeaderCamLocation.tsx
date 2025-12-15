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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EnvironmentIcon from '@/assets/images/Icon/IconDevices/EnvironmentOutlined.svg';

export interface FarmLocation {
  id: string;
  name: string;
}

interface HeaderCamLocationProps {
  locations?: FarmLocation[];
  selectedLocation?: FarmLocation;
  onLocationSelect?: (location: FarmLocation) => void;
  onMenuPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_LOCATIONS: FarmLocation[] = [
  { id: '1', name: 'Trại Kiên Giang' },
  { id: '2', name: 'Trại Cà Mau' },
  { id: '3', name: 'Trại Bạc Liêu' },
  { id: '4', name: 'Trại Sóc Trăng' },
];

export const HeaderCamLocation: React.FC<HeaderCamLocationProps> = ({
  locations = DEFAULT_LOCATIONS,
  selectedLocation,
  onLocationSelect,
  onMenuPress,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<FarmLocation>(
    selectedLocation || locations[0]
  );
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const locationButtonRef = useRef<View>(null);

  const handleLocationPress = () => {
    if (locationButtonRef.current) {
      locationButtonRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height + 4,
          left: x,
          width: width,
        });
        setIsDropdownVisible(true);
      });
    }
  };

  const handleSelectLocation = (location: FarmLocation) => {
    setCurrentLocation(location);
    setIsDropdownVisible(false);
    onLocationSelect?.(location);
  };

  const renderLocationItem = ({ item }: { item: FarmLocation }) => {
    const isSelected = item.id === currentLocation.id;
    return (
      <TouchableOpacity
        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
        onPress={() => handleSelectLocation(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
          {item.name}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }, style]}>
      {/* Location Picker */}
      <View ref={locationButtonRef} collapsable={false}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleLocationPress}
          activeOpacity={0.7}
        >
          <EnvironmentIcon width={18} height={18} style={styles.locationIcon} />
          <Text style={styles.locationText}>{currentLocation.name}</Text>
          <Ionicons
            name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
      </TouchableOpacity>

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
              data={locations}
              keyExtractor={item => item.id}
              renderItem={renderLocationItem}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderDark,
    backgroundColor: colors.white,
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
    backgroundColor: colors.gray[100],
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
