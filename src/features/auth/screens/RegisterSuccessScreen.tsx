import React from "react";
import { useNavigation } from '@react-navigation/native';
import type { AuthStackNavigationProp } from '@/app/navigation/types';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Button } from "@/shared/components/buttons/Button";
import { Logo } from "@/shared/components/brand/Logo";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, commonStyles } from '@/styles';

export default function PasswordSuccessScreen() {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView
      style={commonStyles.container}
      edges={Platform.OS === "ios" ? ["top", "bottom"] : ["bottom"]}
    >
      {Platform.OS === "android" && (
        <View style={[styles.androidStatusBar, { height: insets.top }]} />
      )}

      {/* Header: giữ logo nhưng không dùng absolute */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo size="medium" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconBackground}>
          <Ionicons name="checkmark" size={60} color={colors.success} />
        </View>

        <Text style={styles.title}>HOÀN TẤT !</Text>

        <Text style={styles.subtitle}>Mật khẩu được tạo thành công!</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Đăng Nhập"
            onPress={handleLogin}
            variant="primary"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Header + logo: giống ý tưởng của OnboardingScreen */
  header: {
    // giữ 1 vùng trên để logo không chạm đỉnh
    paddingHorizontal: spacing.lg,
    // Có thể điều chỉnh marginTop nếu muốn nhiều khoảng cách hơn
    paddingTop: spacing.sm,
    paddingBottom: 0,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: spacing.sm, // quan trọng: tạo khoảng cách ở trên
    marginBottom: spacing['2xl'], // khoảng cách giữa logo và phần nội dung
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    flexGrow: 0.70,
    justifyContent: "center",
  },

  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    borderWidth: 5,
    borderColor: colors.success,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
    opacity: 1,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center',
      },
    }),
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing.xl,
    opacity: 1,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacing.lg,
  },
  androidStatusBar: {
    backgroundColor: colors.white,
  },
});
