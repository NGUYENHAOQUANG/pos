import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { HeaderMeterial } from '../components/HeaderMeterial';
import { ButtonMetaerial } from '../components/ButtonMaterial';
import { HeadingMeterial, TabType } from '../components/HeadingMaterial';
import { SearchBarMeterial } from '../components/SearchBarMeterial';
import { AddMaterialCard } from '../components/material/AddMaterialCard';
import { AddWarehouseCard } from '../components/warehouse/AddWarehouseCard';
import { AddMaterialScreen } from './material/AddMaterialScreen';
import { EditMaterialScreen } from './material/EditMaterialScreen';
import { AddWarehouseScreen } from './warehouse/AddWarehouseScreen';
import { WarehouseListScreen } from './warehouse/WarehouseListScreen';
import { MaterialList } from '../components/material/MaterialList';
import { spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { InventoryEmptyState } from '../components/inventory/InventoryEmptyState';
import { InventoryCard, InventoryTicket } from '../components/inventory/InventoryCard';
import { AddInventoryScreen } from './inventory/AddInventoryScreen';

type ScreenType = 'list' | 'add_material' | 'edit_material' | 'add_warehouse' | 'add_inventory';

export const MeterialScreen = () => {
    const { setTabBarVisible } = useTabBarVisibility();
    const [selectedTab, setSelectedTab] = useState<TabType>('list');
    const [currentScreen, setCurrentScreen] = useState<ScreenType>('list');
    const [materials, setMaterials] = useState<any[]>([]);
    const [editingMaterial, setEditingMaterial] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [filterGroup, setFilterGroup] = useState('');

    useLayoutEffect(() => {
        if (
            currentScreen === 'add_material' ||
            currentScreen === 'edit_material' ||
            currentScreen === 'add_warehouse'
        ) {
            setTabBarVisible(false);
        } else {
            setTabBarVisible(true);
        }

        return () => setTabBarVisible(true);
    }, [currentScreen, setTabBarVisible]);

    const handleCreateImport = () => {
        setCurrentScreen('add_warehouse');
    };

    const handleCreateAdjustment = () => {
        console.log('Create Adjustment');
    };

    const handleCreateInventory = () => {
        // --- SỬA THÀNH ---
        console.log('Tạo phiếu điều chỉnh tồn kho');
        const newTicket: InventoryTicket = {
            id: Date.now().toString(),
            checkerName: 'Nguyễn Phương Duy',
            date: '11:00 28/11/2025',
            note: 'Kiểm kê định kỳ tháng 11',
            totalDifference: -2,
            items: [
                {
                    id: '1',
                    materialName: 'CP 09 – Thức ăn tôm giai đoạn 2',
                    beforeQuantity: 4,
                    afterQuantity: 2,
                },
            ],
        };
        setInventoryList(prev => [newTicket, ...prev]);
        setCurrentScreen('add_inventory');
    };
    const handleCreateMaterial = () => {
        setCurrentScreen('add_material');
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

    const handleAddMaterial = () => {
        setCurrentScreen('add_material');
    };

    const handleBackToMaterialList = () => {
        setCurrentScreen('list');
        setEditingMaterial(null);
    };

    const handleSaveMaterial = (newMaterial: any) => {
        setMaterials(prev => [...prev, { ...newMaterial, id: Date.now().toString() }]);
        handleBackToMaterialList();
    };

    const handleEditMaterial = (item: any) => {
        setEditingMaterial(item);
        setCurrentScreen('edit_material');
    };

    const handleUpdateMaterial = (updatedMaterial: any) => {
        setMaterials(prev => prev.map(item => item.id === updatedMaterial.id ? updatedMaterial : item));
        handleBackToMaterialList();
    };

    const filteredMaterials = materials.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesGroup = filterGroup === '' || filterGroup === 'Tất cả nhóm vật tư' || item.group === filterGroup;
        return matchesSearch && matchesGroup;
    });

    if (currentScreen === 'add_material') {
        return <AddMaterialScreen onBack={handleBackToMaterialList} onSave={handleSaveMaterial} />;
    }

    if (currentScreen === 'edit_material' && editingMaterial) {
        return (
            <EditMaterialScreen
                initialData={editingMaterial}
                onBack={handleBackToMaterialList}
                onSave={handleUpdateMaterial}
            />
        );
    }

    if (currentScreen === 'add_warehouse') {
        return (
            <AddWarehouseScreen
                onBack={handleBackToMaterialList}
                onSave={(data) => {
                    console.log('Save Warehouse Import', data);
                    handleBackToMaterialList();
                }}
            />
        );
    }

    if (currentScreen === 'add_inventory') {
        return (
            <AddInventoryScreen
                onBack={() => setCurrentScreen('list')}
                onSave={data => {
                    // Logic lưu phiếu
                    console.log('Dữ liệu lưu:', data);

                    const newTicket: InventoryTicket = {
                        id: Date.now().toString(),
                        checkerName: 'Nguyễn Phương Duy',
                        date: '11:00 28/11/2025',
                        note: data.note || 'Phiếu mới',
                        totalDifference: data.items[0].diff,
                        items: [
                            {
                                id: '1',
                                materialName: data.items[0].name,
                                beforeQuantity: data.items[0].oldStock,
                                afterQuantity: data.items[0].newStock,
                            },
                        ],
                    };

                    setInventoryList(prev => [newTicket, ...prev]);
                    setCurrentScreen('list');
                }}
            />
        );
    }
    return (
        <SafeAreaView style={styles.safeArea}>
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
                <HeadingMeterial selectedTab={selectedTab} onTabSelect={setSelectedTab} />
                <SearchBarMeterial
                    onSearch={handleSearch}
                    onFilterPress={handleFilterPress}
                    onGroupChange={handleFilterGroup}
                    selectedTab={selectedTab}
                />

                <View style={styles.content}>
                    {selectedTab === 'list' && (
                        materials.length > 0 ? (
                            <FlatList
                                data={filteredMaterials}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <MaterialList
                                        item={item}
                                        onEdit={handleEditMaterial}
                                        onHistoryPress={(item) => console.log('History', item)}
                                        onAdjustmentPress={(item) => console.log('Adjustment', item)}
                                    />
                                )}
                                contentContainerStyle={{ paddingBottom: spacing.xl }}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <AddMaterialCard onPressAdd={handleAddMaterial} />
                        )
                    )}
                    {selectedTab === 'history' && (
                        <AddWarehouseCard onPressAdd={handleCreateImport} />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
});
