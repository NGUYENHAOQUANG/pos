import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderMeterialProps {
  title?: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
}

export const HeaderMeterial: React.FC<HeaderMeterialProps> = ({
  title = 'Quản Lý Vật Tư',
  onBackPress,
  rightComponent,
  showBackButton = true,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.side}>
        {showBackButton && (
          <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={[styles.side, styles.right]}>{rightComponent}</View>
    </View>
  );
};

const SIDE_WIDTH = 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
  },

  side: {
    width: SIDE_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  right: {
    alignItems: 'flex-end',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    flexWrap: 'wrap',
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
