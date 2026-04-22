import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { POND_TYPES } from '@/features/farm/types/farm.types';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxType,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { CurrentPondInfoBox } from '@/features/farm/components/pondwork/transfer/CurrentPondInfoBox';
import {
    TransferInfoBox,
    ReceivingPondItem,
} from '@/features/farm/components/pondwork/transfer/TransferInfoBox';
import {
    StockTransferConfirmationModal,
    PondConfirmItem,
} from '@/features/farm/components/bottom-sheet/StockTransferModal';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import type { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import type { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export interface StockTransferFormProps {
    shrimpBreed?: string;
    totalShrimpCount: number;
    actualStockingQuantity?: number;
    latestShrimpSize?: string;
    pondOptions: DropDownItem[];
    isSubmitting: boolean;
    onBack: () => void;
    onSubmit: (data: StockTransferFormData) => void;
    currentPondName?: string;
    cultureDays?: number;
    pondTypeName?: string;
    pondTypeMap?: Map<string, string>;
}

export interface StockTransferFormData {
    selectedDate: Date;
    notes: string;
    shrimpSize: string;
    transferMethod: string;
    receivingPonds: ReceivingPondItem[];
}

export const StockTransferForm: React.FC<StockTransferFormProps> = ({
    shrimpBreed,
    totalShrimpCount,
    actualStockingQuantity,
    latestShrimpSize,
    pondOptions,
    isSubmitting,
    onBack,
    onSubmit,
    currentPondName,
    cultureDays,
    pondTypeName,
    pondTypeMap,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [notes, setNotes] = useState<string>('');
    const [shrimpSize, setShrimpSize] = useState<string>(latestShrimpSize || '0');
    const [transferMethod] = useState<string>('Sang hết');
    const [receivingPonds, setReceivingPonds] = useState<ReceivingPondItem[]>(() => [
        { id: Date.now().toString(), quantity: '' },
    ]);
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const [showWarnings, setShowWarnings] = useState(false);
    const hasInitialized = useRef(false);
    const scrollRef = useRef<KeyboardAwareScrollView>(null);
    const transferInfoY = useRef(0);

    // Culture days warning: only for Ao vèo source (Ao nuôi → Ao nuôi always allowed)
    const isNurseryPond = pondTypeName === POND_TYPES.NURSERY;
    const hasCultureDaysWarning = isNurseryPond && cultureDays !== undefined && cultureDays < 15;

    // Check shrimp count error
    const totalQuantity = useMemo(() => {
        return receivingPonds.reduce((sum, pond) => {
            const qty = parseFloat(pond.quantity.replace(/\D/g, '')) || 0;
            return sum + qty;
        }, 0);
    }, [receivingPonds]);
    const hasShrimpCountError = useMemo(() => {
        if (!totalShrimpCount || totalShrimpCount === 0) return false;
        if (totalQuantity === 0) return false;
        return totalQuantity !== totalShrimpCount;
    }, [totalQuantity, totalShrimpCount]);

    // Check if any selected receiving pond is "Ao nuôi"
    const hasAnyCultivationReceiving = useMemo(() => {
        if (!pondTypeMap) return false;
        return receivingPonds.some(p => {
            if (!p.receivingPond) return false;
            return pondTypeMap.get(p.receivingPond) === POND_TYPES.CULTIVATION;
        });
    }, [receivingPonds, pondTypeMap]);

    const hasPondSelected = useMemo(() => {
        return receivingPonds.some(p => !!p.receivingPond);
    }, [receivingPonds]);

    // Disable: only when no pond selected or shrimp count error
    const isSaveDisabled = isSubmitting || !hasPondSelected || hasShrimpCountError;

    const hasChanges = useMemo(() => {
        const hasPondSelected = receivingPonds.some(p => !!p.receivingPond);
        const hasQuantityChanged = receivingPonds.some(
            p => p.quantity !== '' && p.quantity !== totalShrimpCount.toString()
        );
        const defaultShrimpSize = latestShrimpSize || '60';
        const hasShrimpSizeChanged = shrimpSize !== defaultShrimpSize;

        return (
            notes !== '' ||
            hasPondSelected ||
            hasQuantityChanged ||
            hasShrimpSizeChanged ||
            transferMethod !== 'Sang hết' ||
            receivingPonds.length > 1
        );
    }, [notes, shrimpSize, transferMethod, receivingPonds, totalShrimpCount, latestShrimpSize]);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const prevTotalRef = useRef(totalShrimpCount);
    const prevLatestSizeRef = useRef(latestShrimpSize);

    useEffect(() => {
        if (totalShrimpCount > 0) {
            setReceivingPonds(prev => {
                if (!hasInitialized.current) {
                    if (
                        prev.length === 1 &&
                        (prev[0].quantity === '' || prev[0].quantity === '0')
                    ) {
                        hasInitialized.current = true;
                        return [{ ...prev[0], quantity: totalShrimpCount.toString() }];
                    }
                } else if (prevTotalRef.current !== totalShrimpCount) {
                    // Update if user hasn't manually modified it from the stale cached value
                    if (prev.length === 1 && prev[0].quantity === prevTotalRef.current.toString()) {
                        return [{ ...prev[0], quantity: totalShrimpCount.toString() }];
                    }
                }
                return prev;
            });
        }
        prevTotalRef.current = totalShrimpCount;
    }, [totalShrimpCount]);

    useEffect(() => {
        if (latestShrimpSize && latestShrimpSize !== prevLatestSizeRef.current) {
            setShrimpSize(prev => {
                const prevExpected = prevLatestSizeRef.current || '0';
                if (prev === prevExpected || prev === '0') {
                    return latestShrimpSize;
                }
                return prev;
            });
        }
        prevLatestSizeRef.current = latestShrimpSize;
    }, [latestShrimpSize]);

    const handleSavePress = useCallback(() => {
        if (hasCultureDaysWarning && hasAnyCultivationReceiving) {
            setShowWarnings(true);
            return;
        }
        setIsConfirmationModalVisible(true);
    }, [hasCultureDaysWarning, hasAnyCultivationReceiving]);

    const handleConfirmSave = useCallback(() => {
        setIsConfirmationModalVisible(false);
        allowNavigation();
        onSubmit({ selectedDate, notes, shrimpSize, transferMethod, receivingPonds });
    }, [
        onSubmit,
        selectedDate,
        notes,
        shrimpSize,
        transferMethod,
        receivingPonds,
        allowNavigation,
    ]);

    const handleCancelConfirmation = useCallback(() => {
        setIsConfirmationModalVisible(false);
    }, []);

    const confirmPonds: PondConfirmItem[] = useMemo(() => {
        return receivingPonds
            .filter(p => !!p.receivingPond)
            .map(p => {
                const option = pondOptions.find(o => String(o.value) === p.receivingPond);
                return {
                    id: p.id,
                    label: option?.label ?? p.receivingPond ?? '',
                    quantity: parseFloat(p.quantity.replace(/\D/g, '')) || 0,
                };
            });
    }, [receivingPonds, pondOptions]);

    return (
        <View style={styles.container}>
            <HeaderSection title="Sang ao" onBack={onBack} />

            <SafeInputLayout
                innerRef={scrollRef}
                contentContainerStyle={styles.scrollContent}
                extraScrollHeight={150}
            >
                <GeneralInfoBox
                    type={GeneralInfoBoxType.DEFAULT}
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    disabledDate={true}
                />

                <CurrentPondInfoBox
                    shrimpBreed={shrimpBreed}
                    shrimpSize={shrimpSize}
                    onShrimpSizeChange={setShrimpSize}
                    totalEstimatedShrimp={totalShrimpCount}
                    actualStockingQuantity={actualStockingQuantity}
                />

                <View
                    onLayout={e => {
                        transferInfoY.current = e.nativeEvent.layout.y;
                    }}
                >
                    <TransferInfoBox
                        transferMethod={transferMethod}
                        onTransferMethodPress={() => {}}
                        receivingPonds={receivingPonds}
                        onReceivingPondsChange={setReceivingPonds}
                        onReceivingPondPress={_id => {}}
                        totalEstimatedShrimp={totalShrimpCount}
                        pondOptions={pondOptions}
                        currentPondName={currentPondName}
                        cultureDays={cultureDays}
                        showCultureDaysWarning={
                            showWarnings && hasCultureDaysWarning && hasAnyCultivationReceiving
                        }
                    />
                </View>

                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </SafeInputLayout>

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Hủy"
                    onPrimaryPress={handleSavePress}
                    onSecondaryPress={onBack}
                    primaryDisabled={isSaveDisabled}
                />
            </View>

            {UnsavedChangesModal}
            <StockTransferConfirmationModal
                visible={isConfirmationModalVisible}
                onConfirm={handleConfirmSave}
                onCancel={handleCancelConfirmation}
                receivingPonds={confirmPonds}
                currentPondName={currentPondName}
                cultureDays={cultureDays}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        scrollContent: {
            padding: 0,
            paddingBottom: 150,
        },
        footer: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
