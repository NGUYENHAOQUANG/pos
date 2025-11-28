import { spacing } from '@/styles';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { FilterSelector } from './FilterSelector';

export interface FilterRowProps {
  breedingArea?: {
    value?: string;
    onPress: () => void;
    onClear?: () => void;
  };
  pond?: {
    value?: string;
    onPress: () => void;
    onClear?: () => void;
  };
  crop?: {
    value?: string;
    onPress: () => void;
    onClear?: () => void;
  };
  containerStyle?: ViewStyle;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  breedingArea,
  pond,
  crop,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.row}>
        <View style={styles.columnLeft}>
          <FilterSelector
            label="Vùng nuôi"
            value={breedingArea?.value}
            onPress={breedingArea?.onPress || (() => {})}
            onClear={breedingArea?.onClear}
          />
        </View>
        <View style={styles.columnRight}>
          <FilterSelector
            label="Ao"
            value={pond?.value}
            onPress={pond?.onPress || (() => {})}
            onClear={pond?.onClear}
          />
        </View>
      </View>

      {crop && (
        <View style={styles.fullWidthRow}>
          <FilterSelector
            label="Vụ"
            value={crop.value}
            onPress={crop.onPress}
            onClear={crop.onClear}
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  columnLeft: {
    flex: 1,
    marginRight: spacing.sm / 2,
  },
  columnRight: {
    flex: 1,
    marginLeft: spacing.sm / 2,
  },
  fullWidthRow: {
    width: '100%',
  },
});
