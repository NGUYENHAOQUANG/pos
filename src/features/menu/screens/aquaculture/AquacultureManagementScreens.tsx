import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useFarm } from '@/features/farm/store/farmStore';
import { SeasonListSkeleton } from '@/features/menu/components/aquaculture/SeasonListSkeleton';

// Components
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { HeadingMenu } from '@/features/menu/components/HeadingMenu';
import { EmptyStateCard } from '@/features/menu/components/EmptyStateCard';
import { DropDownButton } from '@/features/menu/components/aquaculture/DropDownButton';
import { AquacultureItem } from '@/features/menu/components/aquaculture/AquacultureItem';

export const AquacultureManagementScreens: React.FC = () => {
    const navigation = useNavigation<any>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { seasons, fetchSeasons, zones, fetchZones, isLoadingSeasons, isLoadingZones } =
        useFarm(); // Use useFarm
    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);
    // Only show "First Load" skeleton if we have NO data in the store
    const [isFirstLoad, setIsFirstLoad] = useState(seasons.length === 0);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // User wants skeleton on refresh
        // We set isFirstLoad to true to force skeleton display
        setIsFirstLoad(true);
        try {
            await fetchZones();
            if (zones.length > 0) {
                await fetchSeasons(zones);
            }
        } finally {
            setRefreshing(false);
            setIsFirstLoad(false);
        }
    }, [fetchSeasons, fetchZones, zones]);

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

    // Fetch data on mount
    useEffect(() => {
        // We only fetch zones here. Seasons will be fetched via the dependent effect below.
        fetchZones();
    }, [fetchZones]);

    // Fetch seasons when zones change and are valid
    useEffect(() => {
        console.log('[AquaScreen] Zones updated:', zones);
        const loadSeasons = async () => {
            if (zones && zones.length > 0) {
                console.log('[AquaScreen] Found zones, fetching seasons...');
                try {
                    await fetchSeasons(zones);
                } finally {
                    setIsFirstLoad(false);
                }
            } else {
                console.log('[AquaScreen] No zones available to fetch seasons.');
                // If zones are empty, we are done loading (unless still fetching zones?)
                // But fetchZones updates 'zones' and 'isLoadingZones' together possibly.
                // We will check !isLoadingZones just to be safe, or just turn off first load.
                setIsFirstLoad(false);
            }
        };
        // If we invoke this, we should make sure we are not preempting a fetch?
        // But this effect reacts to 'zones' change.
        loadSeasons();
    }, [zones, fetchSeasons]);

    // Safety timeout for first load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFirstLoad(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // Prepare zone options
    const zoneOptions = React.useMemo(() => {
        const options = [{ id: 'all', label: 'Tất cả trại' }];
        const mappedZones = zones.map(z => ({
            id: z.id.toString(),
            label: z.name,
        }));
        return [...options, ...mappedZones];
    }, [zones]);

    const activeData = React.useMemo(() => {
        let filtered = seasons;

        // Filter by zone
        if (selectedZoneId !== 'all') {
            // Filter by zoneId which is stored during fetch
            filtered = filtered.filter(s => s.zoneId?.toString() === selectedZoneId);
        }

        // Filter by status tab
        if (selectedTab === 'active') {
            filtered = filtered.filter(i => i.status === 'Đang hoạt động');
        } else if (selectedTab === 'ended') {
            filtered = filtered.filter(i => i.status === 'Đã kết thúc');
        }

        return filtered;
    }, [seasons, selectedTab, selectedZoneId]);

    const counts = React.useMemo(
        () => ({
            all: seasons.length,
            active: seasons.filter(i => i.status === 'Đang hoạt động').length,
            ended: seasons.filter(i => i.status === 'Đã kết thúc').length,
        }),
        [seasons]
    );

    return (
        <View style={styles.container}>
            {/* Header with Add Button */}
            <HeaderMenu
                title="Quản lý vụ nuôi"
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddAquaculture')}
                    >
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                }
            />

            {/* Tabs */}
            <HeadingMenu selectedTab={selectedTab} onTabSelect={setSelectedTab} counts={counts} />

            {/* Dropdown Filter Section (White Background) */}
            <View style={styles.filterSection}>
                <DropDownButton
                    data={zoneOptions}
                    value={zoneOptions.find(f => f.id === selectedZoneId) || zoneOptions[0]}
                    onSelect={item => setSelectedZoneId(item.id.toString())}
                    height={40}
                    borderRadius={6}
                />
            </View>

            <View style={styles.content}>
                {isFirstLoad || (seasons.length === 0 && (isLoadingZones || isLoadingSeasons)) ? (
                    <SeasonListSkeleton />
                ) : seasons.length === 0 ? (
                    /* Empty State - Wrapped in ScrollView for Refresh */
                    <ScrollView
                        contentContainerStyle={styles.emptyScrollContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        <View style={styles.cardContainer}>
                            <EmptyStateCard
                                message="Chưa có vụ nuôi nào"
                                buttonTitle="Tạo vụ nuôi"
                                onPress={() => navigation.navigate('AddAquaculture')}
                            />
                        </View>
                    </ScrollView>
                ) : (
                    <FlatList
                        data={activeData}
                        keyExtractor={item => item.id.toString()}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        renderItem={({ item }) => (
                            <AquacultureItem
                                item={item}
                                onEdit={editItem =>
                                    navigation.navigate('EditAquaculture', {
                                        aquaculture: editItem,
                                    })
                                }
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
        // padding: spacing.md,
        backgroundColor: colors.backgroundPrimary,
    },
    filterSection: {
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        zIndex: 100,
    },
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        margin: spacing.md,
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
    listContent: {
        paddingBottom: spacing.xl,
    },
    emptyScrollContent: {
        flexGrow: 1,
    },
});
