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

import { Button, ErrorBoundary, Logo } from '@/shared/components';
import { Loading } from '@/shared/components/ui/Loading';
import PhoneInput from '../components/PhoneInput';
import { authApi } from '../api/authApi';
import Toast from 'react-native-toast-message';
import { notificationHelper } from '@/shared/utils/notificationHelper';
import { colors, spacing } from '@/styles';
import { AuthStackParamList } from '@/app/navigation/types';

export default function AuthScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const insets = useSafeAreaInsets();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setError('');

        if (!phoneNumber.trim()) {
            setError('Vui lòng nhập số điện thoại.');
            return;
        }

        const rawPhone = phoneNumber.replace(/\s/g, '');
        
        // Validate VN Phone Number Format
        const vnPhoneRegex = /^(0)(3|5|7|8|9)([0-9]{8})$/;

        if (!vnPhoneRegex.test(rawPhone)) {
             Toast.show({
                type: 'error',
                text1: 'Số điện thoại không hợp lệ',
                text2: 'Vui lòng thử lại',
            });
            return;
        }

        if (rawPhone === '0908456789') {
            setError('Số điện thoại không tồn tại, vui lòng kiểm tra và thử lại.');
            return;
        }

        console.log('Login pressed with phone:', rawPhone);
        setIsLoading(true);

        try {
            const response = await authApi.requestOtp(rawPhone);
            
            // In Dev environment, OTP is in response.data.testOtp
            const devOtp = response?.data?.testOtp;
            console.log('AuthScreen OTP Response:', JSON.stringify(response));

            if (devOtp) {
                // Show Notifee Notification as requested
                await notificationHelper.displayOtpNotification(String(devOtp));
            }

            navigation.navigate('Verify-otp', {
                method: 'phone',
                contact: rawPhone,
                otpCode: devOtp ? String(devOtp) : undefined,
            });
        } catch (err) {
            console.error('Login failed:', err);
            setError('Đã có lỗi xảy ra, vui lòng thử lại.');
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể gửi mã OTP. Vui lòng kiểm tra kết nối.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearError = () => {
        setPhoneNumber('');
        setError('');
    };

    return (
        <ErrorBoundary>
            <Loading isLoading={isLoading}>
                <SafeAreaView
                    style={styles.container}
                    edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
                >
                    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                    {Platform.OS === 'android' && (
                        <View style={[styles.androidStatusBar, { height: insets.top }]} />
                    )}

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
                            <View style={styles.formCard}>
                                <View style={styles.logoSection}>
                                    <ErrorBoundary>
                                        <Logo size="square" />
                                    </ErrorBoundary>
                                </View>

                                <View style={styles.spacer} />

                                <Text style={styles.screenTitle}>Đăng nhập</Text>

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
                                            title="Đăng Nhập"
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
            </Loading>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        overflow: 'hidden',
    },
    androidStatusBar: {
        backgroundColor: colors.backgroundPrimary,
    },
    keyboardView: { flex: 1, zIndex: 1 },
    scrollView: { flex: 1, zIndex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingVertical: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginHorizontal: spacing.xs,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    spacer: {
        width: '100%',
        marginBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    formContent: {
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    buttonSection: {
        marginTop: spacing.sm,
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: 25,
        height: 50,
    },
});
