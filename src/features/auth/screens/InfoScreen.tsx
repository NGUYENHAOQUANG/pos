import React, { useState, useMemo } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/features/auth/store/authStore';
import { CompleteProfilePayload } from '@/features/auth/types/auth.types';

import { Button, ErrorBoundary, Logo } from '@/shared/components';
import { Loading } from '@/shared/components/ui/Loading';

import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Input } from '@/shared/components/forms/Input';
import InfoIcon from '@/assets/Icon/Info.svg';

import { FloatingBubblesBackground } from '@/shared/components/ui/FloatingBubblesBackground';
import { handleError } from '@/shared/utils';
import { useKeyboard } from '@/shared/hooks/useKeyboard';

export default function InfoScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { user, completeProfile } = useAuthStore();
    const { keyboardVisible } = useKeyboard();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const handleSubmit = async () => {
        if (!fullName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập họ và tên');
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
                    <FloatingBubblesBackground />
                    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                    <KeyboardAvoidingView
                        enabled={Platform.OS === 'ios'}
                        behavior="padding"
                        style={styles.keyboardInner}
                        keyboardVerticalOffset={0}
                    >
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
                                <Button
                                    title="Tạo tài khoản"
                                    onPress={handleSubmit}
                                    variant="primary"
                                    fullWidth
                                    style={styles.submitButton}
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
            height: 40,
        },
        footer: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xl + spacing.sm + 12,
            paddingTop: spacing.xs,
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
    });
