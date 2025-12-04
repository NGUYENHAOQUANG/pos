import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// --- IMPORTS TYPES ---
// Đảm bảo bạn đã định nghĩa 'Verify-otp' trong AuthStackParamList
import type { AuthStackParamList } from '@/app/navigation/types';

// --- IMPORTS COMPONENTS ---
import { Button, ErrorBoundary, Logo } from '@/shared/components';
// import WaveHeader from '@/shared/components/layout/WaveHeader';
// Import PhoneInput bạn đã tạo ở bước trước
import PhoneInput from '../components/PhoneInput';

// --- IMPORTS STORE & STYLES ---
// import { useAuthStore } from '../store/authStore'; // TODO: Uncomment when implementing login
import { spacing } from '@/styles';

export default function AuthScreen() {
  // Sử dụng NativeStackNavigationProp để có gợi ý code cho navigation
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();

  // --- STATE ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  // const { login } = useAuthStore(); // TODO: Uncomment when implementing login

  // --- HANDLERS ---
  const handleLogin = async () => {
    setError(''); // Reset lỗi

    // 1. Validate rỗng
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }

    // 2. Validate định dạng (Ví dụ: phải đủ 10 số)
    // Loại bỏ khoảng trắng để đếm số lượng ký tự thực
    const rawPhone = phoneNumber.replace(/\s/g, '');
    if (rawPhone.length < 10) {
      setError('Số điện thoại không hợp lệ, vui lòng kiểm tra lại.');
      return;
    }

    console.log('Login pressed with phone:', rawPhone);

    try {
      // Giả lập call API login thành công (hoặc check user tồn tại)
      // await login({ phone: rawPhone, password: '...' });

      // 3. CHUYỂN HƯỚNG SANG MÀN HÌNH OTP
      navigation.navigate('Verify-otp', {
        method: 'phone',
        contact: rawPhone, // Truyền số điện thoại sang màn OTP
      });
    } catch (err) {
      console.error('Login failed:', err);
      setError('Đã có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleClearError = () => {
    setPhoneNumber('');
    setError('');
  };

  return (
    <ErrorBoundary>
      <SafeAreaView
        style={styles.container}
        edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Android Status Bar Spacer */}
        {Platform.OS === 'android' && (
          <View style={[styles.androidStatusBar, { height: insets.top }]} />
        )}

        {/* --- BACKGROUND WAVES --- */}
        {/* <View style={styles.waveTopContainer}>
          <WaveHeader
            width={SCREEN_WIDTH}
            height={(SCREEN_HEIGHT * 1.5) / 4}
            backgroundColor="#8FD5FF"
            fill1="#FFFFFF"
            fill2="#4FACFE"
            options={{ height: 200, amplitude: 20, speed: 0.4, points: 2 }}
            containerStyle={styles.waveTop}
          />
        </View>

        <View style={styles.waveBottomContainer}>
          <WaveHeader
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT / 4}
            backgroundColor="#8FD5FF"
            fill1="#007CFF"
            fill2="#8FD5FF"
            options={{ height: 80, amplitude: 20, speed: 0.4, points: 2 }}
            containerStyle={styles.waveBottom}
          />
        </View> */}

        {/* --- MAIN CONTENT --- */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form Card */}
            <View style={styles.formCard}>
              {/* Logo */}
              <View style={styles.logoSection}>
                <ErrorBoundary>
                  <Logo size="medium" />
                </ErrorBoundary>
              </View>
              <View style={styles.spacer} />
              {/* Title */}
              <Text style={styles.screenTitle}>Đăng nhập</Text>
              {/* Input & Button */}
              <View style={styles.formContent}>
                <PhoneInput
                  value={phoneNumber}
                  onChangeText={text => {
                    setPhoneNumber(text);
                    if (error) setError('');
                  }}
                  error={error}
                  onClear={handleClearError}
                />

                <View style={styles.buttonSection}>
                  <Button
                    title="Đăng Nhập" //
                    onPress={handleLogin}
                    variant="primary"
                    fullWidth
                    style={styles.loginButton}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8FD5FF',
    overflow: 'hidden',
  },
  androidStatusBar: {
    backgroundColor: '#8FD5FF',
  },
  // Wave Styles
  waveTopContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 },
  waveTop: { position: 'absolute', top: 0, left: 0, right: 0 },
  waveBottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 0 },
  waveBottom: { position: 'absolute', bottom: 0, left: 0, right: 0 },

  // Layout Styles
  keyboardView: { flex: 1, zIndex: 1 },
  scrollView: { flex: 1, zIndex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: spacing.xs,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  spacer: {
    width: '100%',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignSelf: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  formContent: {
    marginTop: spacing.sm,
  },
  buttonSection: {
    marginTop: spacing.sm,
  },
  loginButton: {
    backgroundColor: '#007CFF',
    borderRadius: 25, // Bo tròn mạnh
    height: 50,
  },
});
