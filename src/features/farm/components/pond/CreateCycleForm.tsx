import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { borderRadius, colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { DropDownButtonBasic } from '@/features/farm/components/DropDownButtonBasic';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import BreedInfoCard from '@/features/farm/components/BreedInfoCard';
import { PondDataBox } from '@/features/farm/components/pondwork/PondDataBox';

import { CycleData, BreedOption } from '@/features/farm/types/farm.types';
import { formatNumber } from '@/features/farm/utils/numberUtils';
import { parseDate, formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { Input } from '@/shared/components/forms/Input';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
// import { useSeasonsByZone } from '@/features/menu/hooks/useSeasons';

interface Props {
    formData: Partial<CycleData>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<CycleData>>>;
    pondId?: string;
    pond?: any; // Should be PondData but sticking to current loose types or import it
    zoneId?: string;
    isEdit?: boolean;
    breedOptions: BreedOption[];
    seasonOptions: { label: string; value: string }[];
}

const CreateCycleForm: React.FC<Props> = ({
    formData,
    setFormData,
    pondId,
    pond,
    isEdit = false,
    breedOptions,
    seasonOptions,
}) => {
    // Use hooks to fetch seasons - REMOVED -> Lifted to screen
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

    const updateField = (key: keyof CycleData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };
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
    const density = useMemo(() => {
        if (!formData.stockingQuantity || !pondId) {
            return 0;
        }

        let areaVal = (pond as any)?.areaSqm;
        if (!areaVal && pond?.area) {
            const areaStr = String(pond.area).replace(/[^0-9.]/g, '');
            areaVal = parseFloat(areaStr);
        }

        if (!areaVal || isNaN(areaVal) || areaVal <= 0) {
            return 0;
        }

        const quantity =
            typeof formData.stockingQuantity === 'string'
                ? parseFloat(formData.stockingQuantity)
                : formData.stockingQuantity;

        if (isNaN(quantity) || quantity <= 0) {
            return 0;
        }

        const result = Math.round(quantity / areaVal);
        return result;
    }, [formData.stockingQuantity, pondId, pond]);

    useEffect(() => {
        if (formData.density !== density) {
            setFormData(prev => ({ ...prev, density }));
        }
    }, [density, setFormData, formData.density]);

    useEffect(() => {
        if (isEdit) return;

        const updateTime = () => {
            setFormData(prev => ({
                ...prev,
                stockingDate: formatDateWithTime(new Date()),
            }));
        };

        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000;

        const initialTimer = setTimeout(() => {
            updateTime();
            const timer = setInterval(updateTime, 60000);
            return () => clearInterval(timer);
        }, delay);

        return () => clearTimeout(initialTimer);
    }, [isEdit, setFormData]);

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
                    <View style={styles.inputGroupNoMargin}>
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
                            disabled={isEdit}
                            borderRadius={6}
                        />
                    </View>
                    <View style={styles.inputGroupNoMargin}>
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
                        value: density > 0 ? formatNumber(density) : '-',
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
                    disabled={true}
                    dateText={
                        !isEdit && formData.stockingDate
                            ? `${formData.stockingDate} (hiện tại)`
                            : undefined
                    }
                    formatOptions={{
                        showCurrentLabel: 'auto',
                    }}
                />

                <View style={{ gap: 6 }}>
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

                    <TouchableOpacity
                        style={styles.aiButton}
                        onPress={() => navigation.navigate('CountingShrimp')}
                    >
                        <Text style={styles.aiButtonText}>Kiểm đếm tôm giống bằng AI</Text>
                    </TouchableOpacity>
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
