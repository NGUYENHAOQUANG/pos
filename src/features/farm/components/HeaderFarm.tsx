import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { DropDownButtonBasic, DropDownItem } from './DropDownButtonBasic';
import { ButtonHeader } from './ButtonHeader';
import { PondTypeTag, PondType } from './pond/PondTypeTag';

interface HeaderFarmProps {
  // Common
  onMenuPress?: () => void;

  // Mode: 'list' (default) or 'detail' or 'simple'
  type?: 'list' | 'detail' | 'simple';

  // Specific to 'list' mode
  data?: DropDownItem[];
  value?: DropDownItem;
  onSelect?: (item: DropDownItem) => void;

  // Specific to 'detail' mode
  title?: string; // e.g. Pond Name
  subtitle?: string; // e.g. Area
  tagType?: PondType;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const HeaderFarm = ({
  type = 'list',
  data,
  value,
  onSelect,
  onMenuPress,
  title,
  subtitle,
  tagType,
  onBack,
  rightAction,
}: HeaderFarmProps) => {
  const insets = useSafeAreaInsets();

  /**
   * Render Simple Mode (Back, Title Center)
   */
  if (type === 'simple') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonSimple}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.simpleTitle}>{title}</Text>
        {rightAction ? (
          <View style={styles.rightActionContainer}>{rightAction}</View>
        ) : (
          <View style={styles.placeholderButton} />
        )}
      </View>
    );
  }

  /**
   * Render Detail Mode (Back, Icon, Info, Tag, Menu)
   */
  if (type === 'detail') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.detailLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <Image
              source={require('@/assets/images/Icon/IconFarm/Pond.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.pondName}>{title || '---'}</Text>
            <Text style={styles.pondArea}>{subtitle || '---'}</Text>
          </View>
        </View>
        <View style={styles.detailRight}>
          {tagType && <PondTypeTag type={tagType} style={styles.tag} />}
          <ButtonHeader onPress={onMenuPress} style={styles.menuButtonDetail} />
        </View>
      </View>
    );
  }

  /**
   * Render List Mode (Dropdown, Menu) - Default
   */
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftContainer}>
        {onSelect && <DropDownButtonBasic data={data} value={value} onSelect={onSelect} />}
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
    paddingTop: spacing.md, // fallback if insets not used/zero
    paddingBottom: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
  },
  // --- List Mode Styles ---
  leftContainer: {
    flex: 1,
    marginRight: 16,
    alignItems: 'flex-start',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // --- Detail Mode Styles ---
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderDark, // Matching the user's latest change
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    width: 24,
    height: 24,
  },
  infoContainer: {
    justifyContent: 'center',
  },
  pondName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  pondArea: {
    fontSize: 12,
    color: colors.text,
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    marginRight: spacing.sm,
    alignSelf: 'center',
  },
  menuButtonDetail: {
    // Override default ButtonHeader styles if needed specific for this screen
    // width: 36, // Removed to match default 40
    // height: 36, // Removed to match default 40
  },
  backButtonSimple: {
    padding: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.sm,
  },
  simpleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  placeholderButton: {
    width: 40,
  },
  rightActionContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
});
