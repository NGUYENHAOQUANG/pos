import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useUserFarmStats } from '@/features/menu/hooks/useUserFarmStats';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { colors } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { GeneralInformation } from '@/features/menu/components/information/GeneralInformation';
import { FarmConnecter } from '@/features/menu/components/information/FarmConnecter';
import { PondConnecter } from '@/features/menu/components/information/PondConnecter';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useFarmStore } from '@/features/farm/store/farmStore';

import EditOutlinedIcon from '@/assets/Icon/IconMenu/EditOutlined.svg';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';

export const PersonalInformationScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { userData, refetch } = useUserProfile();

    useFocusEffect(
        React.useCallback(() => {
            setTabBarVisible(false);
            return () => {
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    const { setSelectedZoneId } = useFarmStore();
    const { allPonds, connectedFarms, totalFarms, totalPonds, isRefreshing, refetchAll } =
        useUserFarmStats();

    // Calculate totals based on what's being displayed (Mock or Real)
    const strTotalFarms = totalFarms.toString();
    const strTotalPonds = totalPonds.toString();

    // Determine if user manages farms or ponds based on level text
    const isFarmManager = userData.level?.toLowerCase().includes('trại');
    const isPondManager = userData.level?.toLowerCase().includes('ao');
    // Default to farm manager if ambiguous, or check exact strings if preferred
    const showFarms = isFarmManager || (!isPondManager && !isFarmManager);

    const handleRefresh = async () => {
        await refetch();
        await refetchAll();
    };

    const handleEditPress = () => {
        navigation.navigate('EditPersonalInformationScreen' as never);
    };

    const renderRightAction = (
        <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
            <EditOutlinedIcon width={20} height={20} color={colors.text} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <HeaderMenu
                title="Thông tin cá nhân"
                onBack={() => navigation.goBack()}
                rightAction={renderRightAction}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
            >
                {/* General Info Section */}
                <GeneralInformation
                    data={{
                        name: userData.name,
                        phone: userData.phone,
                        email: userData.email,
                        role: userData.role,
                        level: userData.level,
                        address: userData.address || '',
                    }}
                    avatarUri={userData.avatarUri}
                    // No onChangePhoto passed, so it will be read-only
                />

                {/* Connected Section */}
                {showFarms ? (
                    <FarmConnecter
                        totalFarms={strTotalFarms}
                        farms={connectedFarms}
                        onFarmPress={farm => {
                            setSelectedZoneId(farm.id);
                            // Navigate to the Main Tab Navigator, then to the Farm tab
                            navigation.navigate('MainTabs', { screen: 'Farm' });
                        }}
                    />
                ) : (
                    <PondConnecter
                        totalPonds={strTotalPonds}
                        ponds={allPonds}
                        onPondPress={() => {
                            // Optional: Navigate to detail of pond if needed,
                            // for now just stay or go to Farm tab
                            navigation.navigate('MainTabs', { screen: 'Farm' });
                        }}
                    />
                )}

                {/* Bottom Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    bottomSpacer: {
        height: 20,
    },
    editButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderColor: colors.gray[300],
        borderWidth: 1,
        borderRadius: 8,
    },
});
