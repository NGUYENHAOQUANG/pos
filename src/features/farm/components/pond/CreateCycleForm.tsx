import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { DropDownButtonBasic } from '@/features/farm/components/DropDownButtonBasic';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import BreedInfoCard from '@/features/farm/components/BreedInfoCard';
import { PondDataBox } from '@/features/farm/components/pondwork/PondDataBox';

import { useFarm } from '@/features/farm/store/farmStore';
import { CycleData } from '@/features/farm/types/farm.types';
import { formatNumber } from '@/features/farm/utils/numberUtils';
import { parseDate, formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { Input } from '@/shared/components/forms/Input';
interface Props {
    formData: Partial<CycleData>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<CycleData>>>;
    pondId?: string;
    isEdit?: boolean;
}

const CreateCycleForm: React.FC<Props> = ({ formData, setFormData, pondId, isEdit = false }) => {
    // Lấy danh mục từ FarmContext
    const { breedOptions, seasonOptions, getPondById } = useFarm();

    const updateField = (key: keyof CycleData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Tính tổng chi phí giống ước tính = breedOptions.price * tổng số lượng thả
    const estimatedCost = useMemo(() => {
        if (!formData.breedSource || !formData.stockingQuantity) {
            return 0;
        }

        const selectedBreed = breedOptions.find(o => o.value === formData.breedSource);
        if (!selectedBreed?.price) {
            return 0;
        }

        const quantity =
            typeof formData.stockingQuantity === 'string'
                ? parseFloat(formData.stockingQuantity)
                : formData.stockingQuantity;

        if (isNaN(quantity) || quantity <= 0) {
            return 0;
        }

        return selectedBreed.price * quantity;
    }, [formData.breedSource, formData.stockingQuantity, breedOptions]);

    // Tính mật độ (con/m²) = Tổng số PL thả / Diện tích ao (m²)
    const density = useMemo(() => {
        if (!formData.stockingQuantity || !pondId) {
            return 0;
        }

        const pond = getPondById(pondId);
        if (!pond?.area) {
            return 0;
        }

        // Parse area string (e.g., "2400 m²") to number
        const areaStr = String(pond.area).replace(/[^0-9.]/g, '');
        const parsedArea = parseFloat(areaStr);

        if (isNaN(parsedArea) || parsedArea <= 0) {
            return 0;
        }

        const quantity =
            typeof formData.stockingQuantity === 'string'
                ? parseFloat(formData.stockingQuantity)
                : formData.stockingQuantity;

        if (isNaN(quantity) || quantity <= 0) {
            return 0;
        }

        return quantity / parsedArea;
    }, [formData.stockingQuantity, pondId, getPondById]);

    return (
        <View style={styles.container}>
            <SelectionInfoBox title="Chọn nguồn giống và vụ nuôi">
                <View style={styles.breedSection}>
                    <View style={styles.inputGroupNoMargin}>
                        <Text style={styles.label}>
                            <Text style={styles.required}>* </Text>Chọn tôm giống
                        </Text>
                        <DropDownButtonBasic
                            data={breedOptions.map(opt => ({ id: opt.value, label: opt.label }))}
                            value={
                                formData.breedSource
                                    ? {
                                          id: formData.breedSource,
                                          label:
                                              breedOptions.find(
                                                  o => o.value === formData.breedSource
                                              )?.label || '',
                                      }
                                    : undefined
                            }
                            onSelect={item => updateField('breedSource', String(item.id))}
                            style={styles.dropdown}
                            showIcon={false}
                            height={40}
                            borderRadius={6}
                        />
                    </View>

                    {formData.breedSource && (
                        <BreedInfoCard
                            materialCode={
                                breedOptions.find(o => o.value === formData.breedSource)
                                    ?.materialCode || ''
                            }
                            price={
                                breedOptions.find(o => o.value === formData.breedSource)?.price || 0
                            }
                            supplier={
                                breedOptions.find(o => o.value === formData.breedSource)
                                    ?.supplier || ''
                            }
                        />
                    )}
                </View>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>
                            <Text style={styles.required}>* </Text>Chọn vụ nuôi
                        </Text>
                        <DropDownButtonBasic
                            data={seasonOptions.map(opt => ({ id: opt.value, label: opt.label }))}
                            value={
                                formData.season
                                    ? {
                                          id: formData.season,
                                          label:
                                              seasonOptions.find(o => o.value === formData.season)
                                                  ?.label || '',
                                      }
                                    : undefined
                            }
                            onSelect={item => updateField('season', String(item.id))}
                            style={styles.dropdown}
                            showIcon={false}
                            height={40}
                            borderRadius={6}
                        />
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>
                            <Text style={styles.required}>* </Text>Tên chu kỳ
                        </Text>
                        <Input
                            placeholder="Tên chu kỳ"
                            value={formData.cycleName || ''}
                            onChangeText={text => updateField('cycleName', text)}
                        />
                    </View>
                </View>
            </SelectionInfoBox>

            <PondDataBox
                title="Thông tin thả giống"
                resultItems={[
                    {
                        label: 'Mật độ (con/m²)',
                        value: density > 0 ? density.toFixed(6) : '-',
                    },
                    {
                        label: 'Tổng chi phí giống ước tính (VNĐ)',
                        value: estimatedCost > 0 ? formatNumber(estimatedCost) : '-',
                    },
                ]}
            >
                <DateInputButton
                    label="Ngày thả"
                    date={
                        formData.stockingDate
                            ? typeof formData.stockingDate === 'string' &&
                              formData.stockingDate.includes('/')
                                ? parseDate(formData.stockingDate)
                                : new Date(formData.stockingDate)
                            : null
                    }
                    onDateChange={date => updateField('stockingDate', formatDateWithTime(date))}
                    disabled={isEdit}
                    formatOptions={{
                        showCurrentLabel: 'auto',
                    }}
                />

                <View style={styles.row}>
                    <View style={styles.col65}>
                        <Text style={styles.label}>
                            <Text style={styles.required}>* </Text>Tổng số lượng thả (PLs)
                        </Text>
                        <Input
                            placeholder="Vd: 200.000"
                            keyboardType="numeric"
                            value={
                                formData.stockingQuantity !== undefined
                                    ? String(formData.stockingQuantity)
                                    : ''
                            }
                            onChangeText={text => {
                                const num = text ? parseFloat(text) : undefined;
                                updateField(
                                    'stockingQuantity',
                                    isNaN(num as number) ? undefined : num
                                );
                            }}
                        />
                    </View>
                    <View style={styles.col35}>
                        <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
                            <Text style={styles.required}>* </Text>Ngày tuổi (PLs)
                        </Text>
                        <Input
                            placeholder="Vd: 10"
                            keyboardType="numeric"
                            value={formData.age !== undefined ? String(formData.age) : ''}
                            onChangeText={text => {
                                const num = text ? parseFloat(text) : undefined;
                                updateField('age', isNaN(num as number) ? undefined : num);
                            }}
                        />
                    </View>
                </View>
            </PondDataBox>

            <SelectionNotesBox
                notes={formData.notes || ''}
                onNotesChange={text => updateField('notes', text)}
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
    inputGroup: {
        width: '100%',
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
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    col: {
        flex: 1,
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
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 6,
        paddingHorizontal: spacing.md,
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.white,
    },
    placeholderText: {
        color: colors.textSecondary,
    },
    disabledInput: {
        backgroundColor: colors.gray[100],
    },
});
