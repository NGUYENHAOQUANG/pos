import React from 'react';
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

export const MemberManagementScreens: React.FC = () => {
    const theme = useAppTheme();

    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { setTabBarVisible } = useTabBarVisibility();

    const {
        data: memberData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isRefetching,
        refetch,
    } = useMembers();

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
        (id: string, status: 'active' | 'paused') => {
            updateMemberStatus({ id, status });
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
                    <OnboardingStep step="ACCOUNT_MEMBER_ADD" onNext={() => navigation.goBack()}>
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
            />
        </View>
    );
};
