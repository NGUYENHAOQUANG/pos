import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { ButtonHeader } from '@/features/farm/components/ButtonHeader';

interface HeaderReportsProps {
  data?: DropDownItem[];
  value?: DropDownItem;
  onSelect?: (item: DropDownItem) => void;
  onRightPress?: () => void;
}

export const HeaderReports = ({ data, value, onSelect, onRightPress }: HeaderReportsProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftContainer}>
        {onSelect && (
          <DropDownButtonBasic data={data} value={value} onSelect={onSelect} height={40} />
        )}
      </View>

      <View style={styles.rightContainer}>
        <ButtonHeader onPress={onRightPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    paddingRight: 0, // Reset to 0 as main padding handles it
  },
});
