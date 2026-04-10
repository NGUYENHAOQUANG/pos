import { BackButton } from '@/shared/components/buttons/BackButton';
import { Button } from '@/shared/components/buttons/Button';
import { Input } from '@/shared/components/forms/Input';
import { Logo } from '@/shared/components/brand/Logo';
import { SegmentedControl } from '@/shared/components/forms/SegmentedControl';
import PhoneInput from '@/features/auth/components/PhoneInput';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackNavigationProp } from '@/app/navigation/types';
import { useAuthStore } from '@/features/auth/store/authStore';
import React, { useState, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Text } from '@/shared/components/typography/Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

export default function LoginScreen() {
    // --- 1. Hooks & Store ---
    const navigation = useNavigation<AuthStackNavigationProp>();
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    // const login = useAuthStore(state => state.login); // Removed unused hook assignment

    // --- 2. Local States ---
    const [selectedTab, setSelectedTab] = useState(0);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+84');
    const [password, setPassword] = useState('');

    // --- 3. Handlers ---
    const handleLogin = async () => {
        // Mock login - update auth store to trigger navigation
        const { login } = useAuthStore.getState();
        await login({
            username: selectedTab === 0 ? email : phone,
            password,
        });
    };

    const handleForgotPassWord = () => {
        // navigation.navigate('ForgotPassword');
    };

    const handleCreateAccount = () => {
        navigation.navigate('Register', { phoneNumber: phone });
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
        >
            <StatusBar
                barStyle={theme.isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />

            {Platform.OS === 'android' && (
                <View style={[styles.androidStatusBar, { height: insets.top }]} />
            )}

            <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
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

                    {/* Footer */}
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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
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
            marginHorizontal: -spacing.lg,
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            position: 'relative',
        },
        leftButton: {
            position: 'absolute',
            left: spacing.lg,
            zIndex: 1,
        },
        divider: {
            height: 1,
            backgroundColor: theme.border,
            width: '100%',
        },
        content: {
            flex: 1,
            marginBottom: spacing['2xl'],
        },
        footerText: {
            fontSize: typography.fontSize.sm,
            color: theme.textSecondary,
            textAlign: 'center',
            marginTop: spacing.md,
        },
        linkText: {
            color: theme.primary,
            fontWeight: typography.fontWeight.semibold,
        },
        forgotPassword: {
            textAlign: 'right',
            color: theme.text,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            marginBottom: spacing.lg,
        },
        androidStatusBar: {
            backgroundColor: theme.background,
        },
    });
