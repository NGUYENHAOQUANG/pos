import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Text } from '@/shared/components/typography/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { CompleteProfilePayload } from '@/features/auth/types/auth.types';
import { AuthStackNavigationProp } from '@/app/navigation/types';

import { Button, ErrorBoundary, Logo } from '@/shared/components';
import { Loading } from '@/shared/components/ui/Loading';
import { Checkbox } from '@/shared/components/forms/Checkbox';

import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Input } from '@/shared/components/forms/Input';
import InfoIcon from '@/assets/Icon/Info.svg';
import WarningCircleIcon from '@/assets/Icon/IconPolicy/WarningCircle.svg';

import AnimatedBackground from '@/shared/components/ui/AnimatedBackground';
import { handleError } from '@/shared/utils';
import { useKeyboard } from '@/shared/hooks/useKeyboard';

export default function InfoScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agreedPolicy, setAgreedPolicy] = useState(false);
    const [showPolicyError, setShowPolicyError] = useState(false);

    const { user, completeProfile } = useAuthStore();
    const { keyboardVisible } = useKeyboard();
    const navigation = useNavigation<AuthStackNavigationProp>();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const handleOpenPolicy = useCallback(() => {
        navigation.navigate('DataPolicy');
    }, [navigation]);

    const handleTogglePolicy = useCallback((val: boolean) => {
        setAgreedPolicy(val);
        if (val) setShowPolicyError(false);
    }, []);

    const isSubmitDisabled = !fullName.trim();

    const handleSubmit = async () => {
        if (!fullName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập họ và tên');
            return;
        }

        if (!agreedPolicy) {
            setShowPolicyError(true);
            return;
        }

        setIsLoading(true);
        try {
            if (!user?.id) throw new Error('Không tìm thấy thông tin người dùng');

            const payload: CompleteProfilePayload = {
                userId: user.id,
                fullName,
            };

            if (email) payload.email = email;
            if (address) payload.address = address;

            await completeProfile(payload);
            Toast.show({
                type: 'success',
                text1: 'Cập nhật thông tin thành công',
            });
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ErrorBoundary>
            <Loading isLoading={isLoading}>
                <SafeAreaView style={styles.container} edges={['top']}>
                    <AnimatedBackground />
                    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                    <KeyboardAvoidingView behavior="padding" style={styles.keyboardInner}>
                        <View style={styles.mainContentContainer}>
                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View style={styles.topEmptySpace} />

                                <View style={styles.logoSection}>
                                    <Logo size="square" />
                                </View>

                                <View style={styles.infoIconSection}>
                                    <InfoIcon width={48} height={48} color={theme.text} />
                                </View>

                                <View style={styles.contentSection}>
                                    <Text style={styles.screenTitle}>Tạo tài khoản</Text>

                                    <View style={styles.formContent}>
                                        <Input
                                            label="Họ và tên"
                                            required
                                            placeholder="Nhập họ và tên"
                                            value={fullName}
                                            onChangeText={setFullName}
                                            containerStyle={styles.inputSpacing}
                                        />

                                        <Input
                                            label={
                                                <Text style={styles.labelBase}>
                                                    Email{' '}
                                                    <Text style={styles.optionalText}>
                                                        (Không bắt buộc)
                                                    </Text>
                                                </Text>
                                            }
                                            placeholder="Nhập email của bạn"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            containerStyle={styles.inputSpacing}
                                        />

                                        <Input
                                            label={
                                                <Text style={styles.labelBase}>
                                                    Địa chỉ{' '}
                                                    <Text style={styles.optionalText}>
                                                        (Không bắt buộc)
                                                    </Text>
                                                </Text>
                                            }
                                            placeholder="Nhập địa chỉ của bạn"
                                            value={address}
                                            onChangeText={setAddress}
                                            containerStyle={styles.inputSpacing}
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            <View
                                style={[
                                    styles.footer,
                                    keyboardVisible && styles.footerKeyboardOpen,
                                ]}
                            >
                                {/* Policy agreement */}
                                <View style={styles.policySection}>
                                    <Checkbox
                                        checked={agreedPolicy}
                                        onToggle={handleTogglePolicy}
                                        size="sm"
                                        activeColor={theme.primaryOrange}
                                        hasError={showPolicyError}
                                    />
                                    <Text style={styles.policyText}>
                                        Tôi đồng ý với{' '}
                                        <Text style={styles.policyLink} onPress={handleOpenPolicy}>
                                            Chính sách bảo vệ dữ liệu cá nhân
                                        </Text>{' '}
                                        của Mebieco theo NĐ 13/2023/NĐ-CP.
                                    </Text>
                                </View>

                                {showPolicyError && (
                                    <View style={styles.errorContainer}>
                                        <WarningCircleIcon
                                            width={20}
                                            height={20}
                                            color={theme.red[500]}
                                        />
                                        <Text style={styles.errorText}>
                                            Vui lòng đồng ý với Chính sách bảo vệ dữ liệu cá nhân để
                                            tiếp tục.
                                        </Text>
                                    </View>
                                )}

                                <Button
                                    title="Tạo Tài Khoản"
                                    onPress={handleSubmit}
                                    variant="primary"
                                    fullWidth
                                    disabled={isSubmitDisabled}
                                    style={[
                                        styles.submitButton,
                                        isSubmitDisabled && styles.submitButtonDisabled,
                                    ]}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Loading>
        </ErrorBoundary>
    );
}

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
            overflow: 'hidden',
        },
        keyboardInner: {
            flex: 1,
        },
        mainContentContainer: {
            flex: 1,
        },
        scrollView: { flex: 1 },
        scrollContent: {
            flexGrow: 1,
        },
        topEmptySpace: {
            height: spacing.md,
        },
        logoSection: {
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        infoIconSection: {
            paddingHorizontal: spacing.md,
            paddingTop: spacing.lg,
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        contentSection: {
            paddingHorizontal: spacing.md,
            marginTop: spacing.sm,
        },
        inputSpacing: {
            marginBottom: spacing.lg,
        },
        screenTitle: {
            fontSize: typography.fontSize['2xl'],
            fontWeight: '600',
            color: theme.text,
            textAlign: 'left',
            paddingVertical: spacing.md,
        },
        formContent: {
            marginTop: spacing.sm,
        },
        submitButton: {
            backgroundColor: theme.primary,
            borderRadius: 25,
            height: 36,
        },
        footer: {
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl + spacing.sm + 12,
            gap: 12,
        },
        footerKeyboardOpen: {
            paddingBottom: spacing.md,
        },
        labelBase: {
            color: theme.text,
        },
        optionalText: {
            color: theme.textTertiary,
            fontWeight: '400',
            fontSize: 14,
        },
        policySection: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        policyText: {
            flex: 1,
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
            lineHeight: 18,
            marginLeft: spacing.sm,
        },
        policyLink: {
            color: theme.primaryOrange,
            fontWeight: '500',
            fontSize: 14,
            lineHeight: 18,
            textDecorationLine: 'underline',
        },
        submitButtonDisabled: {
            opacity: 0.5,
        },
        errorContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: theme.red[25],
            borderWidth: 1,
            borderColor: theme.red[200],
            borderRadius: 8,
            padding: 12,
            gap: 8,
        },
        errorText: {
            flex: 1,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
            color: theme.red[500],
        },
    });
