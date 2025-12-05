import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { HeaderMeterial } from '../components/HeaderMaterial';
import { ButtonMetaerial } from '../components/ButtonMaterial';
import { HeadingMeterial, TabType } from '../components/HeadingMaterial';
import { SearchBarMeterial } from '../components/SearchBarMaterial';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { AddMaterialScreen } from './material/AddMaterialScreen';
import { EditMaterialScreen } from './material/EditMaterialScreen';
import { AddWarehouseScreen } from './warehouse/AddWarehouseScreen';
import { WarehouseListScreen } from './warehouse/WarehouseListScreen';
import { MaterialList } from '../components/material/MaterialList';
import { spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

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
  const [inventoryList, setInventoryList] = useState<InventoryTicket[]>([]);
  const [warehouseList, setWarehouseList] = useState<any[]>([]);

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

  const handleSaveMaterial = (newMaterial: any) => {
    setMaterials(prev => [...prev, { ...newMaterial, id: Date.now().toString() }]);
    handleBackToMaterialList();
  };

  const handleEditMaterial = (item: any) => {
    setEditingMaterial(item);
    setCurrentScreen('edit_material');
  };

  const handleUpdateMaterial = (updatedMaterial: any) => {
    setMaterials(prev =>
      prev.map(item => (item.id === updatedMaterial.id ? updatedMaterial : item))
    );
    handleBackToMaterialList();
  };

  const filteredMaterials = materials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesGroup =
      filterGroup === '' || filterGroup === 'Tất cả nhóm vật tư' || item.group === filterGroup;
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
        onSave={data => {
          // Logic lưu phiếu
          console.log('Dữ liệu lưu:', data);

          const newTicket: InventoryTicket = {
            id: Date.now().toString(),
            checkerName: 'Nguyễn Phương Duy',
            date: data.date,
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
          {selectedTab === 'list' &&
            (materials.length > 0 ? (
              <FlatList
                data={filteredMaterials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <MaterialList
                    item={item}
                    onEdit={handleEditMaterial}
                    onHistoryPress={historyItem => console.log('History', historyItem)}
                    onAdjustmentPress={adjustmentItem => console.log('Adjustment', adjustmentItem)}
                  />
                )}
                contentContainerStyle={{ paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <EmptyStateCard
                message="Chưa có vật tư nào được thêm."
                buttonTitle="Thêm vật tư"
                onPress={handleAddMaterial}
              />
            ))}
          {selectedTab === 'history' &&
            (warehouseList.length > 0 ? (
              <WarehouseListScreen receipts={warehouseList} />
            ) : (
              <EmptyStateCard
                message="Chưa có phiếu nhập kho nào được tạo."
                buttonTitle="Tạo phiếu nhập kho"
                onPress={handleCreateImport}
              />
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
              <EmptyStateCard
                message="Chưa có phiếu điều chỉnh tồn kho nào được tạo."
                buttonTitle="Tạo Phiếu Điều Chỉnh Tồn Kho"
                onPress={handleCreateInventory}
                buttonStyle={styles.fullWidthButton}
              />
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
