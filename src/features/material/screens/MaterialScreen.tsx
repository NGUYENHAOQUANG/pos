import React, { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { WarehouseListScreen } from '@/features/material/screens/warehouse/WarehouseListScreen';
import { MaterialListScreen } from '@/features/material/screens/material/MaterialListScreen';
import { InventoryCard } from '@/features/material/components/inventory/InventoryCard';
import {
    IMaterial,
    IWarehouseReceipt,
    IWarehouseMaterialItem,
} from '@/features/material/types/material.types';
import { useWarehouseStore } from '@/features/material/store/warehouseStore';
import { useInventoryStore } from '@/features/material/store/inventoryStore';
import { useMaterialFiltersStore } from '@/features/material/store/materialFiltersStore';
import { useMaterials, useMaterialTypes } from '@/features/material/hooks/useMaterials';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { Loading } from '@/shared/components/ui/Loading';

// Constants for pagination
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

export const MeterialScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute();
    const { setTabBarVisible } = useTabBarVisibility();

    const [selectedTab, setSelectedTab] = useState<TabType>('list');

    // React Query hooks for materials
    const searchText = useMaterialFiltersStore(state => state.searchText);
    const filterType = useMaterialFiltersStore(state => state.filterType);
    const filterMaterialName = useMaterialFiltersStore(state => state.filterMaterialName);
    const setSearchText = useMaterialFiltersStore(state => state.setSearchText);
    const setFilterType = useMaterialFiltersStore(state => state.setFilterType);
    const setFilterMaterialName = useMaterialFiltersStore(state => state.setFilterMaterialName);

    // Fetch material types to map filterType name to ID
    const { data: materialTypes = [] } = useMaterialTypes();

    // Build API params - memoize to prevent unnecessary refetches
    const materialParams = useMemo(() => {
        const params: { Page: number; PageSize: number; MaterialTypeId?: number; Search?: string } =
            {
                Page: DEFAULT_PAGE,
                PageSize: DEFAULT_PAGE_SIZE,
            };

        // Map filterType (type name) to MaterialTypeId
        if (filterType && filterType !== '' && filterType !== 'Tất cả loại vật tư') {
            const selectedType = materialTypes.find(t => t.name === filterType);
            if (selectedType) {
                params.MaterialTypeId = selectedType.id;
            }
        }

        // Add Search param if searchText is set
        if (searchText && searchText.trim()) {
            params.Search = searchText.trim();
        }

        return params;
    }, [filterType, searchText, materialTypes]);

    // Fetch materials with React Query
    const { data: materials = [], isLoading: isLoadingMaterials } = useMaterials(materialParams);

    // Warehouse and Inventory stores (still using Zustand for now)
    const warehouseList = useWarehouseStore(state => state.warehouseList);
    const inventoryList = useInventoryStore(state => state.inventoryList);

    // Menu state management
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

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
        } as any);
    }, [navigation, materials]);

    const handleCreateInventory = useCallback(() => {
        navigation.navigate('AddInventory', {} as any);
    }, [navigation]);

    const handleCreateMaterial = useCallback(() => {
        navigation.navigate('AddMaterial', {} as any);
    }, [navigation]);

    const handleEditMaterial = useCallback(
        (item: IMaterial) => {
            navigation.navigate('EditMaterial', {
                material: item,
            } as any);
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
            if (tab !== 'history') {
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

    // Client-side filtering (for search text matching)
    // Note: API already handles MaterialTypeId and Search filters, but we do client-side
    // filtering as a fallback for better UX
    const filteredMaterials = useMemo(() => {
        if (!materials || materials.length === 0) {
            return [];
        }
        return materials.filter((item: IMaterial) => {
            // API already handles MaterialTypeId and Search filters
            // This is just for additional client-side matching if needed
            if (!item.name) return false;
            const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
            return matchesSearch;
        });
    }, [materials, searchText]);

    const filteredWarehouseList = useMemo(() => {
        return warehouseList.filter((receipt: IWarehouseReceipt) => {
            if (filterMaterialName) {
                if (
                    !receipt.materials.some(
                        (m: IWarehouseMaterialItem) => m.materialName === filterMaterialName
                    )
                ) {
                    return false;
                }
            }
            if (searchText) {
                const lowerSearch = searchText.toLowerCase();
                const matchesSupplier = receipt.supplier?.toLowerCase().includes(lowerSearch);
                const matchesMaterial = receipt.materials.some((m: IWarehouseMaterialItem) =>
                    m.materialName.toLowerCase().includes(lowerSearch)
                );
                if (!matchesSupplier && !matchesMaterial) return false;
            }
            return true;
        });
    }, [warehouseList, filterMaterialName, searchText]);

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
                {selectedTab === 'list' &&
                    (isLoadingMaterials ? (
                        <Loading isLoading={isLoadingMaterials}></Loading>
                    ) : filteredMaterials.length > 0 ? (
                        <MaterialListScreen
                            materials={filteredMaterials}
                            onEdit={handleEditMaterial}
                            onHistoryPress={handleHistoryPress}
                            onAdjustmentPress={adjustmentItem =>
                                navigation.navigate('AddInventory', {
                                    initialMaterialName: adjustmentItem.name,
                                } as any)
                            }
                        />
                    ) : (
                        <MaterialEmptyState tab="list" onPress={handleAddMaterial} />
                    ))}
                {selectedTab === 'history' &&
                    (filteredWarehouseList.length > 0 ? (
                        <WarehouseListScreen receipts={filteredWarehouseList} />
                    ) : (
                        <MaterialEmptyState tab="history" onPress={handleCreateImport} />
                    ))}
                {selectedTab === 'inventory' &&
                    (inventoryList.length > 0 ? (
                        <FlatList
                            data={inventoryList}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <InventoryCard data={item} />}
                            contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <MaterialEmptyState tab="inventory" onPress={handleCreateInventory} />
                    ))}
            </View>

            <MaterialMenuOverlay
                isOpen={menuOpen}
                buttonPosition={menuPosition}
                onClose={handleCloseMenu}
                onPressCreateImport={handleCreateImport}
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
