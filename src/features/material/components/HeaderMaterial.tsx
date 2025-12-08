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

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Add padding for status bar on Android
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000, // Ensure header (and its dropdowns) stay on top
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
