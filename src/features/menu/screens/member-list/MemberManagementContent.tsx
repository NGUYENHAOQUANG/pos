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
import { IUserAccount } from '@/features/menu/types/member.types';
import { TagStatus } from '@/features/menu/components/Tag';

export interface MemberManagementContentProps {
    members: IUserAccount[];
    onAddMember: () => void;
    onEditMember: (member: IUserAccount) => void;
    onDeleteMember: (id: string) => void;
    onUpdateMemberStatus: (id: string, status: 'active' | 'paused') => void;
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
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
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [resendModalVisible, setResendModalVisible] = useState(false);
    const [activateModalVisible, setActivateModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

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

    // Map Filter Options
    const roleOptions: DropDownItem[] = [
        { id: 'all', label: 'Tất cả vai trò' },
        { id: 'Quản lý', label: 'Quản lý' },
        { id: 'Nhân viên', label: 'Nhân viên' },
    ];

    const filteredMembers = members.filter(item => {
        const matchRole = selectedRole === 'all' || item.roleName === selectedRole;
        const searchQueryLower = searchQuery.trim().toLowerCase();
        const matchSearch =
            searchQueryLower === '' ||
            (item.fullName && item.fullName.toLowerCase().includes(searchQueryLower)) ||
            (item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchQueryLower));

        return matchRole && matchSearch;
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
                status={(item.status ? item.status.toLowerCase() : 'pending') as TagStatus}
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
                        <View style={styles.searchInputWrapper}>
                            <Input
                                icon="search-outline"
                                placeholder="Tìm kiếm tên, số điện thoại"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                containerStyle={styles.noMarginBottom}
                            />
                        </View>
                        <View style={styles.filterWrapper}>
                            <DropDownButton
                                placeholder="Vai trò"
                                data={roleOptions}
                                style={styles.dropdown}
                                onSelect={item => setSelectedRole(item.id.toString())}
                            />
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
                            buttonTitle="Thêm thành viên"
                            onPress={onAddMember}
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
                        onUpdateMemberStatus(selectedMemberId, 'paused');
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
                        onUpdateMemberStatus(selectedMemberId, 'active');
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
            flexDirection: 'row',
            gap: spacing.sm,
            backgroundColor: theme.backgroundPrimary,
            borderRadius: borderRadius.md,
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
