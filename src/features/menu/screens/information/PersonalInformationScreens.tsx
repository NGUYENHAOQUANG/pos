import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
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

    // Extend PondData to include tempZoneId for local processing
    interface PondWithZone extends PondData {
        tempZoneId?: string;
    }

    const { zones, fetchZones, setSelectedZoneId } = useFarmStore();
    const [allPonds, setAllPonds] = React.useState<PondWithZone[]>([]);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchPondsFromAllZones = React.useCallback(async (currentZones: Zone[]) => {
        if (currentZones && currentZones.length > 0) {
            try {
                const promises = currentZones.map(async zone => {
                    try {
                        const res = await pondApi.getPondsByZone(zone.id);
                        return (res.items || []).map(p => ({ ...p, tempZoneId: zone.id }));
                    } catch (_) {
                        return [];
                    }
                });

                const results = await Promise.all(promises);
                const flattenedPonds = results.reduce<PondWithZone[]>((acc, pondsInZone) => {
                    return acc.concat(pondsInZone);
                }, []);

                setAllPonds(flattenedPonds);
            } catch (_) {
                // Should rarely reach here if individual promises catch errors
                setAllPonds([]);
            }
        } else {
            setAllPonds([]);
        }
    }, []);

    React.useEffect(() => {
        // Fetch data initially
        if (zones.length === 0) fetchZones();
    }, [zones, fetchZones]);

    React.useEffect(() => {
        fetchPondsFromAllZones(zones);
    }, [zones, fetchPondsFromAllZones]);

    // Calculate connected farms from real data
    const connectedFarms = React.useMemo(() => {
        if (zones.length > 0) {
            return zones.map((zone: Zone) => {
                const pondCount = allPonds.filter(p => p.tempZoneId === zone.id).length;
                return {
                    id: zone.id,
                    name: zone.name,
                    count: pondCount.toString(),
                };
            });
        }
        return [];
    }, [zones, allPonds]);

    // Calculate totals based on what's being displayed (Mock or Real)
    const totalFarms = connectedFarms.length.toString();
    const totalPonds = allPonds.length.toString();

    // Determine if user manages farms or ponds based on level text
    const isFarmManager = userData.level?.toLowerCase().includes('trại');
    const isPondManager = userData.level?.toLowerCase().includes('ao');
    // Default to farm manager if ambiguous, or check exact strings if preferred
    const showFarms = isFarmManager || (!isPondManager && !isFarmManager);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
            await fetchZones();
            await fetchPondsFromAllZones(zones);
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
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
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
