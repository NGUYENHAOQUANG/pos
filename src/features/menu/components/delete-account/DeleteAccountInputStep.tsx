import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { colors, spacing, borderRadius } from '@/styles';
import { DeleteAccountWarningBox } from '@/features/menu/components/delete-account/DeleteAccountWarningStep';
import { IconCheckActive, IconCheckUnactive } from '@/assets/icons';
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
    const insets = useSafeAreaInsets();
    const paddingBottom = Math.max(insets.bottom, 16);

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
    const otherReasonInputRef = useRef<TextInput>(null);

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
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
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
                    <View style={styles.card}>
                        <DeleteAccountWarningBox style={{ marginBottom: spacing.lg }} />

                        <Text style={styles.instructionText}>
                            Để tiến hành xoá tài khoản, nhập các thông tin sau:
                        </Text>

                        {/* Phone Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>
                                Số điện thoại của tài khoản hiện tại
                            </Text>

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
                                        placeholderTextColor={colors.textTertiary}
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
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>
                                Lý do xoá tài khoản (có thể chọn nhiều)
                            </Text>

                            <View style={styles.checkboxContainer}>
                                {DELETE_REASONS.map((reason, index) => {
                                    const isSelected = watchSelectedReasons.includes(reason);
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.checkboxOption}
                                            onPress={() => toggleReason(reason)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ marginRight: spacing.sm }}>
                                                {isSelected ? (
                                                    <IconCheckActive width={16} height={16} />
                                                ) : (
                                                    <IconCheckUnactive width={16} height={16} />
                                                )}
                                            </View>
                                            <Text style={styles.checkboxText}>{reason}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Input nhập thêm */}
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
                                                placeholderTextColor={colors.textTertiary}
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
            </KeyboardAvoidingView>

            <View style={[styles.footer, { paddingBottom }]}>
                <TouchableOpacity style={styles.dangerButton} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.dangerButtonText}>Tiếp tục</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        position: 'relative',
    },
    scrollContent: {
        paddingTop: spacing.sm,
        paddingBottom: 220,
    },
    card: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    instructionText: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.xs,
        fontWeight: '400',
    },
    required: {
        color: colors.red[600],
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.white,
    },
    textArea: {
        paddingTop: spacing.sm,
        height: 100,
    },
    inputError: {
        borderColor: colors.red[600],
    },
    errorText: {
        marginTop: 4,
        fontSize: 12,
        color: colors.red[600],
    },
    footer: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    dangerButton: {
        backgroundColor: colors.red[600],
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    dangerButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    checkboxContainer: {
        marginTop: 4,
        marginLeft: 16,
    },
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm + 4,
        paddingVertical: 2,
    },

    checkboxText: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
    },
});
