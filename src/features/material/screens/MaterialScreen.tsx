import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '../navigation/MaterialNavigator';

import { HeaderMeterial } from '../components/HeaderMaterial';
import { ButtonMetaerial, MaterialMenuOverlay } from '../components/ButtonMaterial';
import { HeadingMeterial, TabType } from '../components/HeadingMaterial';
import { SearchBarMeterial } from '../components/SearchBarMaterial';
import { MaterialEmptyState } from '../components/EmptyStateCard';
import { WarehouseListScreen } from './warehouse/WarehouseListScreen';
import { MaterialListScreen } from './material/MaterialListScreen';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { InventoryCard } from '../components/inventory/InventoryCard';
import { IMaterial } from '../types/material.types';
import { useMaterialStore } from '../store/materialStore';

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
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const setSearchText = useMaterialStore(state => state.setSearchText);
    const setFilterGroup = useMaterialStore(state => state.setFilterGroup);
    const setFilterMaterialName = useMaterialStore(state => state.setFilterMaterialName);
    const initializeData = useMaterialStore(state => state.initializeData);

    // Menu state management
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const handleShowMenu = (position: { x: number; y: number; width: number; height: number }) => {
        setMenuPosition(position);
        setMenuOpen(true);
    };

    const handleCloseMenu = () => {
        setMenuOpen(false);
    };

    // Handle tab navigation from other screens
    useEffect(() => {
        const params = route.params as { selectedTab?: TabType } | undefined;
        if (params?.selectedTab) {
            setSelectedTab(params.selectedTab);
            navigation.setParams({ selectedTab: undefined } as any);
        }
    }, [route.params, navigation]);

    // Initialize data on mount (for Fast Refresh support)
    useEffect(() => {
        initializeData();
    }, [initializeData]);

    useLayoutEffect(() => {
        // Always show tab bar on list screen
        setTabBarVisible(true);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const handleCreateImport = () => {
        navigation.navigate('AddWarehouse', {
            availableMaterials: materials,
        } as any);
    };

    const handleCreateInventory = () => {
        navigation.navigate('AddInventory', {} as any);
    };

    const handleCreateMaterial = () => {
        navigation.navigate('AddMaterial', {} as any);
    };

    const handleEditMaterial = (item: IMaterial) => {
        navigation.navigate('EditMaterial', {
            material: item,
        } as any);
    };

    const handleAddMaterial = () => {
        handleCreateMaterial();
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
    };

    const handleFilterGroup = (group: string) => {
        setFilterGroup(group);
    };

    const handleFilterPress = () => {
        console.log('Filter pressed');
    };

    const handleTabSelect = (tab: TabType) => {
        setSelectedTab(tab);
        if (tab !== 'history') {
            setFilterMaterialName(null);
        } else if (filterMaterialName) {
            setFilterMaterialName(null);
        }
    };

    const handleHistoryPress = (item: IMaterial) => {
        setFilterMaterialName(item.name);
        setSelectedTab('history');
    };

    const filteredMaterials = materials.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesGroup =
            filterGroup === '' ||
            filterGroup === 'Tất cả nhóm vật tư' ||
            item.group === filterGroup;
        return matchesSearch && matchesGroup;
    });

    const filteredWarehouseList = warehouseList.filter(receipt => {
        if (filterMaterialName) {
            if (!receipt.materials.some(m => m.materialName === filterMaterialName)) {
                return false;
            }
        }
        if (filterGroup && filterGroup !== 'Tất cả nhóm vật tư') {
            const hasGroup = receipt.materials.some(receiptItem => {
                const materialDef = materials.find(m => m.name === receiptItem.materialName);
                return materialDef?.group === filterGroup;
            });
            if (!hasGroup) return false;
        }
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            const matchesSupplier = receipt.supplier?.toLowerCase().includes(lowerSearch);
            const matchesMaterial = receipt.materials.some(m =>
                m.materialName.toLowerCase().includes(lowerSearch)
            );
            if (!matchesSupplier && !matchesMaterial) return false;
        }
        return true;
    });

    return (
        <View style={styles.container}>
            <View style={{ zIndex: 1000, elevation: 10 }}>
                <HeaderMeterial
                    showBackButton={false}
                    rightComponent={<ButtonMetaerial onShowMenu={handleShowMenu} />}
                />
            </View>
            <HeadingMeterial selectedTab={selectedTab} onTabSelect={handleTabSelect} />
            <SearchBarMeterial
                onSearch={handleSearch}
                onFilterPress={handleFilterPress}
                onGroupChange={handleFilterGroup}
                selectedTab={selectedTab}
            />

            <View style={styles.content}>
                {selectedTab === 'list' && (
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
