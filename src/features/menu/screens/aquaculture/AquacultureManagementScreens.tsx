import React, { useState, useCallback } from 'react';
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

import { SeasonListSkeleton } from '@/features/menu/components/aquaculture/SeasonListSkeleton';

import { useNetInfo } from '@react-native-community/netinfo';
import { useSeasons } from '@/features/farm/hooks/useSeasons';

// Components
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { HeadingMenu } from '@/features/menu/components/HeadingMenu';
import { EmptyStateCard } from '@/features/menu/components/EmptyStateCard';
import { DropDownButton } from '@/features/menu/components/aquaculture/DropDownButton';
import { AquacultureItem } from '@/features/menu/components/aquaculture/AquacultureItem';

export const AquacultureManagementScreens: React.FC = () => {
    const navigation = useNavigation<any>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { isConnected } = useNetInfo();

    // Use new React Query hook
    const { seasons, zones, isLoading, isRefetching, refresh } = useSeasons();

    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedZoneId, setSelectedZoneId] = useState<string>('all');

    const onRefresh = useCallback(() => {
        refresh();
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
    const zoneOptions = React.useMemo(() => {
        const options = [{ id: 'all', label: 'Tất cả trại' }];
        if (!zones) return options;

        const mappedZones = zones.map(z => ({
            id: z.id.toString(),
            label: z.name,
        }));
        return [...options, ...mappedZones];
    }, [zones]);

    const activeData = React.useMemo(() => {
        let filtered = seasons || [];

        // Filter by zone
        if (selectedZoneId !== 'all') {
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
            all: seasons?.length || 0,
            active: seasons?.filter(i => i.status === 'Đang hoạt động').length || 0,
            ended: seasons?.filter(i => i.status === 'Đã kết thúc').length || 0,
        }),
        [seasons]
    );

    // Network-aware skeleton logic
    const showSkeleton = isLoading || (!!isConnected && isRefetching);

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
                {showSkeleton ? (
                    <SeasonListSkeleton />
                ) : !seasons || seasons.length === 0 ? (
                    /* Empty State - Wrapped in ScrollView for Refresh */
                    <ScrollView
                        contentContainerStyle={styles.emptyScrollContent}
                        refreshControl={
                            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
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
                            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
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
