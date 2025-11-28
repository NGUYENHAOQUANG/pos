import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles';

export interface FABMenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  backgroundColor?: string;
  iconColor?: string;
}

interface FloatingActionButtonProps {
  menuItems: FABMenuItem[];
  mainButtonColor?: string;
  mainButtonIcon?: string;
}

export function FloatingActionButton({
  menuItems,
  mainButtonColor = colors.primary,
  mainButtonIcon = 'add',
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Bottom bar height (75) + extra spacing
  const BOTTOM_BAR_HEIGHT = 75;
  const FAB_BOTTOM_OFFSET = BOTTOM_BAR_HEIGHT + insets.bottom + 20;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.spring(rotation, {
        toValue,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Menu Items */}
      <View
        style={[styles.menuContainer, { bottom: FAB_BOTTOM_OFFSET + 70 }]}
        pointerEvents={isOpen ? 'box-none' : 'none'}
      >
        {menuItems.map((item, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(10 * (index + 1))], // Reduced spacing for tighter stack
          });

          const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          });

          const opacity = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.menuItemWrapper,
                {
                  transform: [{ translateY }, { scale }],
                  opacity,
                  marginBottom: 16,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItemPill}
                onPress={() => {
                  toggleMenu();
                  item.onPress();
                }}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.backgroundColor || colors.primary + '20' },
                  ]}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color={item.iconColor || colors.primary}
                  />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Main FAB Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: mainButtonColor, bottom: FAB_BOTTOM_OFFSET }]}
        onPress={toggleMenu}
        activeOpacity={0.9}
      >
        <Animated.View
          style={{
            transform: [{ rotate: rotateInterpolate }],
          }}
        >
          <Icon name={mainButtonIcon} size={32} color={colors.white} />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    // bottom set dynamically
    right: 20,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  menuItemWrapper: {
    alignItems: 'flex-end',
  },
  menuItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 30, // Pill shape
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 160,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginRight: 16,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    // bottom set dynamically
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },
});
