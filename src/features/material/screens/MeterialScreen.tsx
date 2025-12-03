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

type ScreenType = 'list' | 'add_material' | 'edit_material' | 'add_warehouse';

export const MeterialScreen = () => {
    const { setTabBarVisible } = useTabBarVisibility();
    const [selectedTab, setSelectedTab] = useState<TabType>('list');
    const [currentScreen, setCurrentScreen] = useState<ScreenType>('list');
    const [materials, setMaterials] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [editingMaterial, setEditingMaterial] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [filterGroup, setFilterGroup] = useState('');

    useLayoutEffect(() => {
        if (currentScreen === 'add_material' || currentScreen === 'edit_material' || currentScreen === 'add_warehouse') {
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

    const handleSaveWarehouse = (data: any) => {
        console.log('Save Warehouse Import', data);
        const newReceipt = { ...data, id: Date.now().toString() };
        setReceipts(prev => [newReceipt, ...prev]);
        setSelectedTab('history');
        handleBackToMaterialList();
    };

    const filteredMaterials = materials.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesGroup = filterGroup === '' || filterGroup === 'Tất cả nhóm vật tư' || item.group === filterGroup;
        return matchesSearch && matchesGroup;
    });

    const filteredReceipts = receipts.filter(item => {
        const matchesSearch = searchText === '' ||
            (item.supplier && item.supplier.toLowerCase().includes(searchText.toLowerCase())) ||
            item.materials.some((m: any) => m.materialName.toLowerCase().includes(searchText.toLowerCase()));

        const matchesGroup = filterGroup === '' || filterGroup === 'Tất cả nhóm vật tư' ||
            item.materials.some((m: any) => {
                const materialDef = materials.find(mat => mat.name === m.materialName);
                return materialDef && materialDef.group === filterGroup;
            });

        return matchesSearch && matchesGroup;
    });

    if (currentScreen === 'add_material') {
        return (
            <AddMaterialScreen
                onBack={handleBackToMaterialList}
                onSave={handleSaveMaterial}
            />
        );
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
                availableMaterials={materials}
                onSave={handleSaveWarehouse}
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
                            onPressCreateAdjustment={handleCreateAdjustment}
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
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <AddMaterialCard onPressAdd={handleAddMaterial} />
                        )
                    )}
                    {selectedTab === 'history' && (
                        receipts.length > 0 ? (
                            <WarehouseListScreen receipts={filteredReceipts} />
                        ) : (
                            <AddWarehouseCard onPressAdd={handleCreateImport} />
                        )
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
