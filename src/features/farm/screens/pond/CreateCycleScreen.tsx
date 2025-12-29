import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import CreateCycleForm from '@/features/farm/components/pond/CreateCycleForm';
import { FarmStackParamList } from '../../navigation/FarmNavigator';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import TrashOutlined from '@/assets/Icon/IconDevices/TrashOutlined.svg';
import Toast from 'react-native-toast-message';
import { useFarm } from '../../context/FarmContext';
import { CycleData } from '../../types/farm.types';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { formatDate } from '@/features/farm/utils/dateUtils';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CreateCycle'>;
type Nav = NativeStackNavigationProp<FarmStackParamList, 'CreateCycle'>;

export const CreateCycleScreen: React.FC = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<ScreenRouteProp>();

    // Lấy các hàm từ FarmContext
    const { saveActiveCycle, deleteActiveCycle } = useFarm();

    const { pondId, initialData } = route.params;
    const isEdit = !!initialData;

    // State quản lý ẩn/hiện Modal xác nhận xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Initialize form data from CycleData
    const getInitialFormData = (data: CycleData | null | undefined): Partial<CycleData> => {
        if (!data) {
            return {
                cycleName: '',
                breedSource: undefined,
                season: undefined,
                stockingDate: formatDate(new Date()),
            };
        }
        return {
            ...data,
        };
    };

    // Sử dụng state cục bộ để quản lý dữ liệu form trước khi lưu
    const [cycleData, setCycleData] = useState<Partial<CycleData>>(getInitialFormData(initialData));

    const checkFields = () => {
        return (
            !!cycleData.breedSource &&
            !!cycleData.season &&
            !!cycleData.cycleName &&
            !!cycleData.stockingDate &&
            cycleData.stockingQuantity !== undefined &&
            cycleData.stockingQuantity > 0 &&
            cycleData.age !== undefined &&
            cycleData.age > 0
        );
    };

    const handleCreate = () => {
        if (!checkFields() || !pondId) {
            return Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập đầy đủ các thông tin',
                position: 'top',
                topOffset: 60,
            });
        }

        // Convert Partial<CycleData> to CycleData đầy đủ
        const fullCycleData: CycleData = {
            id: initialData?.id || `${pondId}-${Date.now()}`,
            cycleName: cycleData.cycleName!,
            breedSource: cycleData.breedSource!,
            season: cycleData.season!,
            stockingDate: cycleData.stockingDate!,
            stockingQuantity: cycleData.stockingQuantity!,
            age: cycleData.age!,
            density: cycleData.density || 0,
            estimatedCost: cycleData.estimatedCost || 0,
            notes: cycleData.notes,
            endDate: cycleData.endDate,
            sourcePonds: cycleData.sourcePonds || [pondId],
            receivingPonds: cycleData.receivingPonds,
            status: cycleData.status,
            doc: cycleData.doc,
        };

        // Lưu vào FarmContext
        saveActiveCycle(pondId, fullCycleData);
        navigation.goBack();
    };

    const onConfirmDelete = () => {
        if (pondId) {
            deleteActiveCycle(pondId); // Xóa trong FarmContext
            setShowDeleteModal(false); // Đóng modal

            // Navigate về màn hình ao nuôi để hiện Toast thành công
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <HeaderFarm
                title={isEdit ? 'Chỉnh sửa chu kỳ nuôi' : 'Tạo chu kỳ nuôi'}
                onBack={() => navigation.goBack()}
                type="simple"
                rightAction={
                    isEdit ? (
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => setShowDeleteModal(true)}
                        >
                            <TrashOutlined width={24} height={24} fill={colors.red[600]} />
                        </TouchableOpacity>
                    ) : null
                }
            />

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <CreateCycleForm formData={cycleData} setFormData={setCycleData} pondId={pondId} />
            </ScrollView>

            <ButtonBarFarm
                primaryTitle={isEdit ? 'Cập nhật thông tin' : 'Bắt đầu chu kỳ nuôi'}
                secondaryTitle="Hủy"
                onPrimaryPress={handleCreate}
                onSecondaryPress={() => navigation.goBack()}
                primaryDisabled={
                    isEdit &&
                    JSON.stringify(cycleData) ===
                        JSON.stringify(initialData ? getInitialFormData(initialData) : {})
                }
            />

            <ConfirmationDeleteModal
                visible={showDeleteModal}
                onConfirm={onConfirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                title="Xác nhận xóa chu kỳ nuôi"
                message="Bạn sẽ không thể truy cập lại chu kỳ đã xóa. Các vật tư đã xuất kho cho chu kỳ này sẽ có thể bị ảnh hưởng. Bạn có chắc chắn mốn xóa chu kỳ này không?"
                confirmText="Xóa chu kỳ"
                cancelText="Không"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FF4D4F',
    },
});

export default CreateCycleScreen;
