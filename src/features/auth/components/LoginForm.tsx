import { Button } from '@/shared/components/buttons/Button';
import { Logo } from '@/shared/components/brand/Logo';
import PhoneInput from '@/features/auth/components/PhoneInput';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/app/navigation/types';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/styles';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { notificationHelper } from '@/shared/utils/notificationHelper';

export default function LoginForm() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const insets = useSafeAreaInsets();

    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+84');
    const [error, setError] = useState<string | undefined>(undefined);
    const [isUnverified, setIsUnverified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        // Validate phone number
        if (!phone || phone.length < 9) {
            setError('Số điện thoại không tồn tại, vui lòng kiểm tra và thử lại.');
            return;
        }

        setError(undefined);
        setIsLoading(true);

        try {
            // Convert phone to proper format (remove spaces, add leading 0 if needed)
            let phoneNumber = phone.replace(/\s+/g, '');
            if (!phoneNumber.startsWith('0')) {
                phoneNumber = '0' + phoneNumber;
            }

            // Call API to request OTP and check status
            const response = await apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, {
                phoneNumber: phoneNumber,
            });
            // API returns: { data: { status, testOtp, expiredIn }, result, statusCode, message }
            const responseData = response.data;
            const data = responseData?.data;
            const status = data?.status;
            const otpCode = data?.testOtp || data?.otpCode;
            if (otpCode) {
                notificationHelper.displayOtpNotification(String(otpCode));
            }

            if (status === 'Unverified') {
                setError(
                    'Số điện thoại này đã được đăng ký nhưng chưa xác thực, vui lòng xác thực ngay'
                );
                setIsUnverified(true);
                return;
            }

            // Status is COMPLETED or other - proceed to OTP screen
            setIsUnverified(false);
            navigation.navigate('Verify-otp', {
                method: 'phone',
                contact: `${countryCode} ${phone}`,
            });
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(axiosError.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
            setIsUnverified(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyNow = async () => {
        // For unverified accounts, navigate directly to OTP screen
        navigation.navigate('Verify-otp', {
            method: 'phone',
            contact: `${countryCode} ${phone}`,
        });
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
        >
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            {Platform.OS === 'android' && (
                <View style={[styles.androidStatusBar, { height: insets.top }]} />
            )}

            <SafeInputLayout style={styles.keyboardView}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo Section - Canh giữa */}
                    <View style={styles.logoSection}>
                        <Logo size="square" />
                    </View>

                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Đăng nhập</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <View style={styles.inputLabelContainer}>
                            <Text style={styles.inputLabel}>Số điện thoại</Text>
                        </View>

                        <PhoneInput
                            // label="Số điện thoại" //
                            placeholder="0908 456 789"
                            value={phone}
                            onChangeText={text => {
                                setPhone(text);
                                if (error) {
                                    setError(undefined);
                                    setIsUnverified(false);
                                }
                            }}
                            countryCode={countryCode}
                            onCountryCodeChange={setCountryCode}
                            error={error} // Truyền prop error vào để hiển thị viềnđỏ
                        />

                        {/* Hiển thị text lỗi bên dưới input */}
                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <View style={styles.buttonContainer}>
                            <Button
                                title={isUnverified ? 'Xác thực ngay' : 'Đăng Nhập'}
                                onPress={isUnverified ? handleVerifyNow : handleLogin}
                                variant="primary"
                                fullWidth
                                style={styles.loginButton}
                                loading={isLoading}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeInputLayout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    androidStatusBar: {
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
        paddingTop: spacing['2xl'],
        paddingBottom: 100,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.xl,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '700',
        color: colors.black,
    },
    formSection: {
        width: '100%',
    },
    inputLabelContainer: {
        marginBottom: spacing.xs,
    },
    inputLabel: {
        fontSize: typography.fontSize.base,
        color: colors.text,
        fontWeight: '400',
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSize.sm,
        marginTop: -spacing.sm,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    buttonContainer: {
        marginTop: spacing.md,
    },
    loginButton: {
        borderRadius: 99,
        height: 50,
    },
});
