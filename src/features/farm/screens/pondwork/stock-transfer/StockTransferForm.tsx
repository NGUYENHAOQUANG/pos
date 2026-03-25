import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { CurrentPondInfoBox } from '@/features/farm/components/pondwork/transfer/CurrentPondInfoBox';
import {
    TransferInfoBox,
    ReceivingPondItem,
} from '@/features/farm/components/pondwork/transfer/TransferInfoBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import type { DropdownOption } from '@/features/material/components/DropdownMaterial';
import type { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export interface StockTransferFormProps {
    shrimpBreed?: string;
    totalShrimpCount: number;
    actualStockingQuantity?: number;
    latestShrimpSize?: string;
    pondOptions: DropdownOption[];
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

    useEffect(() => {
        if (!hasInitialized.current && totalShrimpCount > 0) {
            setReceivingPonds(prev => {
                if (prev.length === 1 && (prev[0].quantity === '' || prev[0].quantity === '0')) {
                    hasInitialized.current = true;
                    return [{ ...prev[0], quantity: totalShrimpCount.toString() }];
                }
                return prev;
            });
        }
    }, [totalShrimpCount]);

    const handleDropdownOpen = useCallback(() => {
        setTimeout(() => {
            (scrollRef.current as any)?.scrollToPosition?.(0, transferInfoY.current, true);
        }, 100);
    }, []);

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
                    type="default"
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
                        onDropdownOpen={handleDropdownOpen}
                    />
                </View>

                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </SafeInputLayout>

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Huỷ"
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        padding: 0,
        paddingBottom: 150,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
