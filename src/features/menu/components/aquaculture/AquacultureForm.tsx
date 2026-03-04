import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
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
import { FarmInput } from '@/features/farm/components/pondwork/FarmInput';
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
    ({ isEditMode, initialData, zoneOptions, onSubmit }, ref) => {
        const initializedRef = useRef(false);
        const [showFullCode, setShowFullCode] = useState(false);

        const {
            control,
            handleSubmit,
            reset,
            watch,
            formState: { errors },
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

        const currentCode = watch('code');

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
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                        <Text style={styles.required}>* </Text>
                        {isEditMode ? 'Trại nuôi' : 'Chọn trại nuôi'}
                    </Text>
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
                                    height={40}
                                    borderRadius={6}
                                />
                            );
                        }}
                    />
                    {errors.zoneId && <Text style={styles.errorText}>{errors.zoneId.message}</Text>}
                </View>

                {/* Cycle Name & Code */}
                <View style={[styles.row, styles.zIndex10]}>
                    <View style={styles.flex1}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <FarmInput
                                    label="Tên vụ nuôi"
                                    required
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="Nhập"
                                    containerStyle={styles.noMarginBottom}
                                    error={errors.name?.message}
                                />
                            )}
                        />
                    </View>
                    <View style={[styles.flex1, styles.zIndex10]}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => (currentCode ? setShowFullCode(!showFullCode) : null)}
                        >
                            <View pointerEvents="none">
                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field: { value } }) => (
                                        <Input
                                            label="Mã vụ nuôi"
                                            value={value || ''}
                                            placeholder="Mã tự động"
                                            containerStyle={styles.noMarginBottom}
                                            inputContainerStyle={styles.inputDisabledBox}
                                            disabled
                                            ellipsizeMode="tail"
                                        />
                                    )}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Full Code Display Popup */}
                        {showFullCode && currentCode ? (
                            <View style={styles.fullCodeContainer}>
                                <Text style={styles.fullCodeText} selectable>
                                    Mã vụ nuôi:{' '}
                                    <Text style={styles.fullCodeValue}>{currentCode}</Text>
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Start & End Date */}
                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <DateInputButton
                                    label="Ngày bắt đầu"
                                    date={value}
                                    onDateChange={onChange}
                                    required
                                    height={40}
                                    dateOnly
                                    formatOptions={{
                                        showCurrentLabel: false,
                                    }}
                                />
                            )}
                        />
                        {errors.startDate && (
                            <Text style={styles.errorText}>{errors.startDate.message}</Text>
                        )}
                    </View>
                    <View style={styles.flex1}>
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <DateInputButton
                                    label="Ngày kết thúc"
                                    date={value}
                                    onDateChange={onChange}
                                    height={40}
                                    dateOnly
                                    formatOptions={{
                                        showCurrentLabel: false,
                                    }}
                                />
                            )}
                        />
                    </View>
                </View>

                {/* Status */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Chọn trạng thái</Text>
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
                    <Text style={styles.label}>Ghi chú</Text>
                    <View style={styles.inputGroup}>
                        <Controller
                            name="note"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Nhập ghi chú"
                                    placeholderTextColor={colors.borderSubtle}
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
            </ScrollView>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        flex: 1,
        paddingTop: spacing.sm,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 1,
    },
    content: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        backgroundColor: colors.white,
        flexGrow: 0,
        gap: spacing.md,
    },
    fieldContainer: {
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0,
        gap: spacing.sm,
    },
    flex1: {
        flex: 1,
    },
    zIndex10: {
        zIndex: 10,
    },
    label: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        fontStyle: 'normal',
        lineHeight: 22,
        color: colors.text,
    },
    required: {
        color: colors.error,
    },
    dropdown: {
        zIndex: 100,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    noMarginBottom: {
        marginBottom: 0,
    },
    textArea: {
        minHeight: 80,
        maxHeight: 160,
        paddingVertical: spacing.xs + 1,
        paddingHorizontal: spacing.md - 4,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.xs + 2,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.regular,
        fontStyle: 'normal',
        lineHeight: 24,
        letterSpacing: 0,
        color: colors.text,
        textAlignVertical: 'top',
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
        borderRadius: borderRadius.sm,
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
