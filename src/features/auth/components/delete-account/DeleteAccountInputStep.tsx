import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { DeleteAccountWarningBox } from './DeleteAccountWarningStep';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface DeleteAccountInputStepProps {
    onNext: (phone: string, reason: string) => void;
}

const OTHER_REASON_KEY = 'Lý do khác';

const DELETE_REASONS = [
    'Không còn sử dụng ứng dụng nữa',
    'Ứng dụng khó sử dụng',
    'Ứng dụng hay bị lỗi / chạy không ổn định',
    'Không đáp ứng đúng nhu cầu công việc',
    OTHER_REASON_KEY,
];

export const DeleteAccountInputStep: React.FC<DeleteAccountInputStepProps> = ({ onNext }) => {
    const [phone, setPhone] = useState('');
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [otherReasonText, setOtherReasonText] = useState('');
    const [errors, setErrors] = useState({ phone: '', reason: '' });

    // 1. Tạo Ref để điều khiển ScrollView
    const scrollViewRef = useRef<ScrollView>(null);

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
            const reasonsToSend = selectedReasons.filter(r => r !== OTHER_REASON_KEY);
            if (selectedReasons.includes(OTHER_REASON_KEY) && otherReasonText.trim()) {
                reasonsToSend.push(`Lý do khác: ${otherReasonText.trim()}`);
            }
            const finalReasonString = reasonsToSend.join(', ');
            onNext(phone, finalReasonString);
        }
    };

    return (
        <View style={styles.container}>
            {/* KeyboardAvoidingView bọc ScrollView để co giãn vùng nội dung */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                // Tăng offset lên để bù trừ cho Header (nếu có)
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    ref={scrollViewRef} // Gắn ref vào đây
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    // Thuộc tính mới giúp tự động cuộn tới input khi bàn phím hiện (chủ yếu cho iOS mới)
                    automaticallyAdjustKeyboardInsets={true}
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
                                            <View
                                                style={[
                                                    styles.checkboxSquare,
                                                    isSelected && styles.checkboxSquareSelected,
                                                ]}
                                            >
                                                {isSelected && (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={16}
                                                        color={colors.white}
                                                    />
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
                                        style={[
                                            styles.input,
                                            styles.textArea,
                                            errors.reason ? styles.inputError : null,
                                        ]}
                                        placeholder="Nhập lý do khác..."
                                        placeholderTextColor={colors.textTertiary}
                                        value={otherReasonText}
                                        onChangeText={text => {
                                            setOtherReasonText(text);
                                            if (errors.reason)
                                                setErrors(e => ({ ...e, reason: '' }));
                                        }}
                                        multiline
                                        textAlignVertical="top"
                                        //Tự động cuộn xuống đáy khi focus
                                        onFocus={() => {
                                            // Chờ 1 chút để bàn phím bắt đầu hiện lên rồi mới scroll
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
    },
    scrollContent: {
        paddingTop: spacing.sm,
        paddingBottom: 250,
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
        // ZIndex thấp hơn keyboard nhưng cao hơn nội dung nền nếu cần
        zIndex: 1,
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
    checkboxSquare: {
        height: 20,
        width: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        backgroundColor: colors.white,
    },
    checkboxSquareSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxText: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
    },
});
