import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { TabType } from '@/features/material/screens/material/MaterialView';
import { useMaterialStore } from '@/features/material/store';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useZones } from '@/features/farm/hooks';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { MaterialView } from './MaterialView';

export const MaterialScreen = () => {
    // 1. Navigation & Route Params
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute();
    const { setTabBarVisible } = useTabBarVisibility();

    // 2. Zustand Store (Client State)
    const selectedTab = useMaterialStore(state => state.selectedTab);
    const setSelectedTab = useMaterialStore(state => state.setSelectedTab);
    const setSearchText = useMaterialStore(state => state.setSearchText);
    const filterType = useMaterialStore(state => state.filterType);
    const setFilterType = useMaterialStore(state => state.setFilterType);
    const filterGroup = useMaterialStore(state => state.filterGroup);
    const setFilterGroup = useMaterialStore(state => state.setFilterGroup);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const setFilterMaterialName = useMaterialStore(state => state.setFilterMaterialName);
    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);
    const exportReceiptStatusFilter = useMaterialStore(state => state.exportReceiptStatusFilter);
    const inventoryStatusFilter = useMaterialStore(state => state.inventoryStatusFilter);

    const setImportReceiptStatusFilter = useMaterialStore(
        state => state.setImportReceiptStatusFilter
    );
    const setExportReceiptStatusFilter = useMaterialStore(
        state => state.setExportReceiptStatusFilter
    );
    const setInventoryStatusFilter = useMaterialStore(state => state.setInventoryStatusFilter);
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);

    // 3. Data Fetching (Server State)
    const { data: zonesData = [] } = useZones();

    // 4. Header Dropdown Logic
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
        if (zonesData.length > 0 && !selectedZoneId) {
            const targetZone = zonesData.find(z => z.name === 'Trại Kiên Giang') || zonesData[0];
            if (targetZone) {
                setSelectedZoneId(String(targetZone.id));
            }
        }
    }, [zonesData, selectedZoneId, setSelectedZoneId]);

    // 5. Header Menu State
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

    // 6. Filter Logic
    const handleSearch = useCallback(
        (text: string) => {
            setSearchText(text);
        },
        [setSearchText]
    );

    const handleFilterType = useCallback(
        (value: string) => {
            if (selectedTab === TabType.Warehouse) {
                setFilterGroup(value);
            } else {
                setFilterType(value);
            }
        },
        [selectedTab, setFilterGroup, setFilterType]
    );

    const handleFilterStatus = useCallback(
        (status: string) => {
            if (selectedTab === TabType.Import) {
                setImportReceiptStatusFilter(status);
            } else if (selectedTab === TabType.Export) {
                setExportReceiptStatusFilter(status);
            } else if (selectedTab === TabType.Inventory) {
                setInventoryStatusFilter(status);
            }
        },
        [
            selectedTab,
            setImportReceiptStatusFilter,
            setExportReceiptStatusFilter,
            setInventoryStatusFilter,
        ]
    );

    const handleFilterPress = useCallback(() => {}, []);

    const currentFilterValue = selectedTab === TabType.Warehouse ? filterGroup : filterType;

    // 7. Tab Selection Logic
    const handleTabSelect = useCallback(
        (tab: TabType) => {
            setSelectedTab(tab);
            if (tab !== TabType.Import && tab !== TabType.Export) {
                setFilterMaterialName(null);
            } else if (filterMaterialName) {
                setFilterMaterialName(null);
            }
        },
        [filterMaterialName, setFilterMaterialName, setSelectedTab]
    );

    const handleHistoryPress = useCallback(
        (item: IWarehouseItem) => {
            setFilterMaterialName(item.materialName || null);
            setSelectedTab(TabType.Import);
        },
        [setFilterMaterialName, setSelectedTab]
    );

    // 8. Navigation Params & TabBar
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

    // 9. Navigation Actions
    const actions = useMemo(
        () => ({
            createImport: () => navigation.navigate('ImportReceiptFormScreen', {}),
            createExport: () => navigation.navigate('ExportWarehouseForm', {}),
            createInventory: () => navigation.navigate('AddInventory', {}),
            createMaterial: () => navigation.navigate('MaterialForm', {}),
            editMaterial: (item: IWarehouseItem) =>
                navigation.navigate('MaterialForm', {
                    materialId: item.materialId,
                } as any),
        }),
        [navigation]
    );

    return (
        <MaterialView
            selectedTab={selectedTab}
            dropdownData={dropdownData}
            selectedDropdownItem={selectedDropdownItem}
            menuOpen={menuOpen}
            menuPosition={menuPosition}
            handleDropdownSelect={handleDropdownSelect}
            handleShowMenu={handleShowMenu}
            handleCloseMenu={handleCloseMenu}
            currentStatus={
                selectedTab === TabType.Import
                    ? importReceiptStatusFilter || undefined
                    : selectedTab === TabType.Export
                    ? exportReceiptStatusFilter || undefined
                    : selectedTab === TabType.Inventory
                    ? inventoryStatusFilter || undefined
                    : undefined
            }
            currentFilterValue={currentFilterValue || undefined}
            handleSearch={handleSearch}
            handleFilterType={handleFilterType}
            handleFilterStatus={handleFilterStatus}
            handleFilterPress={handleFilterPress}
            handleTabSelect={handleTabSelect}
            handleHistoryPress={handleHistoryPress}
            actions={actions}
        />
    );
};
