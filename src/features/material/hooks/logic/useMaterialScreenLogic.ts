import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { TabType } from '@/features/material/components/HeadingMaterial';
import { IMaterial, MaterialGroupType } from '@/features/material/types/material.types';
import { useMaterialStore } from '@/features/material/store';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useMaterialHeaderLogic } from './useMaterialHeaderLogic';
import { useMaterialFilterLogic } from './useMaterialFilterLogic';

import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

interface UseMaterialScreenLogicReturn {
    selectedTab: TabType;
    dropdownData: DropDownItem[];
    selectedDropdownItem: DropDownItem;
    menuOpen: boolean;
    menuPosition: { x: number; y: number; width: number; height: number };
    handleDropdownSelect: (item: DropDownItem) => void;
    handleShowMenu: (position: { x: number; y: number; width: number; height: number }) => void;
    handleCloseMenu: () => void;
    searchText: string | null;
    currentStatus: string | null;
    currentFilterValue: string | null;
    handleSearch: (text: string) => void;
    handleFilterType: (type: string) => void;
    handleFilterStatus: (status: string) => void;
    handleFilterPress: () => void;
    handleTabSelect: (tab: TabType) => void;
    handleHistoryPress: (item: IWarehouseItem) => void;
    actions: {
        createImport: () => void;
        createExport: () => void;
        createInventory: () => void;
        createMaterial: () => void;
        editMaterial: (item: IWarehouseItem) => void;
    };
}

export const useMaterialScreenLogic = (): UseMaterialScreenLogicReturn => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute();
    const { setTabBarVisible } = useTabBarVisibility();
    const selectedTab = useMaterialStore(state => state.selectedTab);
    const setSelectedTab = useMaterialStore(state => state.setSelectedTab);

    // 1. Header Logic (Dropdown, Menu)
    const headerLogic = useMaterialHeaderLogic();

    // 2. Filter Logic (Search, Filter Type/Status)
    const filterLogic = useMaterialFilterLogic();

    // 3. Tab Selection Logic
    const handleTabSelect = useCallback(
        (tab: TabType) => {
            setSelectedTab(tab);
            if (tab !== 'history' && tab !== 'export') {
                filterLogic.setFilterMaterialName(null);
            } else if (filterLogic.filterMaterialName) {
                filterLogic.setFilterMaterialName(null);
            }
        },
        [filterLogic, setSelectedTab]
    );

    const handleHistoryPress = useCallback(
        (item: IWarehouseItem) => {
            filterLogic.setFilterMaterialName(item.materialName);
            setSelectedTab('history');
        },
        [filterLogic, setSelectedTab]
    );

    // 4. Navigation & Route Params
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

    // 5. Actions (Navigation)
    const actions = useMemo(
        () => ({
            createImport: () => navigation.navigate('AddWarehouse', {}),
            createExport: () => navigation.navigate('AddExportWarehouse', {}),
            createInventory: () => navigation.navigate('AddInventory', {}),
            createMaterial: () => navigation.navigate('AddMaterial', {}),
            editMaterial: (item: IWarehouseItem) =>
                navigation.navigate('EditMaterial', {
                    material: {
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
                    } as IMaterial,
                }),
        }),
        [navigation]
    );

    return {
        // State
        selectedTab,

        // Header Logic
        dropdownData: headerLogic.dropdownData,
        selectedDropdownItem: headerLogic.selectedDropdownItem,
        menuOpen: headerLogic.menuOpen,
        menuPosition: headerLogic.menuPosition,
        handleDropdownSelect: headerLogic.handleDropdownSelect,
        handleShowMenu: headerLogic.handleShowMenu,
        handleCloseMenu: headerLogic.handleCloseMenu,

        // Filter Logic
        searchText: filterLogic.searchText,
        currentStatus: filterLogic.currentStatus || null,
        currentFilterValue: filterLogic.currentFilterValue || null,
        handleSearch: filterLogic.handleSearch,
        handleFilterType: filterLogic.handleFilterType,
        handleFilterStatus: filterLogic.handleFilterStatus,
        handleFilterPress: filterLogic.handleFilterPress,

        // Tab & List Interaction Handlers
        handleTabSelect,
        handleHistoryPress,

        // Actions
        actions,
    };
};
