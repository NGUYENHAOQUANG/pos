import { BackButton } from '@/shared/components/buttons/BackButton';
import { Button } from '@/shared/components/buttons/Button';
import { Input } from '@/shared/components/forms/Input';
import { Logo } from '@/shared/components/brand/Logo';
import { SegmentedControl } from '@/shared/components/forms/SegmentedControl';
import PhoneInput from '@/features/auth/components/PhoneInput';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackNavigationProp } from '@/app/navigation/types';
import { useAuthStore } from '@/features/auth/store/authStore';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/styles';

export default function LoginScreen() {
    const navigation = useNavigation<AuthStackNavigationProp>();
    const [selectedTab, setSelectedTab] = useState(0);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+84');
    const [password, setPassword] = useState('');
    const insets = useSafeAreaInsets();

    const handleLogin = async () => {
        console.log('Login pressed', {
            tab: selectedTab === 0 ? 'Email' : 'Phone',
            value: selectedTab === 0 ? email : phone,
            password,
        });

        // Mock login - update auth store to trigger navigation
        const { login } = useAuthStore.getState();
        await login({
            phone: selectedTab === 0 ? email : phone,
            password,
        });
    };

    const handleForgotPassWord = () => {
        console.log('Forgot Password pressed');
        // navigation.navigate('ForgotPassword');
    };

    const handleCreateAccount = () => {
        console.log('Create account pressed');
        navigation.navigate('Register');
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerContent}>
                            <View style={styles.leftButton}>
                                <BackButton />
                            </View>
                            <Logo size="square" />
                        </View>
                        <View style={styles.divider} />
                    </View>

                    {/* Main Content */}
                    <View style={styles.content}>
                        <SegmentedControl
                            options={['Email', 'Số điện thoại']}
                            selectedIndex={selectedTab}
                            onSelect={setSelectedTab}
                        />

                        {selectedTab === 0 ? (
                            <Input
                                label="Email"
                                placeholder="example@gmail.com"
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
                                placeholder="123 456 890"
                                value={phone}
                                onChangeText={setPhone}
                                countryCode={countryCode}
                                onCountryCodeChange={setCountryCode}
                                required
                            />
                        )}

                        <Input
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu của bạn"
                            value={password}
                            onChangeText={setPassword}
                            icon="lock-closed-outline"
                            secureTextEntry
                            autoCapitalize="none"
                            required
                        />

                        <Text style={styles.forgotPassword} onPress={handleForgotPassWord}>
                            Quên mật khẩu
                        </Text>

                        <Button
                            title="Đăng nhập"
                            onPress={handleLogin}
                            variant="primary"
                            fullWidth
                        />
                    </View>

                    <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
                        <Text style={styles.footerText}>
                            Bạn chưa có tài khoản?
                            <Text style={styles.linkText}> Tạo tài khoản</Text>
                        </Text>
                    </TouchableOpacity>
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
    headerContainer: {
        marginBottom: spacing['3xl'],
        marginHorizontal: -spacing.lg, // Extend to full width ignoring parent padding
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16, // Top 16, Bottom 16 (relative to content)
        // Wait, user said padding top 16, padding with divider is 16.
        // So 16 top, 16 bottom.
        position: 'relative',
    },
    leftButton: {
        position: 'absolute',
        left: spacing.lg, // Align with content padding
        zIndex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        width: '100%',
    },
    logoContainer: {
        // Removed
    },
    content: {
        flex: 1,
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: typography.fontSize['3xl'] - 2,
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
    footerText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    linkText: {
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
    },
    forgotPassword: {
        textAlign: 'right',
        color: colors.text,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.lg,
    },
    androidStatusBar: {
        backgroundColor: colors.white,
    },
});
