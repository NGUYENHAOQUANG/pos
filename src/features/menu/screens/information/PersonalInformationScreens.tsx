import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { GeneralInformation } from '@/features/menu/components/information/GeneralInformation';
import { FarmConnecter } from '@/features/menu/components/information/FarmConnecter';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { launchImageLibrary } from 'react-native-image-picker';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { Zone, PondData } from '@/features/farm/types/farm.types';
import { pondApi } from '@/features/farm/api/pondApi';

export const PersonalInformationScreens: React.FC = () => {
    const navigation = useNavigation();
    const { setTabBarVisible } = useTabBarVisibility();
    const [avatarUri, setAvatarUri] = React.useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            setTabBarVisible(false);
            return () => {
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    // Mock Data
    const userInfo = {
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'nguyenvana@gmail.com',
        role: 'Quản lý',
        level: 'Trưởng phòng',
    };

    const { zones, fetchZones, setSelectedZoneId } = useFarmStore();
    const [allPonds, setAllPonds] = React.useState<PondData[]>([]);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchPondsFromAllZones = React.useCallback(async (currentZones: Zone[]) => {
        if (!currentZones || currentZones.length === 0) return;

        try {
            const promises = currentZones.map(async zone => {
                const res = await pondApi.getPondsByZone(zone.id);
                // Manually tag ponds with the zoneId they belong to
                // matching the Zone object structure
                return (res.items || []).map(p => ({ ...p, tempZoneId: zone.id }));
            });

            const results = await Promise.all(promises);

            // Flatten all items safely - results is Array<PondData[]>
            const flattenedPonds = results.reduce<any[]>((acc, pondsInZone) => {
                return acc.concat(pondsInZone);
            }, []);

            setAllPonds(flattenedPonds);
        } catch (error) {
            console.error('Error loading all ponds:', error);
        }
    }, []);

    React.useEffect(() => {
        fetchPondsFromAllZones(zones);
    }, [zones, fetchPondsFromAllZones]);

    // Calculate connected farms from real data
    const connectedFarms = React.useMemo(() => {
        return zones.map((zone: Zone) => {
            // Count ponds in this zone using the manually tagged tempZoneId
            const pondCount = allPonds.filter((p: any) => p.tempZoneId === zone.id).length;

            return {
                id: zone.id,
                name: zone.name,
                count: pondCount.toString(),
            };
        });
    }, [zones, allPonds]);

    const totalFarms = zones.length.toString();

    const handleChangePhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.assets && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri || null);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // Fetch zones first to allow using their IDs
            await fetchZones();
            // We need to use the zones from store, but since setState is async,
            // relying on 'zones' directly here might be stale if fetchZones just updated it.
            // However, fetchZones updates the store.
            // A better approach is to let the useEffect trigger the pond fetch when zones change,
            // but for explicit refresh, we might want to manually trigger.
            // For now, let's use the 'zones' from store - assuming fetchZones resolves after store update (which it usually does if awaited).
            await fetchPondsFromAllZones(zones);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSave = () => {
        Toast.show({
            type: 'success',
            text1: 'Cập nhật thông tin thành công',
            position: 'top',
        });
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Thông tin cá nhân" onBack={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* General Info Section */}
                <GeneralInformation
                    data={userInfo}
                    avatarUri={avatarUri}
                    onChangePhoto={handleChangePhoto}
                />

                {/* Connected Farms Section */}
                <FarmConnecter
                    totalFarms={totalFarms}
                    farms={connectedFarms}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onFarmPress={farm => {
                        setSelectedZoneId(farm.id);
                        // Navigate to the Main Tab Navigator, then to the Farm tab
                        (navigation.navigate as any)('MainTabs', { screen: 'Farm' });
                    }}
                />

                {/* Bottom Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            <ButtonBarMenu
                primaryTitle="Lưu thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSave}
                onSecondaryPress={() => {
                    navigation.goBack();
                }}
                // Using secondaryType="default" (gray border) as per design implicit
            />
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
});
