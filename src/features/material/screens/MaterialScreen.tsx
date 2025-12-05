import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { HeaderMeterial } from '../components/HeaderMaterial';
import { ButtonMetaerial } from '../components/ButtonMaterial';
import { HeadingMeterial, TabType } from '../components/HeadingMaterial';
import { SearchBarMeterial } from '../components/SearchBarMaterial';
import { MaterialEmptyState } from '../components/EmptyStateCard';
import { AddMaterialScreen } from './material/AddMaterialScreen';
import { EditMaterialScreen } from './material/EditMaterialScreen';
import { AddWarehouseScreen } from './warehouse/AddWarehouseScreen';
import { WarehouseListScreen } from './warehouse/WarehouseListScreen';
import { MaterialListScreen } from './material/MaterialListScreen';
import { spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { InventoryCard } from '../components/inventory/InventoryCard';
import { AddInventoryScreen } from './inventory/AddInventoryScreen';

import { IMaterial, IWarehouseReceipt, IInventoryTicket } from '../types/material.types';

type ScreenType = 'list' | 'add_material' | 'edit_material' | 'add_warehouse' | 'add_inventory';

export const MeterialScreen = () => {
  const { setTabBarVisible } = useTabBarVisibility();
  const [selectedTab, setSelectedTab] = useState<TabType>('list');
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('list');
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<IMaterial | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [inventoryList, setInventoryList] = useState<IInventoryTicket[]>([]);
  const [warehouseList, setWarehouseList] = useState<IWarehouseReceipt[]>([]);
  const [filterMaterialName, setFilterMaterialName] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (
      currentScreen === 'add_material' ||
      currentScreen === 'edit_material' ||
      currentScreen === 'add_warehouse' ||
      currentScreen === 'add_inventory'
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

  // const handleCreateAdjustment = () => {
  //     console.log('Create Adjustment');
  // }; // TODO: Uncomment when implementing adjustment

  const handleCreateInventory = () => {
    console.log('Tạo phiếu điều chỉnh tồn kho');
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

  const handleSaveMaterial = (newMaterial: Omit<IMaterial, 'id'>) => {
    setMaterials(prev => [...prev, { ...newMaterial, id: Date.now().toString() }]);
    handleBackToMaterialList();
  };

  const handleEditMaterial = (item: IMaterial) => {
    setEditingMaterial(item);
    setCurrentScreen('edit_material');
  };

  const handleUpdateMaterial = (updatedMaterial: IMaterial) => {
    setMaterials(prev =>
      prev.map(item => (item.id === updatedMaterial.id ? updatedMaterial : item))
    );
    handleBackToMaterialList();
  };

  const handleTabSelect = (tab: TabType) => {
    setSelectedTab(tab);
    if (tab !== 'history') {
      setFilterMaterialName(null);
    } else if (filterMaterialName) {
      // If manually switching to history, clear the filter to show all
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
      filterGroup === '' || filterGroup === 'Tất cả nhóm vật tư' || item.group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const filteredWarehouseList = warehouseList.filter(receipt => {
    if (!filterMaterialName) return true;
    return receipt.materials.some(m => m.materialName === filterMaterialName);
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
        availableMaterials={materials}
        onSave={data => {
          console.log('Save Warehouse Import', data);
          const newReceipt = {
            id: Date.now().toString(),
            ...data,
          };
          setWarehouseList(prev => [newReceipt, ...prev]);
          handleBackToMaterialList();
        }}
      />
    );
  }

  if (currentScreen === 'add_inventory') {
    return (
      <AddInventoryScreen
        onBack={() => setCurrentScreen('list')}
        onSave={newTicket => {
          console.log('Dữ liệu lưu:', newTicket);
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
              onAdjustmentPress={adjustmentItem => console.log('Adjustment', adjustmentItem)}
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
                contentContainerStyle={{ paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <MaterialEmptyState tab="inventory" onPress={handleCreateInventory} />
            ))}
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
  fullWidthButton: {
    width: '100%',
  },
});
