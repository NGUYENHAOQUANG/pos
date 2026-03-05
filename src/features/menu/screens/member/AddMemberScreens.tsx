import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { useMenuContext } from '@/features/menu/store/menuStore';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { GeneralInformation } from '@/features/menu/components/member/GeneralInformation';
import { FeaturePermissions } from '@/features/menu/components/member/FeaturePermissions';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { Button } from '@/shared/components/buttons/Button';

import { WorkUnit } from '@/features/menu/components/member/WorkUnit';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { ResendComfirmCard } from '@/features/menu/components/member/ResendComfirmCard';
import { unitsData } from '@/features/menu/data/memberData';

const FARM_DATA = unitsData.filter(u => u.type === 'Trại');
const POND_DATA = unitsData.filter(u => u.type === 'Ao');

export const AddMemberScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
    const route = useRoute<any>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { members, addMember, updateMember, deleteMember } = useMenuContext();

    const paramMember = route.params?.member;
    const member = paramMember ? members.find(m => m.id === paramMember?.id) || paramMember : null;
    const isEditMode = !!member;

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

    // General Information State
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [role, setRole] = useState<'staff' | 'manager'>('staff');

    // Feature Permissions State
    const [managementLevel, setManagementLevel] = useState<'farm' | 'pond'>('farm');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [activateModalVisible, setActivateModalVisible] = useState(false);

    // Load member data if in edit mode
    React.useEffect(() => {
        if (member) {
            setName(member.name || '');
            setContact(member.email || member.phone || '');
            setRole(member.role === 'Quản lý' ? 'manager' : 'staff');
            setManagementLevel(member.managementLevel === 'Cấp ao nuôi' ? 'pond' : 'farm');
            setSelectedUnitIds(member.unitIds || []);
            const mappedPermissions = (member.permissions || []).map((p: string) => {
                switch (p) {
                    case 'manage_member':
                        return 'member_management';
                    case 'perform_task':
                        return 'task_execution';
                    case 'control_iot':
                        return 'iot_control';
                    case 'manage_material':
                        return 'material_management';
                    default:
                        return p;
                }
            });
            setSelectedPermissions(mappedPermissions);
        }
    }, [member]);

    // Reset units when management level changes
    const isFirstRun = React.useRef(true);
    React.useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        if (!member) {
            setSelectedUnitIds([]);
        }
    }, [managementLevel, member]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddOrUpdateMember = () => {
        // Validation
        if (!name.trim()) {
            Toast.show(ToastMessages.Member.NAME_REQUIRED);
            return;
        }

        if (!contact.trim()) {
            Toast.show(ToastMessages.Member.CONTACT_REQUIRED);
            return;
        }

        if (selectedUnitIds.length === 0) {
            Toast.show(ToastMessages.Member.UNIT_REQUIRED);
            return;
        }

        if (selectedPermissions.length === 0) {
            Toast.show(ToastMessages.Member.PERMISSION_REQUIRED);
            return;
        }

        const mappedPermissions = selectedPermissions.map(p => {
            switch (p) {
                case 'member_management':
                    return 'manage_member';
                case 'task_execution':
                    return 'perform_task';
                case 'iot_control':
                    return 'control_iot';
                case 'material_management':
                    return 'manage_material';
                default:
                    return p;
            }
        });

        if (isEditMode) {
            updateMember(member.id, {
                name,
                role: role === 'manager' ? 'Quản lý' : 'Nhân viên',
                managementLevel: managementLevel === 'farm' ? 'Cấp trại nuôi' : 'Cấp ao nuôi',
                permissions: mappedPermissions,
                unitIds: selectedUnitIds,
                email: member.email,
                status: member.status,
            });
            Toast.show(ToastMessages.Member.UPDATE_SUCCESS);
            navigation.navigate('MemberManagement');
        } else {
            addMember({
                name,
                contact,
                role: role === 'staff' ? 'Nhân viên' : 'Quản lý',
                managementLevel: managementLevel === 'farm' ? 'Cấp trại nuôi' : 'Cấp ao nuôi',
                permissions: mappedPermissions,
                unitIds: selectedUnitIds,
            });
            navigation.navigate('MemberManagement', { showSuccess: true } as any);
        }
    };

    const handleConfirmDelete = () => {
        if (member?.id) {
            deleteMember(member.id);
        }
        setDeleteModalVisible(false);
        navigation.navigate('MemberManagement');
    };

    const handleConfirmSuspend = () => {
        if (member?.id) {
            updateMember(member.id, { status: 'paused' });
        }
        setSuspendModalVisible(false);
        navigation.navigate('MemberManagement');
    };

    const handleConfirmActivate = () => {
        if (member?.id) {
            updateMember(member.id, { status: 'active' });
            Toast.show(ToastMessages.Member.ACTIVATE_SUCCESS);
        }
        setActivateModalVisible(false);
        navigation.navigate('MemberManagement');
    };

    const isPending = member?.status === 'pending' || member?.status === 'Chờ xác nhận';
    const isPaused =
        member?.status === 'paused' ||
        member?.status === 'Tạm ngưng' ||
        member?.status === 'suspended';

    return (
        <View style={styles.container}>
            <HeaderMenu
                title={isEditMode ? 'Chỉnh sửa thành viên' : 'Thêm thành viên'}
                onBack={handleBack}
                rightIcon={
                    isEditMode && isPending ? (
                        <DeleteIcon width={20} height={20} color={colors.text} />
                    ) : undefined
                }
                onRightPress={
                    isEditMode && isPending ? () => setDeleteModalVisible(true) : undefined
                }
            />

            <ScrollView contentContainerStyle={isEditMode ? styles.contentEdit : styles.content}>
                <GeneralInformation
                    name={name}
                    onNameChange={setName}
                    contact={contact}
                    onContactChange={setContact}
                    role={role}
                    onRoleChange={setRole}
                    disabled={isEditMode && isPaused}
                />

                <FeaturePermissions
                    managementLevel={managementLevel}
                    onManagementLevelChange={setManagementLevel}
                    selectedPermissions={selectedPermissions}
                    onPermissionsChange={setSelectedPermissions}
                    selectedUnitIds={selectedUnitIds}
                    onUnitsChange={setSelectedUnitIds}
                    onAddUnitPress={() => setModalVisible(true)}
                    availableUnits={managementLevel === 'farm' ? FARM_DATA : POND_DATA}
                    disabled={isEditMode && isPaused}
                />

                {isEditMode && !isPaused && (
                    <View style={styles.actionContainer}>
                        {isPending ? null : (
                            <Button
                                title="Tạm ngưng tài khoản"
                                onPress={() => setSuspendModalVisible(true)}
                                variant="outline"
                                fullWidth
                                style={styles.suspendButton}
                                textStyle={styles.suspendText}
                            />
                        )}
                    </View>
                )}
            </ScrollView>

            <ButtonBarMenu
                primaryTitle={
                    isEditMode
                        ? isPaused
                            ? 'Kích hoạt lại'
                            : 'Cập nhật thông tin'
                        : 'Thêm thành viên'
                }
                onPrimaryPress={
                    isPaused ? () => setActivateModalVisible(true) : handleAddOrUpdateMember
                }
                secondaryTitle="Huỷ"
                onSecondaryPress={handleBack}
                style={isEditMode ? styles.footerEdit : styles.footer}
            />

            <WorkUnit
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={setSelectedUnitIds}
                type={managementLevel}
                data={managementLevel === 'farm' ? FARM_DATA : POND_DATA}
                initialSelected={selectedUnitIds}
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
                        cancelText="Huỷ"
                        successMessage="Đã tạm ngưng tài khoản"
                    />

                    <ResendComfirmCard
                        visible={activateModalVisible}
                        onClose={() => setActivateModalVisible(false)}
                        onConfirm={handleConfirmActivate}
                        title="Kích hoạt lại"
                        message="Bạn có chắc chắn muốn kích hoạt lại tài khoản này không?"
                        confirmText="Kích hoạt lại"
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        paddingVertical: spacing.sm,
        paddingHorizontal: 16,
        gap: spacing.sm,
        paddingBottom: 100,
    },
    contentEdit: {
        paddingVertical: spacing.sm,
        paddingHorizontal: 16,
        gap: spacing.sm,
        paddingBottom: 120,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerEdit: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    actionContainer: {
        paddingHorizontal: 0,
        marginTop: spacing.sm,
    },
    suspendButton: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    suspendText: {
        color: colors.text,
    },
});
