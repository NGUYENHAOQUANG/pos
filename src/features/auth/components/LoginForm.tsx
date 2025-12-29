import { Button } from '@/shared/components/buttons/Button';
import { Logo } from '@/shared/components/brand/Logo';
import PhoneInput from '@/features/auth/components/PhoneInput';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/app/navigation/types';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/styles';

export default function LoginForm() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const insets = useSafeAreaInsets();

    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+84');
    const [error, setError] = useState<string | undefined>(undefined);

    const handleLogin = async () => {
        // Validate đơn giản
        if (!phone || phone.length < 9) {
            setError('Số điện thoại không tồn tại, vui lòng kiểm tra và thử lại.');
            return;
        }

        setError(undefined);

        console.log('Login request sent', {
            phone,
            countryCode,
        });

        // Giả lập gửi OTP thành công -> Chuyển sang màn Verify
        // Truyền sđt sang màn OTP để hiển thị
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
                    {/* Logo Section - Canh giữa */}
                    <View style={styles.logoSection}>
                        <Logo size="medium" />
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
                                if (error) setError(undefined); // Clear error khi user nhập lại
                            }}
                            countryCode={countryCode}
                            onCountryCodeChange={setCountryCode}
                            error={error} // Truyền prop error vào để hiển thị viền đỏ
                        />

                        {/* Hiển thị text lỗi bên dưới input */}
                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <View style={styles.buttonContainer}>
                            <Button
                                title="Đăng Nhập"
                                onPress={handleLogin}
                                variant="primary"
                                fullWidth
                                style={styles.loginButton}
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
