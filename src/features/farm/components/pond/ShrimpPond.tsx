import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/styles';
import { PondTypeTag, PondType } from './PondTypeTag';
import { ButtonHeader } from '../ButtonHeader';

interface ShrimpPondProps {
  name: string;
  area: string;
  type: PondType;
  lastUpdate?: string;
  lastActivity?: string;
  onMenuPress?: () => void;
  onDetailPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ShrimpPond: React.FC<ShrimpPondProps> = ({
  name,
  area,
  type,
  lastUpdate,
  lastActivity,
  onMenuPress,
  onDetailPress,
  style,
}) => {
  // If no update/activity provided, consider it empty/no-data mode
  const hasData = !!lastUpdate || !!lastActivity;

  return (
    <View style={[styles.container, style]}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image
            source={require('@/assets/images/Icon/IconFarm/Pond.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.areaText}>{area}</Text>
        </View>
        <View style={styles.headerRight}>
          <PondTypeTag type={type} style={styles.tag} />
          <ButtonHeader onPress={onMenuPress} style={styles.menuBtn} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Info Section */}
      <View style={styles.body}>
        {hasData ? (
          <>
            <Text style={styles.bodyText}>
              Lần cập nhật gần nhất: <Text style={styles.bodyValue}>{lastUpdate || '-'}</Text>
            </Text>
            <Text style={[styles.bodyText, { marginTop: spacing.xs }]}>
              Hoạt động gần nhất: <Text style={styles.bodyValue}>{lastActivity || '-'}</Text>
            </Text>
          </>
        ) : (
          <Text style={styles.bodyEmptyText}>Ao chức năng không có dữ liệu công việc</Text>
        )}
      </View>

      {hasData && (
        <>
          <View style={styles.divider} />
          {/* Footer Section */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={onDetailPress}
              activeOpacity={0.7}
            >
              <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    ...shadows.sm, // Assuming a small shadow for card look
    borderWidth: 1,
    borderColor: colors.borderLight, // Or transparent if shadow is enough
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue[50], // Light blue bg for icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    width: 24,
    height: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  areaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  tag: {
    marginRight: spacing.xs,
    alignSelf: 'center',
  },
  menuBtn: {
    width: 32, // Smaller menu button in card? Image shows standard size but maybe compact
    height: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  body: {
    padding: spacing.md,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bodyValue: {
    color: colors.text,
  },
  bodyEmptyText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  footer: {
    padding: spacing.md,
  },
  detailButton: {
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  detailButtonText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
});
