import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import {
    DropDownButton,
    DropDownItem,
} from '@/features/menu/components/aquaculture/DropDownButton';

import { RequiredDot } from '@/shared/components/forms/Input';
import {
    aquacultureFormSchema,
    AquacultureFormValues,
    AquacultureFormStatus,
} from '@/features/menu/schemas/aquacultureFormSchema';
import { showLimitCharacterToast } from '@/features/farm/utils/toastMessages';

// ================================================================
// Props Interface (Presenter Pattern)
// ================================================================
interface ZoneOption {
    id: string;
    label: string;
}

export interface AquacultureFormProps {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    isSubmitting: boolean;
    initialData: AquacultureFormValues | undefined;
    zoneOptions: ZoneOption[];
    onSubmit: (data: AquacultureFormValues) => void;
    onHasChangesChange?: (hasChanges: boolean) => void;
}

// ================================================================
// Ref Interface for triggering form submit from Container
// ================================================================
export interface AquacultureFormRef {
    submit: () => void;
}

// Radio option type with optional disabled
interface StatusOption {
    label: string;
    value: string;
    disabled?: boolean;
}

// ================================================================
// Presenter Component (forwardRef for Container submit trigger)
// ================================================================
export const AquacultureForm = React.forwardRef<AquacultureFormRef, AquacultureFormProps>(
    ({ isEditMode, initialData, zoneOptions, onSubmit, onHasChangesChange }, ref) => {
        const initializedRef = useRef(false);

        const {
            control,
            handleSubmit,
            reset,
            formState: { errors, isDirty },
        } = useForm<AquacultureFormValues>({
            resolver: zodResolver(aquacultureFormSchema),
            defaultValues: {
                zoneId: '',
                zoneName: '',
                name: '',
                code: '',
                startDate: new Date(),
                endDate: null,
                status: 'preparing',
                note: '',
            },
        });

        // Reset form when initialData changes (edit mode)
        useEffect(() => {
            if (initialData && !initializedRef.current) {
                reset(initialData);
                initializedRef.current = true;
            }
        }, [initialData, reset]);

        // Notify parent of dirty state changes
        useEffect(() => {
            onHasChangesChange?.(isDirty);
        }, [isDirty, onHasChangesChange]);

        // Build radio options based on edit mode and initial status
        const statusOptions = useMemo((): StatusOption[] => {
            const initialStatus = initialData?.status;
            const options: StatusOption[] = [
                {
                    label: 'Chuẩn bị',
                    value: 'preparing',
                    disabled: isEditMode && initialStatus === 'active',
                },
                { label: 'Đang nuôi', value: 'active' },
            ];

            if (initialStatus === 'ended') {
                options.push({ label: 'Đã kết thúc', value: 'ended', disabled: false });
            }

            return options;
        }, [isEditMode, initialData?.status]);

        // Expose submit function via ref for Container to trigger
        React.useImperativeHandle(
            ref,
            () => ({
                submit: () => {
                    handleSubmit((data: AquacultureFormValues) => {
                        onSubmit(data);
                    })();
                },
            }),
            [handleSubmit, onSubmit]
        );

        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Zone Selection */}
                <View style={styles.card}>
                    <View style={styles.fieldContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>
                                {isEditMode ? 'Trại nuôi' : 'Chọn trại nuôi'}
                            </Text>
                            <RequiredDot />
                        </View>
                        <Controller
                            name="zoneId"
                            control={control}
                            render={({ field: { onChange, value } }) => {
                                const selectedZone = zoneOptions.find(z => z.id === value);
                                if (isEditMode) {
                                    return (
                                        <Input
                                            value={selectedZone?.label || ''}
                                            editable={false}
                                            placeholder="Trại nuôi"
                                            containerStyle={styles.noMarginBottom}
                                            inputContainerStyle={styles.inputDisabledBox}
                                            required
                                        />
                                    );
                                }
                                return (
                                    <DropDownButton
                                        data={zoneOptions}
                                        value={selectedZone}
                                        onSelect={(item: DropDownItem) => {
                                            onChange(item.id.toString());
                                        }}
                                        placeholder="Chọn trại nuôi"
                                        style={styles.dropdown}
                                        height={44}
                                        borderRadius={12}
                                    />
                                );
                            }}
                        />
                        {errors.zoneId && (
                            <Text style={styles.errorText}>{errors.zoneId.message}</Text>
                        )}
                    </View>

                    {/* Cycle Name */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Tên vụ nuôi</Text>
                            <RequiredDot />
                        </View>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="Tên vụ nuôi"
                                    containerStyle={styles.noMarginBottom}
                                    inputContainerStyle={styles.customInputBox}
                                    inputStyle={
                                        value ? styles.inputTextFilled : styles.inputTextPlaceholder
                                    }
                                    placeholderTextColor={colors.gray[400]}
                                    error={errors.name?.message}
                                />
                            )}
                        />
                    </View>

                    {/* Cycle Code */}
                    <View style={[styles.fieldContainer, styles.zIndex10]}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Mã vụ nuôi</Text>
                            <RequiredDot />
                        </View>
                        <Controller
                            name="code"
                            control={control}
                            render={({ field: { value } }) => (
                                <Input
                                    value={value || ''}
                                    placeholder="Mã vụ nuôi"
                                    containerStyle={styles.noMarginBottom}
                                    inputContainerStyle={styles.customInputDisabledBox}
                                    inputStyle={
                                        value ? styles.inputTextFilled : styles.inputTextPlaceholder
                                    }
                                    placeholderTextColor={colors.gray[400]}
                                    disabled
                                />
                            )}
                        />
                    </View>

                    {/* Start Date */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Ngày bắt đầu</Text>
                            <RequiredDot />
                        </View>
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <DateInputButton
                                    date={value}
                                    onDateChange={onChange}
                                    height={44}
                                    borderRadius={12}
                                    formatOptions={{
                                        showCurrentLabel: 'auto',
                                    }}
                                />
                            )}
                        />
                        {errors.startDate && (
                            <Text style={styles.errorText}>{errors.startDate.message}</Text>
                        )}
                    </View>

                    {/* End Date */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Ngày kết thúc</Text>
                            <RequiredDot />
                        </View>
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <DateInputButton
                                    date={value}
                                    onDateChange={onChange}
                                    height={44}
                                    borderRadius={12}
                                    formatOptions={{
                                        showCurrentLabel: false,
                                        fallbackText: 'dd/mm/yyyy, hr:mm',
                                    }}
                                />
                            )}
                        />
                    </View>

                    {/* Status */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Chọn trạng thái</Text>
                            <RequiredDot />
                        </View>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <RadioButton
                                    options={statusOptions}
                                    value={value}
                                    onValueChange={(val: string) =>
                                        onChange(val as AquacultureFormStatus)
                                    }
                                    disabled={initialData?.status === 'ended'}
                                />
                            )}
                        />
                    </View>

                    {/* Note */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Ghi chú</Text>
                            <RequiredDot />
                        </View>
                        <View style={styles.inputGroup}>
                            <Controller
                                name="note"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.textArea,
                                            value
                                                ? styles.inputTextFilled
                                                : styles.inputTextPlaceholder,
                                        ]}
                                        placeholder="Nhập ghi chú"
                                        placeholderTextColor={colors.gray[400]}
                                        value={value || ''}
                                        onChangeText={text => {
                                            if (text.length > 1999) {
                                                showLimitCharacterToast();
                                                onChange(text.substring(0, 1999));
                                            } else {
                                                onChange(text);
                                            }
                                        }}
                                        multiline
                                        textAlignVertical="top"
                                        maxLength={2000}
                                    />
                                )}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        flex: 1,
        marginHorizontal: spacing.md,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: spacing.sm + 4,
        flexGrow: 0,
        gap: spacing.md,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requiredDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.error,
        marginLeft: 4,
        marginBottom: 2,
    },
    content: {},
    fieldContainer: {
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0,
        gap: 16,
    },
    flex1: {
        flex: 1,
        gap: 6,
    },
    zIndex10: {
        zIndex: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        color: colors.gray[950],
    },
    required: {
        color: colors.error,
    },
    dropdown: {
        zIndex: 100,
    },
    inputGroup: {
        gap: 6,
    },
    noMarginBottom: {
        marginBottom: 0,
    },
    textArea: {
        height: 114,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        textAlignVertical: 'top',
    },
    customInputBox: {
        height: 44,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
    },
    customInputDisabledBox: {
        height: 44,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
    },
    inputTextFilled: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20,
        color: colors.gray[950],
    },
    inputTextPlaceholder: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 20,
        color: colors.gray[400],
    },
    inputDisabledBox: {
        backgroundColor: colors.gray[100],
    },
    fullCodeContainer: {
        position: 'absolute',
        top: 72,
        right: 0,
        minWidth: 260,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: spacing.sm + 4,
        paddingVertical: spacing.sm + 2,
        zIndex: 100,
        elevation: 5,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    fullCodeText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    fullCodeValue: {
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        color: colors.error,
        marginTop: 2,
    },
});
