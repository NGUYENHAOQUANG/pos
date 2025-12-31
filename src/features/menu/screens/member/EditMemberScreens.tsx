import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { useMenuContext } from '@/features/menu/context/MenuContext';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { GeneralInformation } from '@/features/menu/components/member/GeneralInformation';
import { FeaturePermissions } from '@/features/menu/components/member/FeaturePermissions';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { WorkUnit } from '@/features/menu/components/member/WorkUnit';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { ResendComfirmCard } from '@/features/menu/components/member/ResendComfirmCard';
import { unitsData } from '@/features/menu/data/memberData';

const FARM_DATA = unitsData.filter(u => u.type === 'Trại');
const POND_DATA = unitsData.filter(u => u.type === 'Ao');

export const EditMemberScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
    const route = useRoute<any>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { members, updateMember, deleteMember } = useMenuContext();

    const paramMember = route.params?.member;
    const member = members.find(m => m.id === paramMember?.id) || paramMember;

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
    const [role, setRole] = useState<'staff' | 'manager'>('staff'); // Internal ID

    // Feature Permissions State
    const [managementLevel, setManagementLevel] = useState<'farm' | 'pond'>('farm'); // Internal ID
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [resendModalVisible, setResendModalVisible] = useState(false);
    const [activateModalVisible, setActivateModalVisible] = useState(false); // Reuse reuse modal or add new state? Add new state for clarity

    // Load member data
    useEffect(() => {
        if (member) {
            setName(member.name || '');
            setContact(member.email || member.phone || ''); // Assuming contact is email/phone
            // Map display strings back to IDs if necessary, or use IDs if member object has them
            setRole(member.role === 'Quản lý' ? 'manager' : 'staff');
            setManagementLevel(member.managementLevel === 'Cấp ao nuôi' ? 'pond' : 'farm');
            // Load permissions and units directly from member
            setSelectedUnitIds(member.unitIds || []);

            // Map member permissions (from data) to component IDs
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

    // Reset units when management level changes (only if user manually changes it)
    // We need to be careful not to reset on initial load.
    const isFirstRun = React.useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        // Only reset if it's an actual change by user interaction
        setSelectedUnitIds([]);
    }, [managementLevel]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleUpdateMember = () => {
        // Validation
        if (!name.trim()) {
            Toast.show(ToastMessages.Member.NAME_REQUIRED);
            return;
        }

        if (member?.id) {
            updateMember(member.id, {
                name,
                role: role === 'manager' ? 'Quản lý' : 'Nhân viên',
                managementLevel: managementLevel === 'farm' ? 'Cấp trại nuôi' : 'Cấp ao nuôi',
                permissions: selectedPermissions.map(p => {
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
                }),
                unitIds: selectedUnitIds,
                email: member.email, // Preserve email
                status: member.status, // Preserve status
            });
            Toast.show(ToastMessages.Member.UPDATE_SUCCESS);
        }

        navigation.navigate('MemberManagement');
    };

    const handleDelete = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (member?.id) {
            deleteMember(member.id);
        }
        setDeleteModalVisible(false);
        navigation.navigate('MemberManagement');
    };

    const handleResendInvite = () => {
        setResendModalVisible(true);
    };

    const handleConfirmResend = () => {
        console.log('Resend Invite');
        setResendModalVisible(false);
        Toast.show(ToastMessages.Member.RESEND_INVITE_SUCCESS);
    };

    const handleSuspend = () => {
        setSuspendModalVisible(true);
    };

    const handleConfirmSuspend = () => {
        if (member?.id) {
            updateMember(member.id, { status: 'paused' });
        }
        setSuspendModalVisible(false);
        navigation.navigate('MemberManagement');
    };

    const isPending = member?.status === 'pending' || member?.status === 'Chờ xác nhận';
    const isPaused =
        member?.status === 'paused' ||
        member?.status === 'Tạm ngưng' ||
        member?.status === 'suspended';

    const handleActivate = () => {
        setActivateModalVisible(true);
    };

    const handleConfirmActivate = () => {
        if (member?.id) {
            updateMember(member.id, { status: 'active' });
            Toast.show(ToastMessages.Member.ACTIVATE_SUCCESS);
        }
        setActivateModalVisible(false);
        navigation.navigate('MemberManagement');
    };

    return (
        <View style={styles.container}>
            <HeaderMenu
                title="Chỉnh sửa thành viên"
                onBack={handleBack}
                rightAction={
                    isPending ? (
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                            <DeleteIcon width={18} height={18} color={colors.error} />
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            <ScrollView contentContainerStyle={styles.content}>
                <GeneralInformation
                    name={name}
                    onNameChange={setName}
                    contact={contact}
                    onContactChange={setContact}
                    role={role}
                    onRoleChange={setRole}
                    disabled={isPaused}
                />

                <FeaturePermissions
                    managementLevel={managementLevel}
                    onManagementLevelChange={setManagementLevel}
                    selectedPermissions={selectedPermissions}
                    onPermissionsChange={setSelectedPermissions}
                    selectedUnitIds={selectedUnitIds}
                    onUnitsChange={setSelectedUnitIds}
                    onAddUnitPress={() => setModalVisible(true)}
                    disabled={isPaused}
                    availableUnits={managementLevel === 'farm' ? FARM_DATA : POND_DATA}
                />

                {!isPaused && (
                    <View style={styles.actionContainer}>
                        {isPending ? (
                            <TouchableOpacity
                                style={styles.resendButton}
                                onPress={handleResendInvite}
                            >
                                <Text style={styles.resendText}>Gửi lại lời mời</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.suspendButton} onPress={handleSuspend}>
                                <Text style={styles.suspendText}>Tạm ngưng tài khoản</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>

            <ButtonBarMenu
                primaryTitle={isPaused ? 'Kích hoạt lại' : 'Cập nhật thông tin'}
                onPrimaryPress={isPaused ? handleActivate : handleUpdateMember}
                secondaryTitle="Huỷ"
                onSecondaryPress={handleBack}
                style={styles.footer}
            />

            <WorkUnit
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={setSelectedUnitIds}
                type={managementLevel}
                data={managementLevel === 'farm' ? FARM_DATA : POND_DATA}
                initialSelected={selectedUnitIds}
            />

            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                title="Xoá thành viên"
                message="Bạn có chắc chắn muốn xoá thành viên này?"
                successMessage="Đã xóa thành viên thành công"
            />

            <ConfirmationDeleteModal
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
                visible={resendModalVisible}
                onClose={() => setResendModalVisible(false)}
                onConfirm={handleConfirmResend}
            />

            <ResendComfirmCard
                visible={activateModalVisible}
                onClose={() => setActivateModalVisible(false)}
                onConfirm={handleConfirmActivate}
                title="Kích hoạt lại"
                message="Bạn có chắc chắn muốn kích hoạt lại tài khoản này không?"
                confirmText="Kích hoạt lại"
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
        paddingVertical: spacing.sm,
        paddingHorizontal: 0,
        gap: spacing.sm,
        paddingBottom: 120, // Space for footer + action button
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white, // Or transparent
    },
    actionContainer: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.sm,
    },
    resendButton: {
        width: '100%',
        height: 32,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundPrimary,
    },
    resendText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '400',
    },
    suspendButton: {
        width: '100%',
        height: 32,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    suspendText: {
        color: colors.error,
        fontSize: 14,
        fontWeight: '400',
    },
});
