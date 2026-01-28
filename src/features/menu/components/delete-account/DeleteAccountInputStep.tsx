import React, { useState, useRef, useEffect } from 'react';
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
import { colors, spacing, borderRadius } from '@/styles';
import { DeleteAccountWarningBox } from './DeleteAccountWarningStep';
import { IconCheckActive, IconCheckUnactive } from '@/assets/icons';

interface DeleteAccountInputStepProps {
    onNext: (phone: string, selectedReasons: string[], otherReason: string) => void;
    currentUserPhone?: string;
}

const OTHER_REASON_KEY = 'Lý do khác';

const DELETE_REASONS = [
    'Không còn sử dụng ứng dụng nữa',
    'Ứng dụng khó sử dụng',
    'Ứng dụng hay bị lỗi / chạy không ổn định',
    'Không đáp ứng đúng nhu cầu công việc',
    OTHER_REASON_KEY,
];

export const DeleteAccountInputStep: React.FC<DeleteAccountInputStepProps> = ({
    onNext,
    currentUserPhone,
}) => {
    const [phone, setPhone] = useState('');
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [otherReasonText, setOtherReasonText] = useState('');
    const [errors, setErrors] = useState({ phone: '', reason: '' });

    // Ref cho ScrollView để điều khiển cuộn
    const scrollViewRef = useRef<ScrollView>(null);
    // Ref cho TextInput "Lý do khác" để kiểm tra focus
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
        setSelectedReasons(prev => {
            if (prev.includes(reason)) {
                return prev.filter(item => item !== reason);
            } else {
                return [...prev, reason];
            }
        });
        if (errors.reason) setErrors(e => ({ ...e, reason: '' }));
    };

    const validate = () => {
        let isValid = true;
        const newErrors = { phone: '', reason: '' };

        const phoneRegex = /^(03|05|07|08|09)+([0-9]{8})\b/;
        if (!phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại.';
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            newErrors.phone = 'Số điện thoại không chính xác';
            isValid = false;
        } else if (currentUserPhone && phone !== currentUserPhone) {
            newErrors.phone = 'Số điện thoại không chính xác.';
            isValid = false;
        }

        if (selectedReasons.length === 0) {
            newErrors.reason = 'Vui lòng chọn một lý do.';
            isValid = false;
        } else if (selectedReasons.includes(OTHER_REASON_KEY) && !otherReasonText.trim()) {
            newErrors.reason = 'Vui lòng nhập chi tiết lý do khác.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validate()) {
            const cleanSelectedReasons = selectedReasons.filter(r => r !== OTHER_REASON_KEY);
            onNext(phone, cleanSelectedReasons, otherReasonText.trim());
        }
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
                            <TextInput
                                style={[styles.input, errors.phone ? styles.inputError : null]}
                                placeholder="Nhập số điện thoại"
                                placeholderTextColor={colors.textTertiary}
                                value={phone}
                                maxLength={10}
                                onChangeText={text => {
                                    setPhone(text);
                                    if (errors.phone) setErrors(e => ({ ...e, phone: '' }));
                                }}
                                keyboardType="number-pad"
                            />
                            {errors.phone ? (
                                <Text style={styles.errorText}>{errors.phone}</Text>
                            ) : null}
                        </View>

                        {/* Reason Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>
                                Lý do xoá tài khoản (có thể chọn nhiều)
                            </Text>

                            <View style={styles.checkboxContainer}>
                                {DELETE_REASONS.map((reason, index) => {
                                    const isSelected = selectedReasons.includes(reason);
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
                            {selectedReasons.includes(OTHER_REASON_KEY) && (
                                <View style={{ marginTop: spacing.sm }}>
                                    <TextInput
                                        ref={otherReasonInputRef}
                                        style={[
                                            styles.input,
                                            styles.textArea,
                                            errors.reason ? styles.inputError : null,
                                        ]}
                                        placeholder="Nhập lý do khác"
                                        placeholderTextColor={colors.textTertiary}
                                        value={otherReasonText}
                                        onChangeText={text => {
                                            setOtherReasonText(text);
                                            if (errors.reason)
                                                setErrors(e => ({ ...e, reason: '' }));
                                        }}
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
                                </View>
                            )}

                            {errors.reason ? (
                                <Text style={styles.errorText}>{errors.reason}</Text>
                            ) : null}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.dangerButton} onPress={handleNext}>
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
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
