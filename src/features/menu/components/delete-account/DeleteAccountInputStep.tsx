import React, { useRef, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Platform,
    Keyboard,
    TextInput as RNTextInput,
} from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { DeleteAccountWarningBox } from '@/features/menu/components/delete-account/DeleteAccountWarningStep';
import { RequiredDot } from '@/shared/components/forms/Input';
import { Checkbox } from '@/shared/components/forms/Checkbox';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import {
    deleteAccountSchema,
    DeleteAccountFormData,
    DELETE_REASONS,
    OTHER_REASON_KEY,
} from '../../schemas/deleteAccountSchema';

interface DeleteAccountInputStepProps {
    onNext: (phone: string, selectedReasons: string[], otherReason: string) => void;
    currentUserPhone?: string;
}

export const DeleteAccountInputStep: React.FC<DeleteAccountInputStepProps> = ({
    onNext,
    currentUserPhone,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const insets = useSafeAreaInsets();
    const stickyOffset = useMemo(
        () => ({ closed: -(Math.max(insets.bottom, 16) + 16), opened: 0 }),
        [insets.bottom]
    );
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        setError,
        formState: { errors },
    } = useForm<DeleteAccountFormData>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: {
            phoneNumber: '',
            selectedReasons: [],
            otherReasonNote: '',
        },
    });

    const watchSelectedReasons = watch('selectedReasons');
    const hasOtherReason = watchSelectedReasons.includes(OTHER_REASON_KEY);

    const scrollViewRef = useRef<ScrollView>(null);
    const otherReasonInputRef = useRef<RNTextInput>(null);

    useEffect(() => {
        const handleKeyboardShow = () => {
            if (otherReasonInputRef.current?.isFocused()) {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }
        };

        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            handleKeyboardShow
        );

        return () => {
            showSubscription.remove();
        };
    }, []);

    const toggleReason = (reason: string) => {
        const currentReasons = watchSelectedReasons;
        if (currentReasons.includes(reason)) {
            setValue(
                'selectedReasons',
                currentReasons.filter(r => r !== reason)
            );
        } else {
            setValue('selectedReasons', [...currentReasons, reason]);
        }
    };

    const onSubmit = (data: DeleteAccountFormData) => {
        if (currentUserPhone && data.phoneNumber !== currentUserPhone) {
            setError('phoneNumber', { message: 'Số điện thoại không chính xác.' });
            return;
        }

        const cleanSelectedReasons = data.selectedReasons.filter(r => r !== OTHER_REASON_KEY);
        onNext(data.phoneNumber, cleanSelectedReasons, (data.otherReasonNote || '').trim());
    };

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => {
                        if (otherReasonInputRef.current?.isFocused()) {
                            scrollViewRef.current?.scrollToEnd({ animated: true });
                        }
                    }}
                >
                    {/* Warning Box on top */}
                    <DeleteAccountWarningBox />

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <Text style={styles.instructionText}>
                            Để tiến hành xoá tài khoản, nhập các thông tin sau:
                        </Text>

                        {/* Phone Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelWrapper}>
                                <Text style={styles.label}>
                                    Số điện thoại của tài khoản hiện tại
                                </Text>
                                <RequiredDot />
                            </View>

                            <Controller
                                control={control}
                                name="phoneNumber"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.input,
                                            errors.phoneNumber ? styles.inputError : null,
                                        ]}
                                        placeholder="Nhập số điện thoại"
                                        placeholderTextColor={theme.textTertiary}
                                        value={value}
                                        maxLength={10}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="number-pad"
                                    />
                                )}
                            />

                            {errors.phoneNumber && (
                                <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
                            )}
                        </View>

                        {/* Reason Selection */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelWrapper}>
                                <Text style={styles.label}>Lý do xoá tài khoản</Text>
                                <RequiredDot />
                            </View>

                            <View style={styles.checkboxContainer}>
                                {DELETE_REASONS.map((reason, index) => (
                                    <Checkbox
                                        key={index}
                                        checked={watchSelectedReasons.includes(reason)}
                                        onToggle={() => toggleReason(reason)}
                                        label={reason}
                                        size="md"
                                        style={styles.checkboxOption}
                                        labelStyle={styles.checkboxText}
                                    />
                                ))}
                            </View>

                            {/* Other reason input */}
                            {hasOtherReason && (
                                <View style={{ marginTop: spacing.sm }}>
                                    <Controller
                                        control={control}
                                        name="otherReasonNote"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                ref={otherReasonInputRef}
                                                style={[
                                                    styles.input,
                                                    styles.textArea,
                                                    errors.selectedReasons
                                                        ? styles.inputError
                                                        : null,
                                                ]}
                                                placeholder="Nhập lý do khác"
                                                placeholderTextColor={theme.textTertiary}
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                multiline
                                                textAlignVertical="top"
                                                onFocus={() => {
                                                    setTimeout(() => {
                                                        scrollViewRef.current?.scrollToEnd({
                                                            animated: true,
                                                        });
                                                    }, 100);
                                                }}
                                            />
                                        )}
                                    />
                                </View>
                            )}

                            {errors.selectedReasons && (
                                <Text style={styles.errorText}>
                                    {errors.selectedReasons.message}
                                </Text>
                            )}
                        </View>
                    </View>
                </ScrollView>

                {/* Footer Button */}
                <KeyboardStickyView offset={stickyOffset} style={styles.footer}>
                    <ButtonBar
                        mode="single"
                        primaryTitle="Tiếp tục"
                        onPrimaryPress={handleSubmit(onSubmit)}
                        containerStyle={{
                            paddingBottom: 0,
                            paddingTop: 0,
                            backgroundColor: theme.backgroundPrimary,
                        }}
                    />
                </KeyboardStickyView>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
            position: 'relative',
        },
        scrollContent: {
            padding: spacing.md,
            paddingBottom: 100,
            gap: spacing.sm,
        },
        formCard: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            padding: spacing.md,
        },
        instructionText: {
            fontSize: 14,
            color: theme.gray[500],
            marginBottom: spacing.lg,
        },
        inputGroup: {
            marginBottom: spacing.md,
        },
        label: {
            fontSize: 14,
            color: theme.text,
            fontWeight: 'bold',
        },
        labelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xs,
        },
        input: {
            height: 48,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.sm,
            fontSize: 16,
            color: theme.text,
            backgroundColor: theme.background,
        },
        textArea: {
            paddingTop: spacing.sm,
            height: 100,
        },
        inputError: {
            borderColor: theme.red[600],
        },
        errorText: {
            marginTop: 4,
            fontSize: 12,
            color: theme.red[600],
        },

        checkboxContainer: {
            marginTop: spacing.sm,
        },
        checkboxOption: {
            paddingVertical: spacing.xs,
            marginBottom: spacing.xs,
        },
        checkboxText: {
            fontSize: 15,
            color: theme.text,
            flex: 1,
        },
        footer: {
            paddingTop: spacing.xs,
            paddingBottom: spacing.md,
            backgroundColor: theme.backgroundPrimary,
        },
    });
