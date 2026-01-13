import React, { useState, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
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
import { WarehouseListScreen } from './warehouse/WarehouseListScreen';
import { MaterialListScreen } from './material/MaterialListScreen';
import { InventoryCard } from '@/features/material/components/inventory/InventoryCard';
import {
    IMaterial,
    IWarehouseReceipt,
    IWarehouseMaterialItem,
} from '@/features/material/types/material.types';
import { useMaterialStore } from '@/features/material/store';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { Loading } from '@/shared/components/ui/Loading';

export const MeterialScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute();
    const { setTabBarVisible } = useTabBarVisibility();

    const [selectedTab, setSelectedTab] = useState<TabType>('list');

    // Use Zustand store with simplified selectors
    const materials = useMaterialStore(state => state.materials);
    const warehouseList = useMaterialStore(state => state.warehouseList);
    const inventoryList = useMaterialStore(state => state.inventoryList);
    const searchText = useMaterialStore(state => state.searchText);
    const filterGroup = useMaterialStore(state => state.filterGroup);
    const filterType = useMaterialStore(state => state.filterType);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const isLoadingMaterials = useMaterialStore(state => state.isLoadingMaterials);
    const setSearchText = useMaterialStore(state => state.setSearchText);
    const setFilterType = useMaterialStore(state => state.setFilterType);
    const setFilterMaterialName = useMaterialStore(state => state.setFilterMaterialName);
    const fetchMaterials = useMaterialStore(state => state.fetchMaterials);

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
    useEffect(() => {
        const params = route.params as { selectedTab?: TabType } | undefined;
        if (params?.selectedTab) {
            setSelectedTab(params.selectedTab);
            navigation.setParams({ selectedTab: undefined } as any);
        }
    }, [route.params, navigation]);

    // Fetch materials from API on mount and when filters change
    useEffect(() => {
        const loadMaterials = async () => {
            try {
                await fetchMaterials({
                    Page: 1,
                    PageSize: 100,
                });
            } catch (error) {
                console.error('[MaterialScreen] Failed to fetch materials:', error);
            }
        };
        loadMaterials();
    }, [fetchMaterials, filterType, searchText]);

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
            // Refetch materials when filter changes
            fetchMaterials({
                Page: 1,
                PageSize: 100,
            });
        },
        [setFilterType, fetchMaterials]
    );

    const handleFilterPress = useCallback(() => {
        console.log('Filter pressed');
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

    const filteredMaterials = useMemo(() => {
        return materials.filter((item: IMaterial) => {
            const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
            const matchesType =
                filterType === '' ||
                filterType === 'Tất cả loại vật tư' ||
                item.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [materials, searchText, filterType]);

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
            if (filterGroup && filterGroup !== 'Tất cả nhóm vật tư') {
                const hasGroup = receipt.materials.some((receiptItem: IWarehouseMaterialItem) => {
                    const materialDef = materials.find(
                        (m: IMaterial) => m.name === receiptItem.materialName
                    );
                    return materialDef?.group === filterGroup;
                });
                if (!hasGroup) return false;
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
    }, [warehouseList, filterMaterialName, filterGroup, materials, searchText]);

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

            {useMemo(
                () => (
                    <View style={styles.content}>
                        {selectedTab === 'list' && (
                            <Loading isLoading={isLoadingMaterials}>
                                <MaterialListScreen
                                    materials={filteredMaterials}
                                    onEdit={handleEditMaterial}
                                    onAdd={handleAddMaterial}
                                    onHistoryPress={handleHistoryPress}
                                    onAdjustmentPress={adjustmentItem =>
                                        navigation.navigate('AddInventory', {
                                            initialMaterialName: adjustmentItem.name,
                                        } as any)
                                    }
                                />
                            </Loading>
                        )}
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
                                <MaterialEmptyState
                                    tab="inventory"
                                    onPress={handleCreateInventory}
                                />
                            ))}
                    </View>
                ),
                [
                    selectedTab,
                    filteredMaterials,
                    isLoadingMaterials,
                    handleEditMaterial,
                    handleAddMaterial,
                    handleHistoryPress,
                    navigation,
                    filteredWarehouseList,
                    handleCreateImport,
                    inventoryList,
                    handleCreateInventory,
                ]
            )}

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
