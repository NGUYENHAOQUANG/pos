import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { colors, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import {
    AquacultureForm,
    AquacultureFormRef,
} from '@/features/menu/components/aquaculture/AquacultureForm';
import { useFarm } from '@/features/farm/store/farmStore';
import { SeasonData } from '@/features/farm/types/farm.types';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';

type EditAquacultureRouteProp = RouteProp<
    { EditAquaculture: { aquaculture: SeasonData } },
    'EditAquaculture'
>;

export const EditAquacultureScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EditAquacultureRouteProp>();
    const { aquaculture } = route.params;
    const { setTabBarVisible } = useTabBarVisibility();
    const { updateSeasonApi, deleteSeasonApi, zones } = useFarm();
    const formRef = useRef<AquacultureFormRef>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const timeout = setTimeout(() => {
                setTabBarVisible(false);
            }, 100);

            return () => {
                clearTimeout(timeout);
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    const handleUpdate = async () => {
        const data = formRef.current?.submit();
        if (data && aquaculture.zoneId) {
            const success = await updateSeasonApi(aquaculture.zoneId, aquaculture.id.toString(), {
                seasonName: data.name,
                startDate: data.startDate?.toISOString(),
                endDate: data.endDate?.toISOString(),
            });
            if (success) {
                Toast.show(ToastMessages.Aquaculture.UPDATE_SUCCESS);
                navigation.goBack();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không thể cập nhật vụ nuôi',
                });
            }
        }
    };

    const handleDelete = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (aquaculture.zoneId) {
            const success = await deleteSeasonApi(aquaculture.zoneId, aquaculture.id.toString());
            setDeleteModalVisible(false);

            if (success) {
                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: 'Đã xóa vụ nuôi',
                });
                navigation.goBack();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không thể xóa vụ nuôi',
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <HeaderMenu
                title="Chỉnh sửa vụ nuôi"
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                        <DeleteIcon width={20} height={20} color={colors.error} />
                    </TouchableOpacity>
                }
            />

            <View style={styles.content}>
                <AquacultureForm ref={formRef} initialValues={aquaculture as any} zones={zones} />
            </View>

            <ButtonBarMenu
                primaryTitle="Cập nhật thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleUpdate}
                onSecondaryPress={() => {
                    navigation.goBack();
                }}
                secondaryType="default"
            />

            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                title="Xoá vụ nuôi"
                message="Bạn có chắc chắn muốn xoá vụ nuôi này?"
                successMessage="Đã xóa vụ nuôi thành công"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
    },
});
