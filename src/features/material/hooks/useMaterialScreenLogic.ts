import { useState, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { TabType } from '@/features/material/components/HeadingMaterial';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { IMaterial } from '@/features/material/types/material.types';
import { MaterialGroupType } from '@/features/material/types/material.types';
import {
    useExportWarehouse,
    useInventoryTickets,
    useImportReceipts,
    useMaterials,
} from '@/features/material/hooks';
import { useZones } from '@/features/farm/hooks';
import { useMaterialStore } from '@/features/material/store';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { GetWarehouseItemsQueryParams } from '@/features/material/types/warehouse.types';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export const useMaterialScreenLogic = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute();
    const { setTabBarVisible } = useTabBarVisibility();
    const selectedTab = useMaterialStore(state => state.selectedTab);
    const setSelectedTab = useMaterialStore(state => state.setSelectedTab);

    // Global State
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);
    const { data: zonesData = [] } = useZones();

    // Dropdown Data
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

    useEffect(() => {
        if (!selectedZoneId && dropdownData.length > 0) {
            setSelectedZoneId(dropdownData[0].id.toString());
        }
    }, [dropdownData, selectedZoneId, setSelectedZoneId]);

    // Menu State
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

    useFocusEffect(
        useCallback(() => {
            return () => {
                setMenuOpen(false);
            };
        }, [])
    );

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

    // Search & Filter State
    const searchText = useMaterialStore(state => state.searchText);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const setSearchText = useMaterialStore(state => state.setSearchText);
    const filterType = useMaterialStore(state => state.filterType);
    const setFilterType = useMaterialStore(state => state.setFilterType);
    const setFilterMaterialName = useMaterialStore(state => state.setFilterMaterialName);

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

    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);
    const setImportReceiptStatusFilter = useMaterialStore(
        state => state.setImportReceiptStatusFilter
    );

    const handleFilterStatus = useCallback(
        (status: string) => {
            setImportReceiptStatusFilter(status);
        },
        [setImportReceiptStatusFilter]
    );

    const handleFilterPress = useCallback(() => {
        // Filter pressed handler
    }, []);

    // Tab Selection
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

    // Route Params Handling
    useEffect(() => {
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

    // Data Fetching Params
    const materialParams = useMemo(() => {
        const params: GetWarehouseItemsQueryParams = {
            Page: DEFAULT_PAGE,
            PageSize: DEFAULT_PAGE_SIZE,
        };

        if (searchText && searchText.trim()) {
            params.Search = searchText.trim();
        }

        if (selectedTab === 'list' && filterType) {
            params.MaterialGroupId = filterType;
        }

        return params;
    }, [searchText, filterType, selectedTab]);

    const { data: warehouses } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const warehouseId = warehouses?.[0]?.id;

    // Fetch Warehouse Items
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

    // Other Data Params
    const warehouseParams = useMemo(
        () => ({
            ReceiptCode: searchText || undefined,
            WarehouseId: warehouseId || undefined,
            Status: importReceiptStatusFilter || undefined,
        }),
        [searchText, warehouseId, importReceiptStatusFilter]
    );

    const exportWarehouseParams = useMemo(
        () => ({
            Search: searchText,
            MaterialName: filterMaterialName || undefined,
            WarehouseId: warehouseId || undefined,
            Status: importReceiptStatusFilter || undefined,
            Page: DEFAULT_PAGE,
            PageSize: DEFAULT_PAGE_SIZE,
        }),
        [searchText, filterMaterialName, warehouseId, importReceiptStatusFilter]
    );

    const inventoryParams = useMemo(
        () => ({
            Search: searchText,
            WarehouseId: warehouseId,
        }),
        [searchText, warehouseId]
    );

    // Fetch Other Lists
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

    const masterListParams = useMemo(
        () => ({
            SearchText: searchText || undefined,
            MaterialTypeId: filterType || undefined,
            Page: 1,
            PageSize: 100,
        }),
        [searchText, filterType]
    );

    const {
        data: masterMaterials = [],
        isLoading: isLoadingMasterMaterials,
        refetch: refetchMasterMaterials,
        isRefetching: isRefetchingMasterMaterials,
    } = useMaterials(masterListParams);

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
        refetchMasterMaterials();
    }, [
        refetchWarehouseItems,
        refetchImportReceipts,
        refetchExportWarehouse,
        refetchInventory,
        refetchMasterMaterials,
    ]);

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

    return {
        // State
        selectedTab,
        dropdownData,
        selectedDropdownItem,
        currentStatus: importReceiptStatusFilter,
        menuOpen,
        menuPosition,
        materials,
        importReceiptsData,
        mappedExportReceipts,
        inventoryList,
        showSkeleton,
        isLoadingImportReceipts,
        isLoadingExportWarehouse,
        isLoadingInventory,
        isRefetchingWarehouseItems,
        isRefetchingImportReceipts,
        isRefetchingExportWarehouse,
        isRefetchingInventory,

        // Master List
        masterMaterials,
        isLoadingMasterMaterials,
        isRefetchingMasterMaterials,

        // Handlers
        handleDropdownSelect,
        handleShowMenu,
        handleCloseMenu,
        handleSearch,
        handleFilterType,
        handleFilterStatus,
        handleFilterPress,
        handleTabSelect,
        handleHistoryPress,
        handleAdjustmentPress,
        handleRefresh,

        // Actions
        actions,
    };
};
