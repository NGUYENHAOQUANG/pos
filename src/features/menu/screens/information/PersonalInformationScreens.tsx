import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { useZones } from '@/features/farm/hooks/useZones';
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
import { Zone, PondData } from '@/features/farm/types/farm.types';
import { pondApi } from '@/features/farm/api/pondApi';
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

    // 1. Fetch Zones using React Query
    const { data: zones = [], isFetching: isFetchingZones, refetch: refetchZones } = useZones();
    const { setSelectedZoneId } = useFarmStore();

    // 2. Fetch Ponds for each Zone using useQueries
    // We map zones to query objects to fetch ponds in parallel
    const pondQueries = useQueries({
        queries: zones.map(zone => ({
            queryKey: ['ponds', 'byZone', zone.id], // Use a consistent key pattern
            queryFn: async () => {
                const res = await pondApi.getPondsByZone(zone.id);
                // Return ponds with their zoneId attached for easy grouping later
                return (res.items || []).map(p => ({ ...p, tempZoneId: zone.id }));
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        })),
    });

    // 3. Aggregate all ponds from the queries
    const allPonds = React.useMemo(() => {
        return pondQueries.reduce((acc, query) => {
            if (query.data) {
                return acc.concat(query.data);
            }
            return acc;
        }, [] as PondData[]);
    }, [pondQueries]);

    // 4. Calculate connected farms (zones with pond counts)
    const connectedFarms = React.useMemo(() => {
        if (zones.length > 0) {
            return zones.map((zone: Zone) => {
                const pondCount = allPonds.filter((p: any) => p.tempZoneId === zone.id).length;
                return {
                    id: zone.id,
                    name: zone.name,
                    count: pondCount.toString(),
                };
            });
        }
        return [];
    }, [zones, allPonds]);

    const isRefreshing = isFetchingZones || pondQueries.some(q => q.isFetching);

    // Calculate totals based on what's being displayed (Mock or Real)
    const totalFarms = connectedFarms.length.toString();
    const totalPonds = allPonds.length.toString();

    // Determine if user manages farms or ponds based on level text
    const isFarmManager = userData.level?.toLowerCase().includes('trại');
    const isPondManager = userData.level?.toLowerCase().includes('ao');
    // Default to farm manager if ambiguous, or check exact strings if preferred
    const showFarms = isFarmManager || (!isPondManager && !isFarmManager);

    const handleRefresh = async () => {
        try {
            await Promise.all([refetch(), refetchZones(), ...pondQueries.map(q => q.refetch())]);
        } catch (error) {
            console.error('Refresh error:', error);
        }
    };

    const handleEditPress = () => {
        (navigation.navigate as any)('EditPersonalInformationScreens');
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
                        totalFarms={totalFarms}
                        farms={connectedFarms}
                        onFarmPress={farm => {
                            setSelectedZoneId(farm.id);
                            // Navigate to the Main Tab Navigator, then to the Farm tab
                            navigation.navigate('MainTabs', { screen: 'Farm' });
                        }}
                    />
                ) : (
                    <PondConnecter
                        totalPonds={totalPonds}
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
