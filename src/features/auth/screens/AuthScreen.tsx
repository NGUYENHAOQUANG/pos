import type { AuthStackNavigationProp } from '@/app/navigation/types';
import {
  Button,
  ErrorBoundary,
  Input,
  Logo,
  SegmentedControl,
  TextLink,
} from '@/shared/components';
import WaveHeader from '@/shared/components/layout/WaveHeader';
import { spacing, typography } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AuthScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigation = useNavigation<AuthStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState(0);
  const { login, register } = useAuthStore();

  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    console.log('Login pressed', {
      accountName,
      password,
    });

    try {
      // Call login from auth store - this will set isAuthenticated to true
      await login({ phone: accountName, password });
      // Navigation will happen automatically via AppNavigator watching isAuthenticated
    } catch (error) {
      console.error('Login failed:', error);
      // TODO: Show error message to user
    }
  };

  const handleCreateAccount = async () => {
    console.log('Create account pressed', {
      accountName,
      password,
      confirmPassword,
    });

    try {
      // Call register from auth store
      await register({ phone: accountName, password, name: accountName });
      // Navigation will happen automatically via AppNavigator watching isAuthenticated
    } catch (error) {
      console.error('Registration failed:', error);
      // TODO: Show error message to user
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    // TODO: Navigate to ForgotPassword screen when it's available
  };

  const handleTermsPress = () => {
    console.log('Terms of service pressed');
  };

  const handlePrivacyPress = () => {
    console.log('Privacy policy pressed');
  };

  return (
    <ErrorBoundary>
      <SafeAreaView
        style={styles.container}
        edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        {Platform.OS === 'android' && (
          <View style={[styles.androidStatusBar, { height: insets.top }]} />
        )}

        {/* WaveHeader ở trên - màu xanh nhạt */}
        <View style={styles.waveTopContainer}>
          <WaveHeader
            width={SCREEN_WIDTH}
            height={(SCREEN_HEIGHT * 1.5) / 4}
            backgroundColor="#8FD5FF"
            fill1="#FFFFFF"
            fill2="#4FACFE"
            options={{
              height: 200,
              amplitude: 20,
              speed: 0.4,
              points: 2,
            }}
            containerStyle={styles.waveTop}
          />
        </View>

        {/* WaveHeader ở dưới - màu xanh đậm (ngược lại) */}
        <View style={styles.waveBottomContainer}>
          <WaveHeader
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT / 4}
            backgroundColor="#8FD5FF"
            fill1="#007CFF"
            fill2="#8FD5FF"
            options={{
              height: 80,
              amplitude: 20,
              speed: 0.4,
              points: 2,
            }}
            containerStyle={styles.waveBottom}
          />
        </View>

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
            <View style={styles.formCard}>
              <View style={styles.logoSection}>
                <ErrorBoundary>
                  <Logo size="medium" />
                </ErrorBoundary>
              </View>
              <View style={styles.tabSection}>
                <ErrorBoundary>
                  <SegmentedControl
                    options={['Đăng nhập', 'Đăng ký']}
                    selectedIndex={selectedTab}
                    onSelect={setSelectedTab}
                  />
                </ErrorBoundary>
              </View>
              {selectedTab === 1 && (
                <ErrorBoundary>
                  <>
                    <Input
                      label="Tên tài khoản"
                      placeholder="Nhập tên tài khoản"
                      value={accountName}
                      onChangeText={setAccountName}
                    />

                    <Input
                      label="Mật khẩu"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />

                    <Input
                      label="Nhập lại mật khẩu"
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />

                    <View style={styles.buttonSection}>
                      <Button
                        title="Tạo tài khoản"
                        onPress={handleCreateAccount}
                        variant="primary"
                        fullWidth
                      />
                    </View>

                    <View style={styles.termsSection}>
                      <TextLink
                        text="Bằng việc đăng kí, bạn đã đồng ý với Mebione về"
                        links={[
                          { text: 'Điều khoản dịch vụ', onPress: handleTermsPress },
                          { text: 'Chính sách bảo mật', onPress: handlePrivacyPress },
                        ]}
                        align="center"
                        fontSize={typography.fontSize.xs}
                      />
                    </View>
                  </>
                </ErrorBoundary>
              )}

              {selectedTab === 0 && (
                <ErrorBoundary>
                  <>
                    <Input
                      label="Tên tài khoản"
                      placeholder="Nhập tên tài khoản"
                      value={accountName}
                      onChangeText={setAccountName}
                    />

                    <Input
                      label="Mật khẩu"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                    <View style={styles.forgotPasswordSection}>
                      <TextLink
                        linkText="Quên mật khẩu"
                        onPress={handleForgotPassword}
                        align="right"
                      />
                    </View>
                    <View style={styles.buttonSection}>
                      <Button title="Đăng nhập" onPress={handleLogin} variant="primary" fullWidth />
                    </View>
                  </>
                </ErrorBoundary>
              )}
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
  waveTopContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  waveTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  waveBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  waveBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    marginTop: spacing['2xl'],
    marginBottom: spacing.lg,
    shadowColor: '#222222',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 8,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  tabSection: {
    marginBottom: spacing.xl,
  },
  loginPlaceholder: {
    minHeight: 200,
    justifyContent: 'center',
  },
  forgotPasswordSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  buttonSection: {
    marginTop: spacing.lg,
  },
  termsSection: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  androidStatusBar: {
    backgroundColor: '#8FD5FF',
  },
});
