import React, { useState, useEffect, useRef } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/app/navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '@/features/auth/store/authStore';

// Import components
import { Button, Logo } from '@/shared/components';
import OTPInput, { OTPInputHandle } from '../components/OTPInput';
import { spacing } from '@/styles';

export default function VerifyOTPScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Verify-otp'>>();
  const login = useAuthStore(state => state.login);
  // Params
  const { contact } = route.params || { contact: '0908 123 456' };

  // State
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(59);

  // Ref to control child component (focus, reset)
  const otpInputRef = useRef<OTPInputHandle>(null);

  const isError = !!errorMessage;

  // Timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Wrapper to set otp and clear error
  const handleOtpChange = (newCode: string[]) => {
    setOtp(newCode);
    if (errorMessage) setErrorMessage('');
  };

  const handleVerifyOTP = async () => {
    // Thêm async
    const otpString = otp.join('');

    // 1. Validate
    if (otpString.length < 4) {
      setErrorMessage('Vui lòng nhập đủ 4 số.');
      return;
    }

    // 2. Mock check error
    if (otpString === '0000') {
      setErrorMessage('Mã không chính xác, vui lòng kiểm tra lại.');
      return;
    }

    // 3. XỬ LÝ ĐĂNG NHẬP THÀNH CÔNG
    try {
      console.log('Verify Success:', otpString);

      // Gọi hàm login của store để set isAuthenticated = true
      // Vì đang dùng OTP nên password có thể để rỗng hoặc string bất kỳ tùy logic backend sau này
      await login({ phone: contact, password: '' });
    } catch (error) {
      setErrorMessage('Đăng nhập thất bại, vui lòng thử lại.');
      console.error(error);
    }
  };
  const handleResendOTP = () => {
    setCountdown(59);
    setOtp(['', '', '', '']); // Reset state
    setErrorMessage('');

    // Call focusFirst() from child component
    otpInputRef.current?.focusFirst();

    console.log('Resend OTP Sent');
  };

  // Format phone
  const displayContact = contact.replace(/\D/g, '').replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.logoWrapper}>
              <Logo size="medium" />
            </View>
            <View style={styles.spacer} />
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.subtitle}>Nhập mã được gửi đến số điện thoại</Text>
            <Text style={styles.phoneNumber}>{displayContact}</Text>

            {/* --- NEW OTP COMPONENT --- */}
            <View style={styles.otpInputSection}>
              <OTPInput
                ref={otpInputRef}
                code={otp}
                onCodeChanged={handleOtpChange}
                isError={isError}
                length={4}
              />
            </View>

            {/* Error Message */}
            {isError ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
              <View style={styles.errorPlaceholder} />
            )}

            {/* Resend & Timer */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>Không nhận được mã? </Text>
              {countdown > 0 ? (
                <Text style={styles.timerText}>
                  <Text style={styles.disabledLink}>Gửi lại mã</Text> (chờ sau 0:
                  {countdown.toString().padStart(2, '0')})
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP}>
                  <Text style={styles.activeLink}>Gửi lại mã</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.buttonWrapper}>
              <Button
                title="Tiếp Tục"
                onPress={handleVerifyOTP}
                variant="primary"
                fullWidth
                style={styles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5FF',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 30 : 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  spacer: {
    width: '100%',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignSelf: 'center',
  },
  logoWrapper: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 32,
  },
  otpInputSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendLabel: {
    color: '#374151',
    fontSize: 14,
  },
  timerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  disabledLink: {
    textDecorationLine: 'underline',
    color: '#9CA3AF',
  },
  activeLink: {
    color: '#3B82F6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonWrapper: {
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#007CFF',
    borderRadius: 25,
    height: 50,
  },
  errorPlaceholder: {
    height: 24,
  },
});
