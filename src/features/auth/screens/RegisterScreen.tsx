import { BackButton } from "@/shared/components/buttons/BackButton";
import { Button } from "@/shared/components/buttons/Button";
import { Input } from "@/shared/components/forms/Input";
import { Logo } from "@/shared/components/brand/Logo";
import { SegmentedControl } from "@/shared/components/forms/SegmentedControl";
import PhoneInput from "@/features/auth/components/PhoneInput";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/app/navigation/types';
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { colors, spacing, typography, commonStyles } from '@/styles';
import { authApi } from '../api/authApi';

export default function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+84");
  const insets = useSafeAreaInsets();

  const handleGetOTP = async () => {
    const method = selectedTab === 0 ? 'email' : 'phone';
    const contact = selectedTab === 0 ? email : phone;

    try {
        const response = await authApi.requestOtp(contact);
        console.log('OTP Response:', response);
        
        // In Dev environment, OTP is in response.data.testOtp
        const devOtp = response?.data?.testOtp;
        console.log('Full Response:', JSON.stringify(response));
        
        if (devOtp) {
             console.log('Dev OTP:', devOtp);
             // Optional: Keep a discreet toast or remove entirely based on user preference
             // For now removing explicit debug alert
        }

        navigation.navigate('Verify-otp', { 
            method, 
            contact,
            otpCode: devOtp ? String(devOtp) : undefined 
        });
        
    } catch (error) {
        console.error('Failed to request OTP:', error);
        Alert.alert('Lỗi', 'Không thể lấy mã OTP. Vui lòng kiểm tra lại kết nối.');
    }
  };

  const handleChangeTab = (index: number) => {
    setSelectedTab(index);
    if (index === 0) {
      setEmail('');
    } else {
      setPhone('');
    }
  };

  const handleTermsPress = () => {
    console.log('Terms pressed');
  };

  return (
    <SafeAreaView
      style={commonStyles.container}
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
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>Tạo tài khoản mới để sử dụng TOMOTA</Text>

            <SegmentedControl
              options={['Email', 'Số điện thoại']}
              selectedIndex={selectedTab}
              onSelect={handleChangeTab}
            />

            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên của bạn"
              value={fullName}
              onChangeText={setFullName}
              icon="person-outline"
              autoCapitalize="words"
              required
            />

            {selectedTab === 0 ? (
              <Input
                label="Nhập email của bạn"
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />
            ) : (
              <PhoneInput
                label="Số điện thoại"
                placeholder="909 123 456"
                value={phone}
                onChangeText={setPhone}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                required
              />
            )}

            <View style={styles.buttonContainer}>
              <Button title="Nhận mã OTP" onPress={handleGetOTP} variant="primary" fullWidth />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleTermsPress} activeOpacity={0.7}>
            <Text style={styles.footerText}>Điều khoản sử dụng và quyền riêng tư</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    position: "relative",
    minHeight: 45,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
    pointerEvents: "none",
  },
  content: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: spacing.lg,
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
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  androidStatusBar: {
    backgroundColor: colors.white,
  },
});
