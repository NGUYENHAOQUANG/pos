import React from 'react';
import { View, StyleSheet } from 'react-native';

import { spacing } from '@/styles';
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
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                            <DropDownButtonBasic
                                label="Chọn tôm giống"
                                required
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
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                            <DropDownButtonBasic
                                label="Chọn vụ nuôi"
                                required
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
                            {/* Inline error hidden; errors are shown via toast */}
                        </View>
                    )}
                />

                <Controller
                    control={control}
                    name="cycleName"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                            <Input
                                label="Tên chu kỳ"
                                required
                                containerStyle={{ marginBottom: 0 }}
                                placeholder="Tên chu kỳ"
                                value={value || ''}
                                onChangeText={onChange}
                            />
                            {/* Inline error hidden; errors are shown via toast */}
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
    dropdown: {
        width: '100%',
    },
});
