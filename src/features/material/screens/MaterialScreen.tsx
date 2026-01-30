import React, { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { ZoneHeader } from '@/features/material/components/ZoneHeader';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
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
import { MaterialMasterListTab } from '@/features/material/screens/material/MaterialMasterListTab';
import { InventoryScreen } from '@/features/material/screens/inventory/InventoryScreen';
import { IMaterial } from '@/features/material/types/material.types';
import {
    useExportWarehouse,
    useInventoryTickets,
    useImportReceipts,
} from '@/features/material/hooks';
import { useZones } from '@/features/farm/hooks';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useMaterialStore } from '@/features/material/store';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

export const MeterialScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute();
    const { setTabBarVisible } = useTabBarVisibility();
    const selectedTab = useMaterialStore(state => state.selectedTab);
    const setSelectedTab = useMaterialStore(state => state.setSelectedTab);

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);
    const { data: zonesData = [] } = useZones();

    const dropdownData: DropDownItem[] = useMemo(() => {
        return zonesData.map((z: any) => ({
            id: z.id.toString(),
            label: z.name,
            value: z,
        }));
    }, [zonesData]);

    const selectedDropdownItem = useMemo(() => {
        if (!selectedZoneId) return dropdownData[0];
        return dropdownData.find(d => d.id === selectedZoneId.toString()) || dropdownData[0];
    }, [dropdownData, selectedZoneId]);

    const handleDropdownSelect = useCallback(
        (item: DropDownItem) => {
            setSelectedZoneId(item.id.toString());
        },
        [setSelectedZoneId]
    );

    React.useEffect(() => {
        if (!selectedZoneId && dropdownData.length > 0) {
            setSelectedZoneId(dropdownData[0].id.toString());
        }
    }, [dropdownData, selectedZoneId, setSelectedZoneId]);

    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

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
    const filterType = useMaterialStore(state => state.filterType);
    const setFilterType = useMaterialStore(state => state.setFilterType);
    const setFilterMaterialName = useMaterialStore(state => state.setFilterMaterialName);

    const materialParams = useMemo(() => {
        const params: {
            Page: number;
            PageSize: number;
            Search?: string;
            MaterialTypeId?: string;
        } = {
            Page: DEFAULT_PAGE,
            PageSize: DEFAULT_PAGE_SIZE,
            MaterialTypeId: filterType || undefined,
        };

        if (searchText && searchText.trim()) {
            params.Search = searchText.trim();
        }

        return params;
    }, [searchText, filterType]);

    const { data: warehouses } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const warehouseId = warehouses?.[0]?.id;

    const {
        data: warehouseItemsData,
        isLoading: isLoadingWarehouseItems,
        refetch: refetchWarehouseItems,
        isRefetching: isRefetchingWarehouseItems,
    } = useWarehouseItems(warehouseId, materialParams, { enabled: !!warehouseId });

    const materials: IMaterial[] = useMemo(() => {
        if (!warehouseItemsData?.items) return [];
        return warehouseItemsData.items.map(item => ({
            id: item.materialId,
            name: item.materialName || '',
            group: MaterialGroupType.FARMING,
            unit: item.unitId,
            unitName: item.unitName,
            remaining: item.quantity,
            isActive: true,
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
            WarehouseId: warehouseId || undefined,
            Page: DEFAULT_PAGE,
            PageSize: DEFAULT_PAGE_SIZE,
        }),
        [searchText, filterMaterialName, warehouseId]
    );

    const inventoryParams = useMemo(
        () => ({
            Search: searchText,
            WarehouseId: warehouseId,
        }),
        [searchText, warehouseId]
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

    React.useEffect(() => {
        const params = route.params as { selectedTab?: TabType } | undefined;
        if (params?.selectedTab) {
            setSelectedTab(params.selectedTab);
            navigation.setParams({ selectedTab: undefined } as any);
        }
    }, [route.params, navigation, setSelectedTab]);

    useLayoutEffect(() => {
        setTabBarVisible(true);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const actions = useMemo(
        () => ({
            createImport: () =>
                navigation.navigate('AddWarehouse', {
                    availableMaterials: materials,
                }),
            createExport: () =>
                navigation.navigate('AddExportWarehouse', {
                    availableMaterials: materials,
                }),
            createInventory: () => navigation.navigate('AddInventory', {}),
            createMaterial: () => navigation.navigate('AddMaterial', {}),
            editMaterial: (item: IMaterial) =>
                navigation.navigate('EditMaterial', {
                    material: item,
                }),
        }),
        [navigation, materials]
    );

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
        [filterMaterialName, setFilterMaterialName, setSelectedTab]
    );

    const handleHistoryPress = useCallback(
        (item: IMaterial) => {
            setFilterMaterialName(item.name);
            setSelectedTab('history');
        },
        [setFilterMaterialName, setSelectedTab]
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
                <ZoneHeader
                    dropdownData={dropdownData}
                    dropdownValue={selectedDropdownItem}
                    onDropdownSelect={handleDropdownSelect}
                    dropdownPlaceholder="Chọn kho"
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
                {selectedTab === 'material' && (
                    <MaterialMasterListTab
                        onPressCreate={actions.createMaterial}
                        onEdit={actions.editMaterial}
                        onHistoryPress={handleHistoryPress}
                        onAdjustmentPress={handleAdjustmentPress}
                    />
                )}
                {selectedTab === 'list' && (
                    <MaterialListScreen
                        materials={materials}
                        onEdit={actions.editMaterial}
                        onHistoryPress={handleHistoryPress}
                        onAdjustmentPress={handleAdjustmentPress}
                        isLoading={showSkeleton}
                        refreshing={!!isRefetchingWarehouseItems}
                        onRefresh={handleRefresh}
                        onPressCreate={actions.createMaterial}
                    />
                )}
                {selectedTab === 'history' && (
                    <ImportReceiptList
                        data={importReceiptsData}
                        isLoading={isLoadingImportReceipts}
                        refreshing={!!isRefetchingImportReceipts}
                        onRefresh={handleRefresh}
                        onPressCreate={actions.createImport}
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
                        <MaterialEmptyState tab="history" onPress={actions.createImport} />
                    ))}
                {selectedTab === 'inventory' && (
                    <InventoryScreen
                        data={inventoryList}
                        isLoading={isLoadingInventory || isRefetchingInventory}
                        refreshing={!!isRefetchingInventory}
                        onRefresh={handleRefresh}
                        onPressCreate={actions.createInventory}
                    />
                )}
            </View>

            <MaterialMenuOverlay
                isOpen={menuOpen}
                buttonPosition={menuPosition}
                onClose={handleCloseMenu}
                onPressCreateImport={actions.createImport}
                onPressCreateExport={actions.createExport}
                onPressCreateAdjustment={actions.createInventory}
                onPressCreateMaterial={actions.createMaterial}
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
