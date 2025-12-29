import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

// Components
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { HeadingMenu, MenuTabItem } from '@/features/menu/components/HeadingMenu';
import {
    DropDownButton,
    DropDownItem,
} from '@/features/menu/components/aquaculture/DropDownButton';
import { EmptyStateCard } from '@/features/menu/components/EmptyStateCard';
import { useMenuContext } from '@/features/menu/context/MenuContext';
import { MemberItem } from '@/features/menu/components/member/MemberItem';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { ResendComfirmCard } from '@/features/menu/components/member/ResendComfirmCard';

import { useRoute } from '@react-navigation/native';

export const MemberManagementScreens: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { setTabBarVisible } = useTabBarVisibility();
    const [selectedTab, setSelectedTab] = useState('all');
    const { members, deleteMember, updateMember } = useMenuContext();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [resendModalVisible, setResendModalVisible] = useState(false);
    const [activateModalVisible, setActivateModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');

    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

    React.useEffect(() => {
        if (route.params?.showSuccess) {
            Toast.show({
                type: 'success',
                text1: 'Đã thêm thành viên thành công',
            });
            // Reset param to avoid showing toast again on re-render if needed
            navigation.setParams({ showSuccess: undefined });
        }
    }, [route.params?.showSuccess, navigation]);

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

    // Tabs configuration
    const tabs: MenuTabItem[] = [
        { key: 'all', label: 'Tất cả', count: members.length },
        {
            key: 'pending',
            label: 'Chờ xác nhận',
            count: members.filter(m => m.status === 'pending').length,
        },
        {
            key: 'active',
            label: 'Hoạt động',
            count: members.filter(m => m.status === 'active').length,
        },
        {
            key: 'paused',
            label: 'Tạm ngưng',
            count: members.filter(m => m.status === 'paused').length,
        },
    ];

    // Map Filter Options
    const roleOptions: DropDownItem[] = [
        { id: 'all', label: 'Tất cả vai trò' },
        { id: 'Quản lý', label: 'Quản lý' },
        { id: 'Nhân viên', label: 'Nhân viên' },
    ];

    const levelOptions: DropDownItem[] = [
        { id: 'all', label: 'Tất cả cấp bậc' },
        { id: 'Cấp trại nuôi', label: 'Cấp trại nuôi' },
        { id: 'Cấp ao nuôi', label: 'Cấp ao nuôi' },
    ];

    const filteredMembers = members.filter(item => {
        const matchTab = selectedTab === 'all' || item.status === selectedTab;
        const matchRole = selectedRole === 'all' || item.role === selectedRole;
        const matchLevel = selectedLevel === 'all' || item.managementLevel === selectedLevel;

        return matchTab && matchRole && matchLevel;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderMenu
                title="Quản lý thành viên"
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddMember')}
                    >
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                }
            />

            {/* Tabs */}
            <HeadingMenu selectedTab={selectedTab} onTabSelect={setSelectedTab} tabs={tabs} />

            {/* Filters */}
            <View style={styles.filterContainer}>
                <View style={styles.filterWrapper}>
                    <DropDownButton
                        placeholder="Vai trò"
                        data={roleOptions}
                        style={styles.dropdown}
                        onSelect={item => setSelectedRole(item.id.toString())}
                    />
                </View>
                <View style={styles.filterWrapper}>
                    <DropDownButton
                        placeholder="Cấp quản lý"
                        data={levelOptions}
                        style={styles.dropdown}
                        onSelect={item => setSelectedLevel(item.id.toString())}
                    />
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {filteredMembers.length > 0 ? (
                    <View style={styles.listContainer}>
                        {filteredMembers.map(member => (
                            <MemberItem
                                key={member.id}
                                name={member.name}
                                role={member.role}
                                managementLevel={member.managementLevel}
                                status={member.status}
                                onPressOption={() => navigation.navigate('EditMember', { member })}
                                onDelete={() => {
                                    setSelectedMemberId(member.id);
                                    setDeleteModalVisible(true);
                                }}
                                onSuspend={() => {
                                    setSelectedMemberId(member.id);
                                    setSuspendModalVisible(true);
                                }}
                                onActivate={() => {
                                    setSelectedMemberId(member.id);
                                    setActivateModalVisible(true);
                                }}
                                onResendInvite={() => {
                                    setSelectedMemberId(member.id);
                                    setResendModalVisible(true);
                                }}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.cardContainer}>
                        <EmptyStateCard
                            message="Chưa có thành viên nào"
                            buttonTitle="Thêm thành viên"
                            onPress={() => navigation.navigate('AddMember')}
                        />
                    </View>
                )}
            </View>

            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={() => {
                    if (selectedMemberId) {
                        deleteMember(selectedMemberId);
                        setDeleteModalVisible(false);
                    }
                }}
                onCancel={() => setDeleteModalVisible(false)}
                title="Xoá thành viên"
                message="Bạn có chắc chắn muốn xoá thành viên này?"
                successMessage="Đã xoá thành viên thành công"
            />

            <ConfirmationDeleteModal
                visible={suspendModalVisible}
                onConfirm={() => {
                    if (selectedMemberId) {
                        updateMember(selectedMemberId, { status: 'paused' });
                        setSuspendModalVisible(false);
                    }
                }}
                onCancel={() => setSuspendModalVisible(false)}
                title="Tạm ngưng tài khoản"
                message="Bạn có chắc chắn muốn tạm ngưng tài khoản này?"
                confirmText="Đồng ý"
                cancelText="Huỷ"
                successMessage="Đã tạm ngưng tài khoản"
            />

            <ResendComfirmCard
                visible={resendModalVisible}
                onClose={() => setResendModalVisible(false)}
                onConfirm={() => {
                    setResendModalVisible(false);
                    Toast.show({ type: 'success', text1: 'Đã gửi lại lời mời' });
                }}
            />

            <ResendComfirmCard
                visible={activateModalVisible}
                onClose={() => setActivateModalVisible(false)}
                onConfirm={() => {
                    if (selectedMemberId) {
                        updateMember(selectedMemberId, { status: 'active' });
                        setActivateModalVisible(false);
                        Toast.show({ type: 'success', text1: 'Đã kích hoạt lại tài khoản' });
                    }
                }}
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
    toastContainer: {
        position: 'absolute',
        top: 60, // Adjust based on header height
        left: spacing.md,
        right: spacing.md,
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 100, // Ensure it's above other content
    },
    toastText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
        marginTop: 1,
        gap: spacing.md,
    },
    filterWrapper: {
        flex: 1,
    },
    dropdown: {
        // DropDownButton internal style usually handles width well,
        // but flex:1 in wrapper ensures they split space
    },
    content: {
        flex: 1,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        backgroundColor: colors.backgroundPrimary,
    },
    listContainer: {
        gap: spacing.sm,
        backgroundColor: 'transparent',
    },
    cardContainer: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
});
