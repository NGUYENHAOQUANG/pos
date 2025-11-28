import { ResendCodeBtn } from '@/features/auth/components/ResendCodeBtn';
import { BackButton } from '@/shared/components/buttons/BackButton';
import { Button } from '@/shared/components/buttons/Button';
import { Input } from '@/shared/components/forms/Input';
import { Logo } from '@/shared/components/brand/Logo';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList } from '@/app/navigation/types';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/styles';

export default function VerifyOTPScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Verify-otp'>>();
  const [otpCode, setOtpCode] = useState('');
  const insets = useSafeAreaInsets();
  const { method, contact } = route.params;
  const isPhone = method === 'phone';
  const targetText = contact
    ? isPhone
      ? `số điện thoại ${contact}`
      : `email ${contact}`
    : isPhone
    ? 'số điện thoại của bạn'
    : 'email của bạn';

  const handleVerifyOTP = () => {
    console.log('Verify OTP pressed', {
      otpCode,
      method,
      contact,
    });
    navigation.navigate('Create-password' as never);
  };

  const handleResendOTP = () => {
    console.log('Resend OTP pressed', { method, contact });
  };
  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
    >
      {Platform.OS === 'android' && (
        <View style={[styles.androidStatusBar, { height: insets.top }]} />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <BackButton />
            <View style={styles.logoContainer}>
              <Logo size="medium" />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Xác thực OTP</Text>
            <Text style={styles.subtitle}>
              Một mã xác thực đã được gửi tới {targetText}! Nhập mã xác thực để tiếp tục.
            </Text>

            {/* Input Fields */}
            <Input
              label="Mã xác thực"
              placeholder="Mã xác thực"
              value={otpCode}
              onChangeText={setOtpCode}
              icon="document-text-outline"
              keyboardType="number-pad"
              required
            />

            {/* OTP Button */}
            <View style={styles.buttonContainer}>
              <Button title="Xác thực OTP" onPress={handleVerifyOTP} variant="primary" fullWidth />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bạn chưa nhận được mã?</Text>
          <ResendCodeBtn title="Gửi lại" onPress={handleResendOTP} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
    minHeight: 45,
    paddingTop: spacing.md,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    paddingTop: 80,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
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
    marginBottom: spacing.xl,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    opacity: 1,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  buttonContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 1,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  androidStatusBar: {
    backgroundColor: colors.white,
  },
});
