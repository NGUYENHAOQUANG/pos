import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '@/styles/themeContext';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { MemberManagementContent } from '@/features/menu/screens/member-list/MemberManagementContent';
import {
    useMembers,
    useDeleteMember,
    useUpdateMemberStatus,
} from '@/features/menu/hooks/useMember';
import { IUserAccount } from '@/features/menu/types/member.types';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';
import PlusIcon from '@/assets/Icon/PlusBlack.svg';
import { useAuthStore } from '@/features/auth/store/authStore';

export const MemberManagementScreens: React.FC = () => {
    const theme = useAppTheme();

    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { setTabBarVisible } = useTabBarVisibility();

    const user = useAuthStore(state => state.user);
    const hasAddMemberPermission = React.useMemo(() => {
        if (!user?.roles) return false;
        const rolesArray = Array.isArray(user.roles) ? user.roles : [user.roles];
        return rolesArray.some(r => {
            const role = r.toUpperCase();
            return role === 'ADMIN' || role === 'MANAGER' || role === 'EMPLOYEE_MANAGER';
        });
    }, [user]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedZoneId, setSelectedZoneId] = useState<string>('all');

    const {
        data: memberData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isRefetching,
        refetch,
    } = useMembers({
        SearchText: searchQuery.trim() || undefined,
        ZoneId: selectedZoneId === 'all' ? undefined : selectedZoneId,
    });

    const members =
        memberData?.pages.reduce(
            (acc: IUserAccount[], page: any) => [...acc, ...(page.items || [])],
            []
        ) || [];

    const { mutate: deleteMember } = useDeleteMember();
    const { mutate: updateMemberStatus } = useUpdateMemberStatus();

    const handleAddMember = React.useCallback(() => {
        navigation.navigate('AddMember');
    }, [navigation]);

    const handleEditMember = React.useCallback(
        (member: IUserAccount) => {
            navigation.navigate('AddMember', { member });
        },
        [navigation]
    );

    const handleDeleteMember = React.useCallback(
        (id: string) => {
            deleteMember(id);
        },
        [deleteMember]
    );

    const handleUpdateMemberStatus = React.useCallback(
        (member: IUserAccount, status: 'active' | 'paused') => {
            updateMemberStatus({
                id: member.userId,
                status,
                fullName: member.fullName || '',
                roleId: member.roleId || undefined,
                zoneId: member.zoneId || undefined,
            });
        },
        [updateMemberStatus]
    );

    React.useEffect(() => {
        if (route.params?.showSuccess) {
            Toast.show(ToastMessages.Member.ADD_SUCCESS);
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

    const isRefreshing = isRefetching && !isFetchingNextPage;

    return (
        <View style={{ flex: 1, backgroundColor: theme.backgroundPrimary }}>
            {/* Header */}
            <HeaderSection
                title="Quản lý thành viên"
                onBack={() => navigation.goBack()}
                rightComponent={
                    hasAddMemberPermission ? (
                        <OnboardingStep
                            step="ACCOUNT_MEMBER_ADD"
                            onNext={() => navigation.goBack()}
                        >
                            <View collapsable={false}>
                                <TouchableOpacity
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: theme.backgroundButton,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: theme.defaultBorder,
                                    }}
                                    onPress={() => navigation.navigate('AddMember')}
                                >
                                    <PlusIcon width={20} height={20} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                        </OnboardingStep>
                    ) : undefined
                }
            />

            {/* Content */}
            <MemberManagementContent
                members={members}
                isLoading={isLoading}
                refreshing={isRefreshing}
                onRefresh={refetch}
                onLoadMore={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                onAddMember={handleAddMember}
                onEditMember={handleEditMember}
                onDeleteMember={handleDeleteMember}
                onUpdateMemberStatus={handleUpdateMemberStatus}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedZoneId={selectedZoneId}
                onZoneChange={setSelectedZoneId}
            />
        </View>
    );
};
