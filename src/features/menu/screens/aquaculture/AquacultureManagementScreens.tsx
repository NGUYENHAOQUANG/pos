import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { SeasonListSkeleton } from '@/features/menu/components/aquaculture/SeasonListSkeleton';
import { useSeasons } from '@/features/menu/hooks/useSeasons';
// Components
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { HeadingBar } from '@/shared/components/layout/HeadingBar';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { DropDownButton } from '@/features/menu/components/aquaculture/DropDownButton';
import { AquacultureItem } from '@/features/menu/components/aquaculture/AquacultureItem';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const AquacultureManagementScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { setTabBarVisible } = useTabBarVisibility();

    // Use React Query hook with infinite scroll
    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedZoneId, setSelectedZoneId] = useState<string>('');

    const {
        seasons,
        zones,
        totalCount,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        refresh,
        fetchNextPage,
    } = useSeasons(selectedZoneId);

    // Auto-select first zone when zones are loaded
    useEffect(() => {
        if (zones.length > 0 && !selectedZoneId) {
            setSelectedZoneId(String(zones[0].id));
        }
    }, [zones, selectedZoneId]);

    const onRefresh = useCallback(async () => {
        await refresh();
    }, [refresh]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

    // Prepare zone options (no 'all' option)
    const zoneOptions = useMemo(() => {
        if (!zones) return [];
        return zones.map(z => ({
            id: z.id.toString(),
            label: z.name,
        }));
    }, [zones]);

    const activeData = useMemo(() => {
        let filtered = seasons || [];

        // Filter by status tab (zone filter is handled by API via selectedZoneId)
        if (selectedTab === 'active') {
            filtered = filtered.filter((i: SeasonData) => i.status === SeasonStatus.Active);
        } else if (selectedTab === 'preparing') {
            filtered = filtered.filter((i: SeasonData) => i.status === SeasonStatus.Preparation);
        } else if (selectedTab === 'ended') {
            filtered = filtered.filter((i: SeasonData) => i.status === SeasonStatus.Closed);
        }

        // Sort by NO descending (newest created first)
        return [...filtered].sort((a: SeasonData, b: SeasonData) => {
            const noA = a.no || 0;
            const noB = b.no || 0;
            return noB - noA;
        });
    }, [seasons, selectedTab]);

    // Use totalCount from API for 'all' tab; other counts from loaded data of selected zone
    const counts = useMemo(
        () => ({
            all: totalCount,
            preparing:
                seasons?.filter((i: SeasonData) => i.status === SeasonStatus.Preparation).length ||
                0,
            active:
                seasons?.filter((i: SeasonData) => i.status === SeasonStatus.Active).length || 0,
            ended: seasons?.filter((i: SeasonData) => i.status === SeasonStatus.Closed).length || 0,
        }),
        [seasons, totalCount]
    );

    const tabs = useMemo(
        () => [
            { key: 'all', label: 'Tất cả', count: counts.all },
            { key: 'preparing', label: 'Chuẩn bị', count: counts.preparing },
            { key: 'active', label: 'Đang nuôi', count: counts.active },
            { key: 'ended', label: 'Đã kết thúc', count: counts.ended },
        ],
        [counts]
    );

    const showSkeleton = isLoading;
    const isRefreshing = isRefetching && !isFetchingNextPage;

    // Memoized callbacks for navigation
    const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
    const handleAddNavigate = useCallback(
        () => navigation.navigate('AddAquaculture'),
        [navigation]
    );

    // Memoized renderItem for FlatList
    const renderItem = useCallback(
        ({ item }: { item: SeasonData }) => (
            <AquacultureItem
                item={item}
                onEdit={editItem =>
                    navigation.navigate('EditAquaculture', {
                        aquaculture: editItem,
                    })
                }
            />
        ),
        [navigation]
    );

    // Memoized dropdown value and handler
    const selectedDropdownValue = useMemo(
        () => zoneOptions.find(f => f.id === selectedZoneId) || zoneOptions[0],
        [zoneOptions, selectedZoneId]
    );
    const handleZoneSelect = useCallback(
        (item: { id: string | number }) => setSelectedZoneId(item.id.toString()),
        []
    );

    return (
        <View style={styles.container}>
            {/* Header with Add Button */}
            <HeaderMenu
                title="Quản lý vụ nuôi"
                onBack={handleGoBack}
                rightAction={
                    <TouchableOpacity style={styles.addButton} onPress={handleAddNavigate}>
                        <Ionicons name="add" size={24} color={colors.text} />
                    </TouchableOpacity>
                }
            />

            {/* Tabs */}
            <HeadingBar tabs={tabs} selectedTab={selectedTab} onTabSelect={setSelectedTab} />

            {/* Dropdown Filter Section (White Background) */}
            <View style={styles.filterSection}>
                <DropDownButton
                    data={zoneOptions}
                    value={selectedDropdownValue}
                    onSelect={handleZoneSelect}
                    height={40}
                    borderRadius={6}
                />
            </View>

            <View style={styles.content}>
                {showSkeleton ? (
                    <SeasonListSkeleton />
                ) : !seasons || seasons.length === 0 ? (
                    /* Empty State - Wrapped in ScrollView for Refresh */
                    <ScrollView
                        contentContainerStyle={styles.emptyScrollContent}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                        }
                    >
                        <View>
                            <EmptyStateCard
                                message="Chưa có vụ nuôi nào"
                                buttonTitle="Tạo vụ nuôi"
                                onPress={handleAddNavigate}
                            />
                        </View>
                    </ScrollView>
                ) : (
                    <FlatList
                        data={activeData}
                        keyExtractor={item => item.id.toString()}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                        }
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            isFetchingNextPage ? (
                                <View style={styles.loaderFooter}>
                                    <ActivityIndicator color={colors.primary} />
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            <View>
                                <EmptyStateCard
                                    message="Chưa có vụ nuôi nào"
                                    buttonTitle="Tạo vụ nuôi"
                                    onPress={handleAddNavigate}
                                />
                            </View>
                        }
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
    headingBar: {
        backgroundColor: colors.white,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    content: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    filterSection: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        zIndex: 100,
    },
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.full,
        backgroundColor: colors.white,
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
    loaderFooter: {
        paddingVertical: spacing.md,
        alignItems: 'center' as const,
    },
    emptyScrollContent: {
        flexGrow: 1,
    },
});
