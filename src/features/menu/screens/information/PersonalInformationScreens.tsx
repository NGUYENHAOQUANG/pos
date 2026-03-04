import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
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
                    onChangePhoto={() => {}}
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
                {/* Bottom Spacer before fixed bar */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Sticky Bottom Action Bar */}
            <View style={styles.bottomActionBar}>
                <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveText}>Lưu thông tin</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        padding: 16,
        gap: 24,
    },
    bottomSpacer: {
        height: 100, // Space for the bottom bar
    },
    bottomActionBar: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.gray[300],
        backgroundColor: colors.white,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.gray[700],
    },
    saveButton: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        backgroundColor: colors.blue[600],
    },
    saveText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.white,
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
