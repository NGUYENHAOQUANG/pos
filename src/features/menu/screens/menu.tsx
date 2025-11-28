import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar } from "react-native";
import { List } from '@ant-design/react-native';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '@/styles';

export default function MenuScreen() {
  const insets = useSafeAreaInsets();

  const menuSections = [
    {
      title: "Tài khoản",
      items: [
        { icon: "person-outline", label: "Thông tin cá nhân", onPress: () => {} },
        { icon: "settings-outline", label: "Cài đặt", onPress: () => {} },
      ],
    },
    {
      title: "Hỗ trợ",
      items: [
        { icon: "help-circle-outline", label: "Trợ giúp", onPress: () => {} },
        { icon: "document-text-outline", label: "Điều khoản sử dụng", onPress: () => {} },
        { icon: "shield-checkmark-outline", label: "Chính sách bảo mật", onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Android status bar spacer */}
      {Platform.OS === "android" && (
        <View style={{ height: insets.top, backgroundColor: colors.white }} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Người dùng</Text>
            <Text style={styles.profileEmail}>user@example.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <List style={styles.menuList}>
              {section.items.map((item, itemIndex) => (
                <List.Item
                  key={itemIndex}
                  thumb={<Ionicons name={item.icon} size={22} color={colors.textSecondary} />}
                  arrow="horizontal"
                  onPress={item.onPress}
                  style={styles.listItem}
                >
                  {item.label}
                </List.Item>
              ))}
            </List>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={() => console.log("Logout")}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    ...commonStyles.header,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  menuSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  listItem: {
    paddingVertical: spacing.xs,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
