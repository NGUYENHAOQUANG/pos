import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { borderRadius, colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { DropDownButtonBasic } from '@/features/farm/components/DropDownButtonBasic';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import BreedInfoCard from '@/features/farm/components/BreedInfoCard';
import { PondDataBox } from '@/features/farm/components/pondwork/PondDataBox';
import { BreedOption, PondData } from '@/features/farm/types/farm.types';
import { formatNumber } from '@/features/farm/utils/numberUtils';
import { parseDate } from '@/features/farm/utils/dateUtils';
import { Input } from '@/shared/components/forms/Input';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

import { Control, Controller, useWatch } from 'react-hook-form';
import { CreateCycleFormValues } from '@/features/farm/schemas/createCycleSchema';

interface Props {
    control: Control<CreateCycleFormValues>;
    pondId?: string;
    pond?: PondData; // Must be typed
    isEdit?: boolean;
    breedOptions: BreedOption[];
    seasonOptions: { label: string; value: string }[];
}

const CreateCycleForm: React.FC<Props> = ({
    control,
    pondId,
    pond,
    isEdit = false,
    breedOptions,
    seasonOptions,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

    // Watch values to calculate derived states (density, cost)
    const activeBreedSource = useWatch({ control, name: 'breedSource' });
    const activeStockingQuantity = useWatch({ control, name: 'stockingQuantity' });
    const activeNotes = useWatch({ control, name: 'notes' });

    // Computed: Estimated Cost
    const estimatedCost = useMemo(() => {
        if (!activeBreedSource || !activeStockingQuantity) {
            return 0;
        }

        const selectedBreed = breedOptions.find(o => String(o.value) === activeBreedSource);
        if (!selectedBreed?.price) {
            return 0;
        }

        const quantity = parseFloat(activeStockingQuantity);
        if (isNaN(quantity) || quantity <= 0) {
            return 0;
        }

        return selectedBreed.price * quantity;
    }, [activeBreedSource, activeStockingQuantity, breedOptions]);

    // Computed: Density
    const density = useMemo(() => {
        if (!activeStockingQuantity || !pondId) {
            return 0;
        }

        let areaVal = pond?.areaSqm;
        if (!areaVal && pond?.area) {
            const areaStr = String(pond.area).replace(/[^0-9.]/g, '');
            areaVal = parseFloat(areaStr);
        }

        if (!areaVal || isNaN(areaVal) || areaVal <= 0) {
            return 0;
        }

        const quantity = parseFloat(activeStockingQuantity);
        if (isNaN(quantity) || quantity <= 0) {
            return 0;
        }

        return Math.round(quantity / areaVal);
    }, [activeStockingQuantity, pondId, pond]);

    return (
        <View style={styles.container}>
            <SelectionInfoBox title="Chọn nguồn giống và vụ nuôi">
                <View style={styles.breedSection}>
                    {/* Breed Source Controller */}
                    <Controller
                        control={control}
                        name="breedSource"
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <View style={styles.inputGroupNoMargin}>
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
                                                      breedOptions.find(
                                                          o => String(o.value) === value
                                                      )?.label || '',
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

                    {/* Breed Info Card - Rendered conditionally on Watch state */}
                    {activeBreedSource && (
                        <BreedInfoCard
                            materialCode={
                                breedOptions.find(o => String(o.value) === activeBreedSource)
                                    ?.materialCode || ''
                            }
                            price={
                                breedOptions.find(o => String(o.value) === activeBreedSource)
                                    ?.price || 0
                            }
                            supplier={
                                breedOptions.find(o => String(o.value) === activeBreedSource)
                                    ?.supplier || ''
                            }
                            remainingQuantity={
                                breedOptions.find(o => String(o.value) === activeBreedSource)
                                    ?.remainingQuantity
                            }
                        />
                    )}

                    {/* Season Controller */}
                    <Controller
                        control={control}
                        name="season"
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <View style={styles.inputGroupNoMargin}>
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

                    {/* Cycle Name Controller */}
                    <Controller
                        control={control}
                        name="cycleName"
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <View style={styles.inputGroupNoMargin}>
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

            <PondDataBox
                title="Thông tin thả giống"
                resultItems={[
                    {
                        label: 'Mật độ (con/m²)',
                        value: density > 0 ? formatNumber(density) : '-',
                    },
                    {
                        label: 'Tổng chi phí giống ước tính (VNĐ)',
                        value: estimatedCost > 0 ? formatNumber(estimatedCost) : '-',
                    },
                ]}
            >
                {/* Stocking Date Controller */}
                <Controller
                    control={control}
                    name="stockingDate"
                    render={({ field: { value } }) => (
                        <DateInputButton
                            label="Ngày thả"
                            date={
                                value
                                    ? typeof value === 'string' && value.includes('/')
                                        ? parseDate(value)
                                        : new Date(value)
                                    : null
                            }
                            // Date is fixed to current time according to business logic, so we do not trigger onChange
                            onDateChange={() => {}}
                            disabled={true}
                            dateText={!isEdit && value ? `${value} (hiện tại)` : undefined}
                            formatOptions={{
                                showCurrentLabel: 'auto',
                            }}
                        />
                    )}
                />

                <View style={{ gap: 6 }}>
                    <View style={styles.row}>
                        <View style={styles.col65}>
                            <Controller
                                control={control}
                                name="stockingQuantity"
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <View>
                                        <Text style={styles.label}>
                                            <Text style={styles.required}>* </Text>Tổng số lượng thả
                                            (PLs)
                                        </Text>
                                        <Input
                                            placeholder="Vd: 200.000"
                                            keyboardType="numeric"
                                            value={value || ''}
                                            onChangeText={text => onChange(text.slice(0, 10))}
                                        />
                                        {error && (
                                            <Text style={styles.errorText}>{error.message}</Text>
                                        )}
                                    </View>
                                )}
                            />
                        </View>
                        <View style={styles.col35}>
                            <Controller
                                control={control}
                                name="age"
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <View>
                                        <Text
                                            style={styles.label}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            <Text style={styles.required}>* </Text>Ngày tuổi (PLs)
                                        </Text>
                                        <Input
                                            placeholder="Vd: 10"
                                            keyboardType="numeric"
                                            value={value || ''}
                                            onChangeText={onChange}
                                        />
                                        {error && (
                                            <Text style={styles.errorText}>{error.message}</Text>
                                        )}
                                    </View>
                                )}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.aiButton}
                        onPress={() => navigation.navigate('CountingShrimp')}
                    >
                        <Text style={styles.aiButtonText}>Kiểm đếm tôm giống bằng AI</Text>
                    </TouchableOpacity>
                </View>
            </PondDataBox>

            <Controller
                control={control}
                name="notes"
                render={({ field: { onChange } }) => (
                    <SelectionNotesBox notes={activeNotes || ''} onNotesChange={onChange} />
                )}
            />
        </View>
    );
};

export default CreateCycleForm;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    breedSection: {
        gap: spacing.sm,
    },
    inputGroupNoMargin: {
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
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    col65: {
        flex: 0.65,
    },
    col35: {
        flex: 0.35,
    },
    dropdown: {
        width: '100%',
    },
    aiButton: {
        backgroundColor: colors.blue[50],
        borderWidth: 1,
        borderColor: colors.blue[200],
        paddingVertical: 12,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '400',
    },
});
