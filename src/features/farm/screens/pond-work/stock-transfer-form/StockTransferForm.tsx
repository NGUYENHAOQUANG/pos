import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
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
    const hasInitialized = useRef(false);
    const scrollRef = useRef<KeyboardAwareScrollView>(null);
    const transferInfoY = useRef(0);

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
        setIsConfirmationModalVisible(true);
    }, []);

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
                    primaryDisabled={isSubmitting}
                />
            </View>

            {UnsavedChangesModal}
            <ConfirmationModalUI
                visible={isConfirmationModalVisible}
                onConfirm={handleConfirmSave}
                onCancel={handleCancelConfirmation}
                title="Xác nhận sang ao"
                message={`Việc sang ao sẽ kết thúc chu kỳ hiện tại ở ao vèo và tiếp tục giai đoạn nuôi ở ao nuôi.
Sau khi thực hiện, bạn sẽ không thể chỉnh sửa lại dữ liệu của giai đoạn vèo.
Bạn có chắc muốn sang ao không?`}
                confirmText="Sang ao"
                cancelText="Không"
                showSuccessToast={false}
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
