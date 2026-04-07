import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useActiveCycle } from '@/features/farm/hooks/useCycle';
import { usePondDetail } from '@/features/farm/hooks/usePonds';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { MeasurementDataBox } from '@/features/farm/components/pondwork/measurement/MeasurementDataBox';

import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { useMeasureShrimpSizeForm } from '@/features/farm/hooks/pondwork/sizeMeasurement/useMeasureShrimpSizeForm';

type MeasureShrimpSizeScreenRouteProp = RouteProp<FarmStackParamList, 'MeasureShrimpSizeScreen'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const MeasureShrimpSizeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<MeasureShrimpSizeScreenRouteProp>();

    const { itemToEdit, pondId, aiShrimpSize } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const zoneId = useFarmStore(state => state.selectedZoneId) || '';

    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    const { data: currentPond } = usePondDetail(zoneId, pondId || '');

    // Get stocking quantity from cycle data
    // useActiveCycle already fetches cycle detail internally - no need for a separate useQuery
    const { data: activeCycleData } = useActiveCycle(currentPond?.id || '');

    // --- Stocking Quantity Optimization ---
    const stockingQuantity = useMemo(() => {
        if (!activeCycleData) return undefined;

        // Optimized check sequence
        return (
            (activeCycleData as any).transferInfo?.originalCycle?.totalStocking ??
            (activeCycleData as any).stockingQuantity ??
            activeCycleData.totalStocking
        );
    }, [activeCycleData]);

    // --- Form Handling ---
    const {
        time,
        setTime,
        shrimpSize,
        setShrimpSize,
        remainingWeight,
        setRemainingWeight,
        notes,
        setNotes,
        images,
        setImages,
        initialDocumentIds,
        isDeleteModalVisible,
        setIsDeleteModalVisible,
        handleSave,
        handleDelete,
        UnsavedChangesModal,
        hasChanges,
        isSubmitting,
    } = useMeasureShrimpSizeForm({
        pondId: currentPond?.id,
        itemToEdit,
        onSaveSuccess: () => {
            generalInfoBoxRef.current?.markAsSaved();
        },
    });

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    useEffect(() => {
        if (aiShrimpSize) {
            setShrimpSize(aiShrimpSize);
        }
    }, [aiShrimpSize, setShrimpSize]);

    const onSavePress = () => {
        if (isSubmitting) return;
        const documentIds = generalInfoBoxRef.current?.getUploadedIds() || [];
        handleSave(documentIds);
    };

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Đo kích thước tôm"
                onBack={navigation.goBack}
                rightComponent={
                    itemToEdit ? (
                        <DeleteButton onPress={() => setIsDeleteModalVisible(true)} />
                    ) : undefined
                }
            />

            <SafeInputLayout
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                extraScrollHeight={100}
            >
                <GeneralInfoBox
                    ref={generalInfoBoxRef}
                    type="withImage"
                    date={time}
                    onDateChange={setTime}
                    imageUris={images}
                    onImagesChange={setImages}
                    documentIds={initialDocumentIds}
                    disabledDate={true}
                />
                <MeasurementDataBox
                    shrimpSize={shrimpSize}
                    onShrimpSizeChange={setShrimpSize}
                    remainingWeight={remainingWeight}
                    onRemainingWeightChange={setRemainingWeight}
                    stockingQuantity={stockingQuantity}
                    onAIMeasurePress={() =>
                        navigation.navigate('MeasureShrimpSizeAIScreen', {
                            pondId: currentPond?.id || '',
                        })
                    }
                />
                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </SafeInputLayout>

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={onSavePress}
                    onSecondaryPress={navigation.goBack}
                    isLoading={isSubmitting}
                    primaryDisabled={!!itemToEdit && !hasChanges}
                />
            </View>

            <ConfirmationModalUI
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                onConfirm={handleDelete}
                title="Xoá tác vụ"
                message="Bạn có chắc chắn muốn xoá tác vụ này không?"
                confirmText="Đồng ý"
                cancelText="Không"
                successMessage="Đã xoá tác vụ thành công"
            />
            {UnsavedChangesModal}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 0,
            paddingBottom: 100,
        },
        footer: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
