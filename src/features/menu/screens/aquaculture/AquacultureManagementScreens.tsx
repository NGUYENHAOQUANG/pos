import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ScrollView,
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
import { HeadingMenu } from '@/features/menu/components/HeadingMenu';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { DropDownButton } from '@/features/menu/components/aquaculture/DropDownButton';
import { AquacultureItem } from '@/features/menu/components/aquaculture/AquacultureItem';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const AquacultureManagementScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { setTabBarVisible } = useTabBarVisibility();

    // Use new React Query hook
    const { seasons, zones, isLoading, refresh } = useSeasons();

    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
    const [isPulling, setIsPulling] = useState(false);

    const onRefresh = useCallback(async () => {
        setIsPulling(true);
        await refresh();
        setIsPulling(false);
    }, [refresh]);

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

    // Prepare zone options
    const zoneOptions = useMemo(() => {
        const options = [{ id: 'all', label: 'Tất cả trại' }];
        if (!zones) return options;

        const mappedZones = zones.map(z => ({
            id: z.id.toString(),
            label: z.name,
        }));
        return [...options, ...mappedZones];
    }, [zones]);

    const activeData = useMemo(() => {
        let filtered = seasons || [];

        // Filter by zone
        if (selectedZoneId !== 'all') {
            filtered = filtered.filter(s => s.zoneId?.toString() === selectedZoneId);
        }

        // Filter by status tab
        if (selectedTab === 'active') {
            filtered = filtered.filter(i => i.status === SeasonStatus.Active);
        } else if (selectedTab === 'preparing') {
            filtered = filtered.filter(i => i.status === SeasonStatus.Preparation);
        } else if (selectedTab === 'ended') {
            filtered = filtered.filter(i => i.status === SeasonStatus.Closed);
        }

        // Sort by NO descending (newest created first)
        return [...filtered].sort((a, b) => {
            const noA = a.no || 0;
            const noB = b.no || 0;
            return noB - noA;
        });
    }, [seasons, selectedTab, selectedZoneId]);

    const counts = useMemo(
        () => ({
            all: seasons?.length || 0,
            preparing: seasons?.filter(i => i.status === SeasonStatus.Preparation).length || 0,
            active: seasons?.filter(i => i.status === SeasonStatus.Active).length || 0,
            ended: seasons?.filter(i => i.status === SeasonStatus.Closed).length || 0,
        }),
        [seasons]
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
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                }
            />

            {/* Tabs */}
            <HeadingMenu selectedTab={selectedTab} onTabSelect={setSelectedTab} tabs={tabs} />

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
                            <RefreshControl refreshing={isPulling} onRefresh={onRefresh} />
                        }
                    >
                        <View style={styles.cardContainer}>
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
                            <RefreshControl refreshing={isPulling} onRefresh={onRefresh} />
                        }
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.cardContainer}>
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
    content: {
        flex: 1,
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
