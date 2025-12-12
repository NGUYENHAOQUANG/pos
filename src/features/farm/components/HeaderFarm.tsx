import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles';
import { DropDownButtonBasic, DropDownItem } from './DropDownButtonBasic';
import { ButtonHeader } from './ButtonHeader';

interface HeaderFarmProps {
  data?: DropDownItem[];
  value?: DropDownItem;
  onSelect: (item: DropDownItem) => void;
  onMenuPress?: () => void;
}

export const HeaderFarm = ({ data, value, onSelect, onMenuPress }: HeaderFarmProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.leftContainer}>
        <DropDownButtonBasic data={data} value={value} onSelect={onSelect} />
      </View>

      <View style={styles.rightContainer}>
        <ButtonHeader onPress={onMenuPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    // Add shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  leftContainer: {
    flex: 1,
    marginRight: 16,
    alignItems: 'flex-start',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
