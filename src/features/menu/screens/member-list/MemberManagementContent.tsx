import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, ActivityIndicator } from 'react-native';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

import {
    DropDownButtonBasic as DropDownButton,
    DropDownItem,
} from '@/features/farm/components/DropDownButtonBasic';
import { Input } from '@/shared/components/forms/Input';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { ListFooterLoader } from '@/shared/components/ui/ListFooterLoader';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';
import { useOnboardingStore } from '@/features/walkthrough/store/useOnboardingStore';
import { MemberItem } from '@/features/menu/components/member/MemberItem';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { IUserAccount, RoleType } from '@/features/menu/types/member.types';
import { TagStatus } from '@/features/menu/components/Tag';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useZones } from '@/features/farm/hooks/useZones';

export interface MemberManagementContentProps {
    members: IUserAccount[];
    onAddMember: () => void;
    onEditMember: (member: IUserAccount) => void;
    onDeleteMember: (id: string) => void;
    onUpdateMemberStatus: (member: IUserAccount, status: 'active' | 'paused') => void;
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    selectedZoneId: string;
    onZoneChange: (zoneId: string) => void;
}

export const MemberManagementContent: React.FC<MemberManagementContentProps> = ({
    members,
    onAddMember,
    onEditMember,
    onDeleteMember,
    onUpdateMemberStatus,
    isLoading,
    refreshing,
    onRefresh,
    onLoadMore,
    isFetchingNextPage,
    hasNextPage,
    searchQuery,
    onSearchChange,
    selectedZoneId,
    onZoneChange,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [resendModalVisible, setResendModalVisible] = useState(false);
    const [activateModalVisible, setActivateModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const { data: zones } = useZones();

    const user = useAuthStore(state => state.user);
    const hasAddMemberPermission = React.useMemo(() => {
        if (!user?.roles) return false;
        const rolesArray = Array.isArray(user.roles) ? user.roles : [user.roles];
        return rolesArray.some(r => {
            const role = r.toUpperCase();
            return role === 'ADMIN' || role === 'MANAGER' || role === 'EMPLOYEE_MANAGER';
        });
    }, [user]);

    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

    // Auto-skip logic for empty states during onboarding
    const currentStep = useOnboardingStore(s => s.currentStep);
    const activeModule = useOnboardingStore(s => s.activeModule);
    const nextStepAction = useOnboardingStore(s => s.nextStep);

    useEffect(() => {
        if (activeModule === 'account' && currentStep === 8 && members.length === 0) {
            nextStepAction(); // Auto-skip step 8 (member action) if no member exists
        }
    }, [activeModule, currentStep, members.length, nextStepAction]);

    // Map Filter Options from RoleType enum
    const ROLE_LABELS: Record<string, string> = {
        [RoleType.ADMIN]: 'Quản trị viên',
        [RoleType.MANAGER]: 'Chủ trại',
        [RoleType.EMPLOYEE_MANAGER]: 'Nhân viên Kỹ thuật',
        [RoleType.EMPLOYEE_WAREHOUSE]: 'Nhân viên Thủ kho',
        [RoleType.FARMER]: 'Nông dân (Farmer)',
    };

    const roleOptions: DropDownItem[] = [
        { id: 'all', label: 'Tất cả vai trò' },
        ...Object.values(RoleType).map(role => ({
            id: role,
            label: ROLE_LABELS[role] || role,
        })),
    ];

    const zoneOptions: DropDownItem[] = [
        { id: 'all', label: 'Tất cả trại nuôi' },
        ...(zones?.map((zone: any) => ({
            id: zone.id,
            label: zone.name,
        })) || []),
    ];

    // Role filter remains FE-side (API doesn't support role param)
    // API roleCode is UPPERCASE (e.g. "FARMER", "EMPLOYEE_WAREHOUSE")
    // so we use case-insensitive startsWith to match variants
    const filteredMembers =
        selectedRole === 'all'
            ? members
            : members.filter(item => {
                  const code = (item.roleCode || '').toUpperCase();
                  const selected = selectedRole.toUpperCase();
                  return code === selected || code.startsWith(`${selected}_`);
              });

    const handleEditMember = useCallback(
        (member: IUserAccount) => {
            onEditMember(member);
        },
        [onEditMember]
    );

    const handleDeleteMemberRequest = useCallback((id: string) => {
        setSelectedMemberId(id);
        setDeleteModalVisible(true);
    }, []);

    const handleSuspendMemberRequest = useCallback((id: string) => {
        setSelectedMemberId(id);
        setSuspendModalVisible(true);
    }, []);

    const handleActivateMemberRequest = useCallback((id: string) => {
        setSelectedMemberId(id);
        setActivateModalVisible(true);
    }, []);

    const handleResendInviteRequest = useCallback((id: string) => {
        setSelectedMemberId(id);
        setResendModalVisible(true);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    const renderItem: ListRenderItem<IUserAccount> = useCallback(
        ({ item, index }) => (
            <MemberItem
                name={item.fullName || item.phoneNumber || 'Không có tên'}
                phone={item.phoneNumber || 'Không có số điện thoại'}
                roleName={item.roleName || 'Chưa phân quyền'}
                status={
                    item.isActive === false ||
                    ['deactivated', 'paused', 'inactive'].includes(item.status?.toLowerCase() || '')
                        ? 'paused'
                        : ((item.status ? item.status.toLowerCase() : 'pending') as TagStatus)
                }
                onPressOption={() => handleEditMember(item)}
                onDelete={() => handleDeleteMemberRequest(item.userId)}
                onSuspend={() => handleSuspendMemberRequest(item.userId)}
                onActivate={() => handleActivateMemberRequest(item.userId)}
                onResendInvite={() => handleResendInviteRequest(item.userId)}
                isFirstItem={index === 0}
            />
        ),
        [
            handleEditMember,
            handleDeleteMemberRequest,
            handleSuspendMemberRequest,
            handleActivateMemberRequest,
            handleResendInviteRequest,
        ]
    );

    const keyExtractor = useCallback((item: IUserAccount) => item.userId, []);

    return (
        <View style={styles.container}>
            {/* Filters */}
            <View style={styles.filterOuter}>
                <OnboardingStep step="ACCOUNT_MEMBER_FILTER">
                    <View collapsable={false} style={styles.filterInner}>
                        <View style={{ zIndex: 10, marginBottom: 8, width: '100%' }}>
                            <DropDownButton
                                placeholder="Trại nuôi"
                                data={zoneOptions}
                                value={zoneOptions.find(z => z.id.toString() === selectedZoneId)}
                                style={{ width: '100%' }}
                                onSelect={(item: DropDownItem) => onZoneChange(item.id.toString())}
                            />
                        </View>
                        <View style={styles.row}>
                            <View
                                style={[
                                    styles.searchInputWrapper,
                                    { flex: 1, marginRight: spacing.sm },
                                ]}
                            >
                                <Input
                                    icon="search-outline"
                                    placeholder="Tìm kiếm tên, SĐT"
                                    value={searchQuery}
                                    onChangeText={onSearchChange}
                                    containerStyle={styles.noMarginBottom}
                                />
                            </View>
                            <View style={[styles.filterWrapper, { flex: 0.6 }]}>
                                <DropDownButton
                                    placeholder="Vai trò"
                                    data={roleOptions}
                                    value={roleOptions.find(r => r.id.toString() === selectedRole)}
                                    style={styles.dropdown}
                                    onSelect={(item: DropDownItem) =>
                                        setSelectedRole(item.id.toString())
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </OnboardingStep>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={[styles.content, styles.centerContent]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredMembers}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    style={styles.content}
                    contentContainerStyle={[
                        styles.contentContainer,
                        styles.listContainer,
                        filteredMembers.length === 0 && styles.emptyContent,
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isFetchingNextPage ? <ListFooterLoader /> : null}
                    ListEmptyComponent={
                        <EmptyStateCard
                            message="Chưa có thành viên nào"
                            buttonTitle={hasAddMemberPermission ? 'Thêm thành viên' : undefined}
                            onPress={hasAddMemberPermission ? onAddMember : undefined}
                        />
                    }
                />
            )}

            <ConfirmationModalUI
                visible={deleteModalVisible}
                onConfirm={() => {
                    if (selectedMemberId) {
                        onDeleteMember(selectedMemberId);
                        setDeleteModalVisible(false);
                    }
                }}
                onCancel={() => setDeleteModalVisible(false)}
                title="Xoá thành viên"
                message="Bạn có chắc chắn muốn xoá thành viên này?"
                successMessage="Đã xoá thành viên thành công"
            />

            <ConfirmationModalUI
                visible={suspendModalVisible}
                onConfirm={() => {
                    if (selectedMemberId) {
                        const member = members.find(m => m.userId === selectedMemberId);
                        if (member) onUpdateMemberStatus(member, 'paused');
                        setSuspendModalVisible(false);
                    }
                }}
                onCancel={() => setSuspendModalVisible(false)}
                title="Tạm ngưng tài khoản"
                message="Bạn có chắc chắn muốn tạm ngưng tài khoản này?"
                confirmText="Đồng ý"
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
                onConfirm={() => {
                    if (selectedMemberId) {
                        const member = members.find(m => m.userId === selectedMemberId);
                        if (member) onUpdateMemberStatus(member, 'active');
                        setActivateModalVisible(false);
                    }
                }}
                onCancel={() => setActivateModalVisible(false)}
                title="Kích hoạt lại"
                message="Bạn có chắc chắn muốn kích hoạt lại tài khoản này không?"
                confirmText="Kích hoạt lại"
                cancelText="Hủy"
                successMessage="Đã kích hoạt lại tài khoản thành công"
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
        filterOuter: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            zIndex: 1,
        },
        filterInner: {
            flexDirection: 'column',
            backgroundColor: theme.backgroundPrimary,
            borderRadius: borderRadius.md,
        },
        row: {
            flexDirection: 'row',
            width: '100%',
        },
        searchInputWrapper: {
            flex: 2,
        },
        noMarginBottom: {
            marginBottom: 0,
        },
        filterWrapper: {
            flex: 1,
        },
        dropdown: {},
        content: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        contentContainer: {
            paddingTop: 8,
            paddingBottom: 43,
        },
        listContainer: {
            gap: spacing.sm,
            backgroundColor: 'transparent',
        },
        emptyContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        centerContent: {
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
