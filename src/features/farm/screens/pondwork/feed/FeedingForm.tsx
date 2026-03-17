import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '@/styles';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { IMaterial, MaterialGroupType } from '@/features/material/types/material.types';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import InfoIcon from '@/assets/Icon/information-circle.svg';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import ActivitySchedule, {
    ScheduleItem,
} from '@/features/control/components/CustomFeedingMachine/ActivitySchedule';
import { feedingFormSchema, FeedingFormValues } from '@/features/farm/schemas/feedingFormSchema';
import { handleFeedingFormError } from '@/features/farm/utils/toastMessages';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

export interface FeedingFormProps {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    isSubmitting: boolean;
    initialData: FeedingFormValues | undefined;
    onSubmit: (data: FeedingFormValues) => void;
    onHasChangesChange?: (hasChanges: boolean) => void;
}

export interface FeedingFormRef {
    submit: () => void;
    allowNavigation: () => void;
}

export const FeedingForm = React.forwardRef<FeedingFormRef, FeedingFormProps>(
    (
        { isEditMode, isLoadingDetail, isSubmitting, initialData, onSubmit, onHasChangesChange },
        ref
    ) => {
        const initializedRef = useRef(false);

        const { control, handleSubmit, reset, watch } = useForm<FeedingFormValues>({
            resolver: zodResolver(feedingFormSchema),
            defaultValues: {
                executionDate: new Date(),
                materials: [],
                mode: 'manual',
                schedules: [],
                note: '',
            },
        });

        const currentMode = watch('mode');

        useEffect(() => {
            if (isEditMode) {
                if (initialData && !initializedRef.current) {
                    reset(initialData);
                    initializedRef.current = true;
                }
            } else {
                initializedRef.current = true;
            }
        }, [initialData, reset, isEditMode]);

        const currentValues = watch();

        const hasChanges = React.useMemo(() => {
            if (!initializedRef.current) return false;

            if (!isEditMode) {
                const hasSelectedMaterials =
                    currentValues.materials && currentValues.materials.length > 0;
                const hasNote = currentValues.note && currentValues.note.trim().length > 0;
                const hasSchedules =
                    currentValues.mode === 'schedule' &&
                    currentValues.schedules &&
                    currentValues.schedules.length > 0;

                return !!(hasSelectedMaterials || hasNote || hasSchedules);
            }

            if (!initialData) return false;

            const materialsChanged =
                JSON.stringify(currentValues.materials) !== JSON.stringify(initialData.materials);
            const noteChanged = currentValues.note !== initialData.note;
            const modeChanged = currentValues.mode !== initialData.mode;
            const schedulesChanged =
                JSON.stringify(currentValues.schedules) !== JSON.stringify(initialData.schedules);

            return materialsChanged || noteChanged || modeChanged || schedulesChanged;
        }, [currentValues, initialData, isEditMode]);

        const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

        // Notify parent when hasChanges changes
        React.useEffect(() => {
            onHasChangesChange?.(hasChanges);
        }, [hasChanges, onHasChangesChange]);

        React.useImperativeHandle(
            ref,
            () => ({
                submit: () => {
                    handleSubmit((data: FeedingFormValues) => {
                        onSubmit(data);
                    }, handleFeedingFormError)();
                },
                allowNavigation: () => allowNavigation(),
            }),
            [handleSubmit, onSubmit, allowNavigation]
        );

        return (
            <View
                pointerEvents={isLoadingDetail || isSubmitting ? 'none' : 'auto'}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
                <Controller
                    name="executionDate"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <GeneralInfoBox date={value} onDateChange={onChange} disabledDate={true} />
                    )}
                />

                <Controller
                    name="materials"
                    control={control}
                    render={({ field: { value, onChange } }) => {
                        const selectedItems: SelectedMaterialItem[] = value
                            .filter(m => m.rawMaterial !== undefined && m.rawMaterial !== null)
                            .map(m => ({
                                material: m.rawMaterial as IMaterial,
                                quantity: m.quantity,
                                unit: m.unit,
                            }));

                        const handleMaterialsChange = (newMats: SelectedMaterialItem[]) => {
                            onChange(
                                newMats.map(m => ({
                                    materialId: m.material.id,
                                    materialName: m.material.name,
                                    quantity: m.quantity,
                                    unit: m.unit,
                                    rawMaterial: m.material,
                                }))
                            );
                        };

                        return (
                            <MaterialSelectionBox
                                selectedMaterials={selectedItems}
                                onMaterialsChange={handleMaterialsChange}
                                groupTypes={[MaterialGroupType.FARMING]}
                            />
                        );
                    }}
                />

                {
                    <SelectionInfoBox title="Chế độ hoạt động">
                        <View style={styles.infoBox}>
                            <InfoIcon
                                width={16}
                                height={16}
                                style={styles.infoIcon}
                                color={colors.white}
                            />
                            <Text style={styles.infoText}>
                                Chọn Thủ công để chạy ngay, hoặc Lịch trình để thiết lập nhiều lượt
                                hoạt động trong ngày
                            </Text>
                        </View>

                        <Controller
                            name="mode"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <RadioButton
                                    options={[
                                        { label: 'Thủ công', value: 'manual' },
                                        { label: 'Lịch trình', value: 'schedule' },
                                    ]}
                                    value={value}
                                    onValueChange={onChange}
                                />
                            )}
                        />
                    </SelectionInfoBox>
                }

                {currentMode === 'schedule' && (
                    <Controller
                        name="schedules"
                        control={control}
                        render={({ field: { value, onChange } }) => {
                            const valMapped: ScheduleItem[] = value.map(s => ({
                                startTime: s.startTime || null,
                                endTime: s.endTime || null,
                                id: s.id,
                            })) as ScheduleItem[];

                            const handleScheduleChange = (items: ScheduleItem[]) => {
                                onChange(
                                    items.map(i => ({
                                        startTime: i.startTime,
                                        endTime: i.endTime,
                                        id: i.id,
                                    }))
                                );
                            };

                            return (
                                <ActivitySchedule
                                    schedules={valMapped}
                                    onUpdateSchedules={handleScheduleChange}
                                    style={styles.activitySchedule}
                                    titleStyle={styles.activityScheduleTitle}
                                />
                            );
                        }}
                    />
                )}

                <Controller
                    name="note"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <SelectionNotesBox notes={value || ''} onNotesChange={onChange} />
                    )}
                />

                <View style={styles.spacer} />
                {UnsavedChangesModal}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        padding: 16,
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderSubtle || colors.gray[100],
        marginHorizontal: 0,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    fullWidthDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: -16,
        marginBottom: 16,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 24,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.gray[300],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    radioOuterSelected: {
        borderColor: colors.primaryOrange,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryOrange,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
    },
    infoBox: {
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: colors.border,
        borderWidth: 1,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
        fontWeight: '400',
    },
    activitySchedule: {
        marginTop: 8,
        marginHorizontal: 16,
    },
    activityScheduleTitle: {
        fontSize: 16,
    },
    spacer: {
        height: 80,
    },
});
