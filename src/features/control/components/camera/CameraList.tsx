import React, { useCallback, useState, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, ViewToken } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { Text } from '@/shared/components/typography/Text';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { CameraCard } from '@/features/control/components/camera/CameraCard';
import { CameraSkeleton } from '@/features/control/components/skeleton/CameraSkeleton';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { useCameras } from '@/features/control/hooks/useCameras';
import { CameraItem } from '@/features/control/api/cameraApi';
import { CameraFilter } from '@/features/control/components/camera/CameraFilter';
import { useAppTheme } from '@/styles/themeContext';
import { spacing } from '@/styles';

type CameraViewMode = 'grid' | 'list';

interface CameraListProps {
    onCameraPress: (camera: CameraItem) => void;
    /** Layout mode: 'grid' = 2-col preview, 'list' = 1-col full cards */
    viewMode?: CameraViewMode;
}

/**
 * Scrollable list of camera cards for the Camera tab.
 * Fetches data from API via useCameras hook.
 */
export const CameraList: React.FC<CameraListProps> = ({ onCameraPress, viewMode = 'grid' }) => {
    const theme = useAppTheme();
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { data: cameras = [], isLoading, isRefetching, refetch } = useCameras();

    // selectedCategory is now string ('all' or category.id)
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Track which category groups are currently visible in the viewport
    const [visibleGroupIds, setVisibleGroupIds] = useState<Set<string>>(new Set());

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 20, // Consider visible when 20% of group is on screen
    }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const ids = new Set(viewableItems.map(item => item.key as string));
        setVisibleGroupIds(ids);
    }).current;

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Group cameras into categories
    const groupedData = useMemo(() => {
        // Enums matching Category locationCategory
        const enumTabs = [
            { id: 'GrowOutPond', name: 'Ao Nuôi' },
            { id: 'NurseryPond', name: 'Ao Vèo' },
            { id: 'Infrastructure', name: 'Hạ Tầng' },
        ];

        let tabsToRender = enumTabs;

        if (selectedCategory !== 'all') {
            tabsToRender = tabsToRender.filter(c => c.id === selectedCategory);
        }

        const groups = tabsToRender.map(cat => {
            const catCameras = cameras.filter(cam => cam.locationCategory === cat.id);

            const uniquePonds = new Set<string>();
            catCameras.forEach(cam => {
                uniquePonds.add(cam.pondName || 'Khu vực chưa phân bổ');
            });

            return {
                id: cat.id,
                name: cat.name,
                cameras: catCameras,
                pondCount: uniquePonds.size,
            };
        });

        // Always hide groups without cameras
        const activeGroups = groups.filter(g => g.cameras.length > 0);

        // Add 'Khác' category if there are unassigned cameras and 'Tất cả' is active
        if (selectedCategory === 'all' || selectedCategory === 'other') {
            const unassigned = cameras.filter(
                c => c.locationCategory === 'None' || !c.locationCategory
            );

            if (unassigned.length > 0) {
                const uniquePonds = new Set<string>();
                unassigned.forEach(cam => {
                    uniquePonds.add(cam.pondName || 'Khu vực chưa phân bổ');
                });
                activeGroups.push({
                    id: 'other',
                    name: 'Khác',
                    cameras: unassigned,
                    pondCount: uniquePonds.size,
                });
            }
        }

        return activeGroups;
    }, [cameras, selectedCategory]);

    const renderHeader = useCallback(() => {
        return (
            <CameraFilter
                cameras={cameras}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
        );
    }, [cameras, selectedCategory]);

    const renderCategoryGroup = useCallback(
        ({ item: group }: { item: (typeof groupedData)[number] }) => {
            const isGroupVisible = visibleGroupIds.has(group.id);
            const isGridMode = viewMode === 'grid';
            // In grid mode: show max 2 cameras preview. In list mode: show all
            const camerasToShow = isGridMode ? group.cameras.slice(0, 2) : group.cameras;

            return (
                <View style={styles.groupContainer}>
                    {/* Header Group */}
                    <View style={styles.groupHeader}>
                        <View style={styles.groupHeaderTitleContainer}>
                            <Text style={[styles.groupTitle, { color: theme.text }]}>
                                {group.name}
                            </Text>
                            <Text style={[styles.groupSubtitle, { color: theme.textSecondary }]}>
                                {group.pondCount} ao - {group.cameras.length} cameras
                            </Text>
                        </View>
                        {/* Only show "Xem chi tiết" in grid mode */}
                        {isGridMode && group.cameras.length > 0 && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    navigation.navigate('CategoryCameraList', {
                                        categoryId: group.id,
                                        categoryName: group.name,
                                    });
                                }}
                            >
                                <Text style={[styles.seeMoreText, { color: theme.primary }]}>
                                    Xem chi tiết
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Camera cards container: grid = 2-col, list = 1-col */}
                    <View style={isGridMode ? styles.gridContainer : styles.listContainer}>
                        {camerasToShow.map((cam: CameraItem) => (
                            <CameraCard
                                key={cam.deviceCode}
                                camera={cam}
                                onPress={onCameraPress}
                                isGrid={isGridMode}
                                isVisible={isGroupVisible}
                            />
                        ))}
                    </View>
                </View>
            );
        },
        [visibleGroupIds, theme, navigation, onCameraPress, viewMode]
    );

    if (isLoading) {
        return <CameraSkeleton />;
    }

    return (
        <FlatList
            style={{ flex: 1 }}
            data={groupedData}
            keyExtractor={item => item.id}
            renderItem={renderCategoryGroup}
            contentContainerStyle={[
                styles.listContent,
                groupedData.length === 0 && styles.emptyContent,
            ]}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
            ListEmptyComponent={
                <EmptyStateCard
                    message={`Chưa có Camera nào được thiết lập\nVui lòng liên hệ để được thiết lập camera`}
                />
            }
            ListHeaderComponent={renderHeader}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingTop: 10,
        paddingBottom: 100,
    },
    emptyContent: {
        flexGrow: 1,
    },
    groupContainer: {
        marginBottom: 26,
        paddingHorizontal: spacing.md,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    groupHeaderTitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: 600,
    },
    groupSubtitle: {
        fontSize: 14,
        fontWeight: 400,
        paddingBottom: 1, // Visual align with title
    },
    seeMoreText: {
        fontSize: 14,
        fontWeight: '500',
        paddingBottom: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 8,
    },
    listContainer: {
        flexDirection: 'column',
        gap: 10,
    },
});
