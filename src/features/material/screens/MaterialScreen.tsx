import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ZoneHeader } from '@/features/material/components/ZoneHeader';
import {
    ButtonMetaerial,
    MaterialMenuOverlay,
} from '@/features/material/components/ButtonMaterial';
import { HeadingMeterial } from '@/features/material/components/HeadingMaterial';
import { SearchBarMeterial } from '@/features/material/components/SearchBarMaterial';
import { ImportReceiptList } from '@/features/material/screens/importReceiptList/ImportReceiptList';
import { ExportWarehouseListScreen } from '@/features/material/screens/exportWarehouseList/ExportWarehouseListScreen';
import { WarehouseItemListScreen } from '@/features/material/screens/warehouseItem/WarehouseItemListScreen';
import { MaterialMasterListTab } from '@/features/material/screens/materialList/MaterialMasterListTab';
import { InventoryScreen } from '@/features/material/screens/inventoryList/InventoryList';
import { colors } from '@/styles';
import { useMaterialScreenLogic } from '@/features/material/hooks/logic/useMaterialScreenLogic';

export const MeterialScreen = () => {
    const {
        selectedTab,
        dropdownData,
        selectedDropdownItem,
        menuOpen,
        menuPosition,
        currentStatus,
        currentFilterValue,
        handleDropdownSelect,
        handleShowMenu,
        handleCloseMenu,
        handleSearch,
        handleFilterType,
        handleFilterStatus,
        handleFilterPress,
        handleTabSelect,
        handleHistoryPress,
        actions,
    } = useMaterialScreenLogic();

    return (
        <View style={styles.container}>
            <View style={{ zIndex: 1000, elevation: 10 }}>
                <ZoneHeader
                    dropdownData={dropdownData}
                    dropdownValue={selectedDropdownItem}
                    onDropdownSelect={handleDropdownSelect}
                    dropdownPlaceholder="Chọn kho"
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
                onStatusChange={handleFilterStatus}
                selectedTab={selectedTab}
                currentStatus={currentStatus || undefined}
                currentFilterValue={currentFilterValue || undefined}
            />

            <View style={styles.content}>
                {selectedTab === 'material' && (
                    <MaterialMasterListTab onPressCreate={actions.createMaterial} />
                )}
                {selectedTab === 'list' && (
                    <WarehouseItemListScreen
                        onEdit={actions.editMaterial}
                        onHistoryPress={handleHistoryPress}
                        onPressCreate={actions.createMaterial}
                    />
                )}
                {selectedTab === 'history' && (
                    <ImportReceiptList onPressCreate={actions.createImport} />
                )}
                {selectedTab === 'export' && (
                    <ExportWarehouseListScreen onPressCreate={actions.createExport} />
                )}
                {selectedTab === 'inventory' && (
                    <InventoryScreen onPressCreate={actions.createInventory} />
                )}
            </View>

            <MaterialMenuOverlay
                isOpen={menuOpen}
                buttonPosition={menuPosition}
                onClose={handleCloseMenu}
                onPressCreateImport={actions.createImport}
                onPressCreateExport={actions.createExport}
                onPressCreateAdjustment={actions.createInventory}
                onPressCreateMaterial={actions.createMaterial}
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
    },
    fullWidthButton: {
        width: '100%',
    },
});
