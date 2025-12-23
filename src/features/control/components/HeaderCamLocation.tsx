import React from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, spacing, borderRadius } from '@/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

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

  // Adapt FarmLocation to DropDownItem
  const dropdownData: DropDownItem[] = locations.map(loc => ({
    id: loc.id,
    label: loc.name,
    value: loc,
  }));

  const selectedDropdownItem: DropDownItem | undefined = selectedLocation
    ? { id: selectedLocation.id, label: selectedLocation.name, value: selectedLocation }
    : dropdownData[0];

  const handleSelect = (item: DropDownItem) => {
    if (onLocationSelect && item.value) {
      onLocationSelect(item.value);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }, style]}>
      {/* Location Picker Reuse */}
      <View style={styles.locationContainer}>
        <DropDownButtonBasic
          data={dropdownData}
          value={selectedDropdownItem}
          onSelect={handleSelect}
          showIcon={true}
          height={40}
        />
      </View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
      </TouchableOpacity>
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
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
  },
  locationContainer: {
    flex: 1,
    marginRight: 16,
    alignItems: 'flex-start',
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
});
