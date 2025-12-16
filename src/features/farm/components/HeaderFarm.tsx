import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { ButtonHeader } from '@/features/farm/components/ButtonHeader';
import { PondTypeTag, PondType } from '@/features/farm/components/pond/PondTypeTag';

interface HeaderFarmProps {
  // Common
  onMenuPress?: () => void;
  menuOptions?: { value: string; onMenuOptionPress: () => void }[];

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
  menuOptions,
  title,
  subtitle,
  tagType,
  onBack,
  rightAction,
}: HeaderFarmProps) => {
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownRight, setDropdownRight] = useState(24);
  const buttonRef = React.useRef<View>(null);

  const openMenu = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        const windowWidth = Dimensions.get('window').width;
        const rightSpace = windowWidth - (px + width);

        setDropdownRight(rightSpace >= 0 ? rightSpace : 24);

        const statusbarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
        const top = py ? py + height - statusbarHeight + 4 : fy + height + 100;
        setDropdownTop(top || 200);

        setMenuVisible(true);
      });
    } else {
      setMenuVisible(true);
    }
  };

  const handleMenuOptionPress = (onMenuOptionPress: () => void) => {
    onMenuOptionPress();
    setMenuVisible(false);
  };

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
      <>
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
            <View ref={buttonRef} collapsable={false}>
              <ButtonHeader onPress={openMenu} style={styles.menuButtonDetail} />
            </View>
          </View>
        </View>

        {menuOptions && menuOptions.length > 0 && (
          <Modal
            visible={menuVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={[styles.menuContainer, { top: dropdownTop, right: dropdownRight }]}>
                  {menuOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleMenuOptionPress(option.onMenuOptionPress)}
                    >
                      <Text style={styles.menuText}>{option.value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </>
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
    paddingRight: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 200,
    zIndex: 100,
  },
  menuItem: {
    padding: 4,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  menuText: {
    fontSize: 16,
    color: colors.gray[800],
    fontWeight: '400',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
