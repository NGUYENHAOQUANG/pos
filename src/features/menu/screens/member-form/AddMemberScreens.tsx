import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MemberFormValues } from '@/features/menu/schemas/member.schema';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import {
    useRoles,
    useUpdateMemberAdmin,
    useCreateMember,
    useUpdateMemberStatus,
} from '@/features/menu/hooks/useMember';
import { AddMemberContent } from './AddMemberContent';
import { memberService } from '@/features/menu/services/memberService';

export const AddMemberScreens: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
    const route = useRoute<any>();
    const { setTabBarVisible } = useTabBarVisibility();

    const paramMember = route.params?.member;
    const member = paramMember ? paramMember : null;
    const isEditMode = !!member;

    const { data: rolesResponse, isLoading: isRolesLoading } = useRoles();
    const availableRoles = React.useMemo(() => rolesResponse || [], [rolesResponse]);
    const { mutate: updateMemberAdmin, isPending: isUpdating } = useUpdateMemberAdmin();
    const { mutate: createMember, isPending: isCreating } = useCreateMember();
    const { mutate: updateMemberStatus } = useUpdateMemberStatus();

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

    const initialData = React.useMemo(() => {
        if (isEditMode && member && rolesResponse) {
            return memberService.mapDetailToForm(member, availableRoles);
        }
        return undefined;
    }, [isEditMode, member, rolesResponse, availableRoles]);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [resendModalVisible, setResendModalVisible] = useState(false);
    const [activateModalVisible, setActivateModalVisible] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const onSubmit = (data: MemberFormValues) => {
        if (isEditMode && member) {
            // Edit mode: update via PUT /auth/admin/users/{userId}
            const newRoleId = data.roles?.[0];
            if (newRoleId) {
                updateMemberAdmin(
                    {
                        id: member.userId,
                        payload: {
                            fullName: data.name,
                            roleId: newRoleId,
                            isActive: !isPaused,
                            zoneId: data.zoneId,
                        },
                    },
                    {
                        onSuccess: () => {
                            navigation.navigate('MemberManagement');
                        },
                    }
                );
            }
        } else {
            // Create mode
            const roleId = data.roles?.[0];
            if (roleId) {
                createMember(
                    {
                        fullName: data.name,
                        phoneNumber: data.contact,
                        roleId: roleId,
                        zoneId: data.zoneId,
                    },
                    {
                        onSuccess: () => {
                            Toast.show({
                                type: 'success',
                                text1: 'Thành công',
                                text2: 'Đã thêm thành viên mới',
                            });
                            navigation.navigate('MemberManagement', { showSuccess: true } as any);
                        },
                    }
                );
            } else {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn chức vụ' });
            }
        }
    };

    const handleConfirmDelete = () => {
        setDeleteModalVisible(false);
        navigation.navigate('MemberManagement');
    };

    const handleConfirmSuspend = () => {
        if (member?.userId) {
            updateMemberStatus(
                {
                    id: member.userId,
                    status: 'paused',
                    fullName: member.fullName || '',
                    roleId: member.roleId || undefined,
                    zoneId: member.zoneId || undefined,
                },
                {
                    onSuccess: () => {
                        setSuspendModalVisible(false);
                        navigation.navigate('MemberManagement');
                    },
                }
            );
        }
    };

    const handleConfirmActivate = () => {
        if (member?.userId) {
            updateMemberStatus(
                {
                    id: member.userId,
                    status: 'active',
                    fullName: member.fullName || '',
                    roleId: member.roleId || undefined,
                    zoneId: member.zoneId || undefined,
                },
                {
                    onSuccess: () => {
                        setActivateModalVisible(false);
                        navigation.navigate('MemberManagement');
                    },
                }
            );
        }
    };

    const statusStr = String(member?.status || '')
        .toLowerCase()
        .trim();
    const isActiveStr = String(member?.isActive).toLowerCase().trim();

    // Dựa trên UserStatusEnum từ BE: 1 = Pending, 2 = Active, 3 = Deactivated
    const isPending = statusStr === 'pending';
    const isPaused =
        statusStr === 'deactivated' ||
        isActiveStr === 'false' ||
        statusStr === 'paused' ||
        statusStr === 'inactive';

    if (isRolesLoading) {
        return (
            <View style={styles.container}>
                <HeaderMenu
                    title={isEditMode ? 'Chỉnh sửa thành viên' : 'Thêm thành viên'}
                    onBack={handleBack}
                    rightIcon={
                        isEditMode ? (
                            <DeleteIcon width={20} height={20} color={theme.text} />
                        ) : undefined
                    }
                    onRightPress={isEditMode ? () => setDeleteModalVisible(true) : undefined}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HeaderMenu
                title={isEditMode ? 'Chỉnh sửa thành viên' : 'Thêm thành viên'}
                onBack={handleBack}
                rightIcon={
                    isEditMode ? (
                        <DeleteIcon width={20} height={20} color={theme.text} />
                    ) : undefined
                }
                onRightPress={isEditMode ? () => setDeleteModalVisible(true) : undefined}
            />

            <AddMemberContent
                isEditMode={isEditMode}
                isLoadingDetail={isRolesLoading}
                initialData={initialData}
                availableRoles={availableRoles}
                onSubmit={onSubmit}
                isSubmitting={isUpdating || isCreating}
                onSuspendPress={() => setSuspendModalVisible(true)}
                onResendPress={() => setResendModalVisible(true)}
                onActivatePress={() => setActivateModalVisible(true)}
                onBack={handleBack}
                isPaused={isPaused}
                isPending={isPending}
            />

            {isEditMode && (
                <>
                    <ConfirmationModalUI
                        visible={deleteModalVisible}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setDeleteModalVisible(false)}
                        title="Xoá thành viên"
                        message="Bạn có chắc chắn muốn xoá thành viên này?"
                        successMessage="Đã xóa thành viên thành công"
                    />

                    <ConfirmationModalUI
                        visible={suspendModalVisible}
                        onConfirm={handleConfirmSuspend}
                        onCancel={() => setSuspendModalVisible(false)}
                        title="Tạm ngưng tài khoản"
                        message="Bạn có chắc chắn muốn tạm ngưng tài khoản này?"
                        confirmText="Tạm ngưng"
                        cancelText="Hủy"
                        successMessage="Đã tạm ngưng tài khoản"
                    />

                    <ConfirmationModalUI
                        visible={resendModalVisible}
                        onConfirm={() => {
                            setResendModalVisible(false);
                        }}
                        onCancel={() => setResendModalVisible(false)}
                        title="Gửi lại lời mời"
                        message="Bạn có chắc chắn muốn gửi lại lời mời cho thành viên này không?"
                        confirmText="Đồng ý"
                        cancelText="Hủy"
                        successMessage="Đã gửi lại lời mời thành công"
                    />

                    <ConfirmationModalUI
                        visible={activateModalVisible}
                        onConfirm={handleConfirmActivate}
                        onCancel={() => setActivateModalVisible(false)}
                        title="Kích hoạt lại"
                        message="Bạn có chắc chắn muốn kích hoạt lại tài khoản này không?"
                        confirmText="Kích hoạt lại"
                        cancelText="Hủy"
                        successMessage="Đã kích hoạt lại tài khoản thành công"
                    />
                </>
            )}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
    });
