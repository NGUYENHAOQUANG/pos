import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { BackButton } from '@/shared/components/buttons/BackButton';
import { Button } from '@/shared/components/buttons/Button';
import { Input } from '@/shared/components/forms/Input';
import { Logo } from '@/shared/components/brand/Logo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackNavigationProp } from '@/app/navigation/types';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

export default function CreatePasswordScreen() {
    const navigation = useNavigation<AuthStackNavigationProp>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const handleCreatePassword = () => {
        navigation.navigate('Register-Success');
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
        >
            {/* View đệm cho tai thỏ */}
            {Platform.OS === 'android' && (
                <View style={[styles.androidStatusBar, { height: insets.top }]} />
            )}

            {/* Header - Đưa ra ngoài để cố định */}
            <View style={styles.header}>
                <BackButton />
                <View style={styles.logoContainer}>
                    <Logo size="medium" />
                </View>
            </View>

            {/* KeyboardAvoidingView bọc ScrollView */}
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
                    {/* Spacer để đẩy content xuống một chút */}
                    <View style={styles.spacer} />

                    {/* Main Content */}
                    <View style={styles.content}>
                        <Text style={styles.title}>Tạo mật khẩu</Text>
                        <Text style={styles.subtitle}>
                            Mật khẩu chứa ít nhất 8 ký tự. Bao gồm chữ viết hoa, viết thường, chữ
                            số. Không chứa khoảng trắng.
                        </Text>

                        <Input
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            icon="lock-closed-outline"
                            secureTextEntry={!showPassword}
                            iconRight={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            onIconPress={() => setShowPassword(!showPassword)}
                            autoCapitalize="none"
                            required
                            containerStyle={styles.passwordInput}
                        />

                        <Input
                            label="Xác nhận mật khẩu"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            icon="lock-closed-outline"
                            secureTextEntry={!showConfirmPassword}
                            iconRight={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                            onIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            autoCapitalize="none"
                            required
                        />

                        <View style={styles.buttonContainer}>
                            <Button
                                title="Tạo mật khẩu"
                                onPress={handleCreatePassword}
                                variant="primary"
                                fullWidth
                            />
                        </View>
                    </View>
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
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
            position: 'relative',
            minHeight: 45,
            paddingHorizontal: spacing.lg,
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
        spacer: {
            height: 80,
        },
        content: {
            paddingTop: spacing.lg,
        },
        title: {
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: theme.text,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: typography.fontSize.base,
            color: theme.textSecondary,
            marginBottom: spacing.xl,
            lineHeight: spacing.lg,
        },
        buttonContainer: {
            marginTop: spacing.md,
            marginBottom: spacing.lg,
        },
        androidStatusBar: {
            backgroundColor: theme.background,
        },
        passwordInput: {
            marginBottom: spacing.md,
        },
    });
