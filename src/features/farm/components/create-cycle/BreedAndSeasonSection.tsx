import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { DropDownButtonBasic } from '@/features/farm/components/DropDownButtonBasic';
import BreedInfoCard from '@/features/farm/components/BreedInfoCard';
import { Input, RequiredDot } from '@/shared/components/forms/Input';

import { Control, Controller, useWatch } from 'react-hook-form';
import { CreateCycleFormValues } from '@/features/farm/schemas/createCycleSchema';
import { BreedOption } from '@/features/farm/types/farm.types';

interface Props {
    control: Control<CreateCycleFormValues>;
    breedOptions: BreedOption[];
    seasonOptions: { label: string; value: string }[];
    isEdit?: boolean;
}

const BreedAndSeasonSection: React.FC<Props> = ({
    control,
    breedOptions,
    seasonOptions,
    isEdit = false,
}) => {
    const activeBreedSource = useWatch({ control, name: 'breedSource' });

    const selectedBreed = activeBreedSource
        ? breedOptions.find(o => String(o.value) === activeBreedSource)
        : undefined;

    return (
        <SelectionInfoBox title="Chọn nguồn giống và vụ nuôi">
            <View style={styles.breedSection}>
                <Controller
                    control={control}
                    name="breedSource"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <View style={styles.inputGroup}>
                            <View style={styles.labelWrapper}>
                                <Text style={styles.label}>Chọn tôm giống</Text>
                                <RequiredDot />
                            </View>
                            <DropDownButtonBasic
                                data={breedOptions.map(opt => ({
                                    id: String(opt.value),
                                    label: opt.label,
                                }))}
                                value={
                                    value
                                        ? {
                                              id: value,
                                              label:
                                                  breedOptions.find(o => String(o.value) === value)
                                                      ?.label || '',
                                          }
                                        : undefined
                                }
                                onSelect={item => onChange(String(item.id))}
                                style={styles.dropdown}
                                showIcon={false}
                                height={40}
                                borderRadius={6}
                            />
                            {error && <Text style={styles.errorText}>{error.message}</Text>}
                        </View>
                    )}
                />

                {activeBreedSource && selectedBreed && (
                    <BreedInfoCard
                        materialCode={selectedBreed.materialCode || ''}
                        price={selectedBreed.price || 0}
                        supplier={selectedBreed.supplier || ''}
                        remainingQuantity={selectedBreed.remainingQuantity}
                    />
                )}

                <Controller
                    control={control}
                    name="season"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <View style={styles.inputGroup}>
                            <View style={styles.labelWrapper}>
                                <Text style={styles.label}>Chọn vụ nuôi</Text>
                                <RequiredDot />
                            </View>
                            <DropDownButtonBasic
                                data={seasonOptions.map(opt => ({
                                    id: opt.value,
                                    label: opt.label,
                                }))}
                                value={
                                    value
                                        ? {
                                              id: value,
                                              label:
                                                  seasonOptions.find(o => o.value === value)
                                                      ?.label || '',
                                          }
                                        : undefined
                                }
                                onSelect={item => onChange(String(item.id))}
                                style={styles.dropdown}
                                showIcon={false}
                                height={40}
                                disabled={isEdit}
                                borderRadius={6}
                            />
                            {error && <Text style={styles.errorText}>{error.message}</Text>}
                        </View>
                    )}
                />

                <Controller
                    control={control}
                    name="cycleName"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <View style={styles.inputGroup}>
                            <View style={styles.labelWrapper}>
                                <Text style={styles.label}>Tên chu kỳ</Text>
                                <RequiredDot />
                            </View>
                            <Input
                                containerStyle={{ marginBottom: 0 }}
                                placeholder="Tên chu kỳ"
                                value={value || ''}
                                onChangeText={onChange}
                            />
                            {error && <Text style={styles.errorText}>{error.message}</Text>}
                        </View>
                    )}
                />
            </View>
        </SelectionInfoBox>
    );
};

export default BreedAndSeasonSection;

const styles = StyleSheet.create({
    breedSection: {
        gap: spacing.md,
    },
    inputGroup: {
        width: '100%',
        gap: 4,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    required: {
        color: colors.error,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
    },
    dropdown: {
        width: '100%',
    },
});
