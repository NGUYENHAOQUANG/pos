import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '../navigation/MaterialNavigator';

import { HeaderMeterial } from '../components/HeaderMaterial';
import { ButtonMetaerial } from '../components/ButtonMaterial';
import { HeadingMeterial, TabType } from '../components/HeadingMaterial';
import { SearchBarMeterial } from '../components/SearchBarMaterial';
import { MaterialEmptyState } from '../components/EmptyStateCard';
import { WarehouseListScreen } from './warehouse/WarehouseListScreen';
import { MaterialListScreen } from './material/MaterialListScreen';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { InventoryCard } from '../components/inventory/InventoryCard';
import { IMaterial, IWarehouseReceipt, IInventoryTicket } from '../types/material.types';
import { mockMaterialList, mockWarehouseList, mockInventoryList } from '../data/materialData';
import { showSuccessToast } from '../utils/validationToast';

export const MeterialScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'MaterialList'>>();
    const { setTabBarVisible } = useTabBarVisibility();

    const [selectedTab, setSelectedTab] = useState<TabType>('list');

    // Handle tab navigation from other screens
    React.useEffect(() => {
        if (route.params?.selectedTab) {
            setSelectedTab(route.params.selectedTab);
            // Optional: reset params so it doesn't stick?
            // Better to keep it simple first
            navigation.setParams({ selectedTab: undefined });
        }
    }, [route.params?.selectedTab, navigation]);
    const [materials, setMaterials] = useState<IMaterial[]>(mockMaterialList);
    const [searchText, setSearchText] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [inventoryList, setInventoryList] = useState<IInventoryTicket[]>(mockInventoryList);
    const [warehouseList, setWarehouseList] = useState<IWarehouseReceipt[]>(mockWarehouseList);
    const [filterMaterialName, setFilterMaterialName] = useState<string | null>(null);

    // Force update materials on mount to handle Fast Refresh state preservation
    React.useEffect(() => {
        setMaterials(mockMaterialList);
        setInventoryList(mockInventoryList);
        setWarehouseList(mockWarehouseList);
    }, []);

    useLayoutEffect(() => {
        // Always show tab bar on list screen
        setTabBarVisible(true);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const handleSaveMaterial = (newMaterial: Omit<IMaterial, 'id'>) => {
        setMaterials(prev => [...prev, { ...newMaterial, id: Date.now().toString() }]);
        showSuccessToast('Tạo vật tư thành công');
    };

    const handleUpdateMaterial = (updatedMaterial: IMaterial) => {
        setMaterials(prev =>
            prev.map(item => (item.id === updatedMaterial.id ? updatedMaterial : item))
        );
        showSuccessToast('Cập nhật thông tin vật tư thành công');
    };

    const handleSaveWarehouse = (data: any) => {
        console.log('Save Warehouse Import', data);
        const newReceipt = {
            // Type this properly if possible
            id: Date.now().toString(),
            ...data,
        };
        setWarehouseList(prev => [newReceipt, ...prev]);
        showSuccessToast('Tạo phiếu nhập kho thành công');
    };

    const handleSaveInventory = (newTicket: IInventoryTicket) => {
        console.log('Dữ liệu lưu:', newTicket);
        setInventoryList(prev => [newTicket, ...prev]);

        // Update actual stock in material list
        setMaterials(prevMaterials =>
            prevMaterials.map(mat => {
                const ticketItem = newTicket.items.find(item => item.materialName === mat.name);
                if (ticketItem) {
                    return { ...mat, remaining: ticketItem.afterQuantity };
                }
                return mat;
            })
        );
        showSuccessToast('Tạo phiếu điều chỉnh tồn kho thành công');
    };

    const handleCreateImport = () => {
        navigation.navigate('AddWarehouse', {
            availableMaterials: materials,
            onSave: handleSaveWarehouse, // Pass callback (requires updating Navigator param list type)
        } as any);
    };

    const handleCreateInventory = () => {
        console.log('Tạo phiếu điều chỉnh tồn kho');
        navigation.navigate('AddInventory', {
            onSave: handleSaveInventory,
        } as any);
    };

    const handleCreateMaterial = () => {
        navigation.navigate('AddMaterial', {
            onSave: handleSaveMaterial,
        } as any);
    };

    const handleEditMaterial = (item: IMaterial) => {
        navigation.navigate('EditMaterial', {
            material: item,
            onSave: handleUpdateMaterial,
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
            <HeaderMeterial
                showBackButton={false}
                rightComponent={
                    <ButtonMetaerial
                        onPressCreateImport={handleCreateImport}
                        onPressCreateAdjustment={handleCreateInventory}
                        onPressCreateMaterial={handleCreateMaterial}
                    />
                }
            />
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
                                onSave: handleSaveInventory,
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
