import React, { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import {
    ButtonMetaerial,
    MaterialMenuOverlay,
} from '@/features/material/components/ButtonMaterial';
import { HeadingMeterial, TabType } from '@/features/material/components/HeadingMaterial';
import { SearchBarMeterial } from '@/features/material/components/SearchBarMaterial';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { ImportReceiptList } from '@/features/material/components/warehouse/ImportReceiptList';
import { ExportWarehouseListScreen } from '@/features/material/screens/warehouse/ExportWarehouseListScreen';
import { MaterialListScreen } from '@/features/material/screens/material/MaterialListScreen';
import { InventoryScreen } from '@/features/material/screens/inventory/InventoryScreen';
import { IMaterial } from '@/features/material/types/material.types';
import {
    useExportWarehouse,
    useInventoryTickets,
    useImportReceipts,
} from '@/features/material/hooks';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useMaterialStore } from '@/features/material/store';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useWarehouseItems } from '@/features/material/hooks/useWarehouseItems';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

export const MeterialScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute();
    const { setTabBarVisible } = useTabBarVisibility();

    const [selectedTab, setSelectedTab] = useState<TabType>('list');

    // Menu state management
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Auto-close menu when navigating away
    useFocusEffect(
        useCallback(() => {
            return () => {
                setMenuOpen(false);
            };
        }, [])
    );

    // React Query hooks for materials
    const searchText = useMaterialStore(state => state.searchText);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const setSearchText = useMaterialStore(state => state.setSearchText);
    const setFilterType = useMaterialStore(state => state.setFilterType);
    const setFilterMaterialName = useMaterialStore(state => state.setFilterMaterialName);

    // Get selected zone from farm store
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const materialParams = useMemo(() => {
        const params: {
            Page: number;
            PageSize: number;
            search?: string;
            Search?: string;
        } = {
            Page: DEFAULT_PAGE,
            PageSize: DEFAULT_PAGE_SIZE,
        };

        // Add Search param if searchText is set
        if (searchText && searchText.trim()) {
            params.Search = searchText.trim();
        }

        return params;
    }, [searchText]);

    // Fetch warehouses for the selected zone
    const { data: warehouses } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const warehouseId = warehouses?.[0]?.id;

    // Fetch warehouse items (only for stock quantity)
    // We don't filter warehouse items by search text here to ensure we have stock for all items if needed,
    // or we can rely on the fact that both lists are filtered if we pass params.
    // However, matching might be safer if we fetch all warehouse items or just rely on the API to filter both similarly.
    // For now, let's pass the same params to both.
    const {
        data: warehouseItemsData,
        isLoading: isLoadingWarehouseItems,
        refetch: refetchWarehouseItems,
        isRefetching: isRefetchingWarehouseItems,
    } = useWarehouseItems(warehouseId, materialParams, { enabled: !!warehouseId });

    // Map warehouse items to IMaterial
    const materials: IMaterial[] = useMemo(() => {
        if (!warehouseItemsData?.items) return [];
        return warehouseItemsData.items.map(item => ({
            id: item.materialId,
            name: item.materialName || '',
            group: MaterialGroupType.FARMING, // Default group
            unit: item.unitId,
            unitName: item.unitName,
            remaining: item.quantity,
            isActive: true,
            // Details will be fetched in MaterialList component
            manufacturer: undefined,
            type: undefined,
            usage: undefined,
        }));
    }, [warehouseItemsData]);

    const { isConnected } = useNetInfo();

    const showSkeleton = isLoadingWarehouseItems || (!!isConnected && isRefetchingWarehouseItems);

    const warehouseParams = useMemo(
        () => ({
            ReceiptCode: searchText || undefined,
        }),
        [searchText]
    );

    const exportWarehouseParams = useMemo(
        () => ({
            Search: searchText,
            MaterialName: filterMaterialName || undefined,
            Page: DEFAULT_PAGE,
            PageSize: DEFAULT_PAGE_SIZE,
        }),
        [searchText, filterMaterialName]
    );

    const inventoryParams = useMemo(
        () => ({
            Search: searchText,
        }),
        [searchText]
    );

    const {
        data: importReceiptsData,
        refetch: refetchImportReceipts,
        isRefetching: isRefetchingImportReceipts,
        isLoading: isLoadingImportReceipts,
    } = useImportReceipts(warehouseParams);
    const {
        data: exportWarehouseList,
        refetch: refetchExportWarehouse,
        isRefetching: isRefetchingExportWarehouse,
        isLoading: isLoadingExportWarehouse,
    } = useExportWarehouse(exportWarehouseParams);
    const {
        data: inventoryList = [],
        refetch: refetchInventory,
        isLoading: isLoadingInventory,
        isRefetching: isRefetchingInventory,
    } = useInventoryTickets(inventoryParams);

    const handleShowMenu = useCallback(
        (position: { x: number; y: number; width: number; height: number }) => {
            setMenuPosition(position);
            setMenuOpen(true);
        },
        []
    );

    const handleCloseMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    // Handle tab navigation from other screens
    React.useEffect(() => {
        const params = route.params as { selectedTab?: TabType } | undefined;
        if (params?.selectedTab) {
            setSelectedTab(params.selectedTab);
            navigation.setParams({ selectedTab: undefined } as any);
        }
    }, [route.params, navigation]);

    useLayoutEffect(() => {
        // Always show tab bar on list screen
        setTabBarVisible(true);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const handleCreateImport = useCallback(() => {
        navigation.navigate('AddWarehouse', {
            availableMaterials: materials,
        });
    }, [navigation, materials]);
    const handleCreateExport = useCallback(() => {
        navigation.navigate('AddExportWarehouse', {
            availableMaterials: materials,
        });
    }, [navigation, materials]);

    const handleCreateInventory = useCallback(() => {
        navigation.navigate('AddInventory', {});
    }, [navigation]);

    const handleCreateMaterial = useCallback(() => {
        navigation.navigate('AddMaterial', {});
    }, [navigation]);

    const handleEditMaterial = useCallback(
        (item: IMaterial) => {
            navigation.navigate('EditMaterial', {
                material: item,
            });
        },
        [navigation]
    );

    const handleAddMaterial = useCallback(() => {
        handleCreateMaterial();
    }, [handleCreateMaterial]);

    const handleSearch = useCallback(
        (text: string) => {
            setSearchText(text);
        },
        [setSearchText]
    );

    const handleFilterType = useCallback(
        (type: string) => {
            setFilterType(type);
        },
        [setFilterType]
    );

    const handleFilterPress = useCallback(() => {
        // Filter pressed handler
    }, []);

    const handleTabSelect = useCallback(
        (tab: TabType) => {
            setSelectedTab(tab);
            if (tab !== 'history' && tab !== 'export') {
                setFilterMaterialName(null);
            } else if (filterMaterialName) {
                setFilterMaterialName(null);
            }
        },
        [filterMaterialName, setFilterMaterialName]
    );

    const handleHistoryPress = useCallback(
        (item: IMaterial) => {
            setFilterMaterialName(item.name);
            setSelectedTab('history');
        },
        [setFilterMaterialName]
    );

    const mappedExportReceipts = useMemo(() => {
        const items = exportWarehouseList?.items || [];
        return items.map((item: any) => ({
            id: item.id,
            date: item.createdAt,
            farm: item.pondName || item.warehouseName || item.farm || '---',
            materials: item.materials || [],
            totalAmount: item.totalAmount || 0,
            totalItems: item.totalItems || 0,
            status: item.status,
        }));
    }, [exportWarehouseList]);
    const handleAdjustmentPress = useCallback(
        (item: IMaterial) => {
            navigation.navigate('AddInventory', {
                initialMaterialName: item.name,
            });
        },
        [navigation]
    );

    const handleRefresh = useCallback(() => {
        refetchWarehouseItems();
        refetchImportReceipts();
        refetchExportWarehouse();
        refetchInventory();
    }, [refetchWarehouseItems, refetchImportReceipts, refetchExportWarehouse, refetchInventory]);

    return (
        <View style={styles.container}>
            <View style={{ zIndex: 1000, elevation: 10 }}>
                <HeaderMeterial
                    showBackButton={false}
                    rightComponent={
                        <ButtonMetaerial onShowMenu={handleShowMenu} isOpen={menuOpen} />
                    }
                />
            </View>
            <HeadingMeterial selectedTab={selectedTab} onTabSelect={handleTabSelect} />
            <SearchBarMeterial
                onSearch={handleSearch}
                onFilterPress={handleFilterPress}
                onGroupChange={handleFilterType}
                selectedTab={selectedTab}
            />

            <View style={styles.content}>
                {selectedTab === 'list' && (
                    <MaterialListScreen
                        materials={materials}
                        onEdit={handleEditMaterial}
                        onHistoryPress={handleHistoryPress}
                        onAdjustmentPress={handleAdjustmentPress}
                        isLoading={showSkeleton}
                        refreshing={!!isRefetchingWarehouseItems}
                        onRefresh={handleRefresh}
                        onPressCreate={handleAddMaterial}
                    />
                )}
                {selectedTab === 'history' && (
                    <ImportReceiptList
                        data={importReceiptsData}
                        isLoading={isLoadingImportReceipts}
                        refreshing={!!isRefetchingImportReceipts}
                        onRefresh={handleRefresh}
                        onPressCreate={handleCreateImport}
                    />
                )}
                {selectedTab === 'export' &&
                    (isLoadingExportWarehouse ? (
                        <ExportWarehouseListScreen receipts={[]} isLoading={true} />
                    ) : mappedExportReceipts.length > 0 ? (
                        <ExportWarehouseListScreen
                            receipts={mappedExportReceipts}
                            refreshing={!!isRefetchingExportWarehouse}
                            onRefresh={handleRefresh}
                        />
                    ) : (
                        <MaterialEmptyState tab="history" onPress={handleCreateImport} />
                    ))}
                {selectedTab === 'inventory' && (
                    <InventoryScreen
                        data={inventoryList}
                        isLoading={isLoadingInventory || isRefetchingInventory}
                        refreshing={!!isRefetchingInventory}
                        onRefresh={handleRefresh}
                        onPressCreate={handleCreateInventory}
                    />
                )}
            </View>

            <MaterialMenuOverlay
                isOpen={menuOpen}
                buttonPosition={menuPosition}
                onClose={handleCloseMenu}
                onPressCreateImport={handleCreateImport}
                onPressCreateExport={handleCreateExport}
                onPressCreateAdjustment={handleCreateInventory}
                onPressCreateMaterial={handleCreateMaterial}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
        marginTop: spacing.md,
    },
    fullWidthButton: {
        width: '100%',
    },
});
