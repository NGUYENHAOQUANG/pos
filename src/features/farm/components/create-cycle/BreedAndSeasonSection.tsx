import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { DropDownButtonBasic } from '@/features/farm/components/DropDownButtonBasic';
import BreedInfoCard from '@/features/farm/components/BreedInfoCard';
import { Input } from '@/shared/components/forms/Input';

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
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>Chọn tôm giống
                            </Text>
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
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>Chọn vụ nuôi
                            </Text>
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
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>Tên chu kỳ
                            </Text>
                            <Input
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
        gap: spacing.sm,
    },
    inputGroup: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.sm,
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
        marginTop: 4,
    },
    dropdown: {
        width: '100%',
    },
});
