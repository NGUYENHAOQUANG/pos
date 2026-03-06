import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ZoneHeader } from '@/features/material/components/material/ZoneHeader';
import {
    ButtonMetaerial,
    MaterialMenuOverlay,
} from '@/features/material/components/material/ButtonMaterial';
import { HeadingBar } from '@/shared/components/layout/HeadingBar';
import { SearchBarMeterial } from '@/features/material/components/material/SearchBarMaterial';
import { ImportReceiptList } from '@/features/material/screens/import_receipt_list/ImportReceiptList';
import { ExportWarehouseListScreen } from '@/features/material/screens/export_warehouse_list/ExportWarehouseListScreen';
import { WarehouseItemListScreen } from '@/features/material/screens/warehouse_item/WarehouseItemListScreen';
import { MaterialMasterListTab } from '@/features/material/screens/material_list/MaterialMasterListTab';
import { InventoryScreen } from '@/features/material/screens/inventory_list/InventoryList';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { colors } from '@/styles';

export enum TabType {
    Warehouse = 'warehouse',
    Import = 'import',
    Export = 'export',
    Inventory = 'inventory',
    Material = 'material',
}

export interface MaterialViewProps {
    selectedTab: TabType;
    dropdownData: DropDownItem[];
    selectedDropdownItem: DropDownItem;
    menuOpen: boolean;
    menuPosition: { x: number; y: number; width: number; height: number };
    currentStatus?: string;
    currentFilterValue?: string;
    handleDropdownSelect: (item: DropDownItem) => void;
    handleShowMenu: (position: { x: number; y: number; width: number; height: number }) => void;
    handleCloseMenu: () => void;
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

export const MaterialView: React.FC<MaterialViewProps> = ({
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
}) => {
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
            <HeadingBar
                tabs={[
                    { key: TabType.Material, label: 'Danh sách vật tư' },
                    { key: TabType.Warehouse, label: 'Danh sách tồn kho' },
                    { key: TabType.Import, label: 'Lịch sử nhập kho' },
                    { key: TabType.Export, label: 'Lịch sử xuất kho' },
                    { key: TabType.Inventory, label: 'Kiểm kê' },
                ]}
                selectedTab={selectedTab}
                onTabSelect={key => handleTabSelect(key as TabType)}
                flexTabs={false}
            />
            <SearchBarMeterial
                onSearch={handleSearch}
                onFilterPress={handleFilterPress}
                onGroupChange={handleFilterType}
                onStatusChange={handleFilterStatus}
                selectedTab={selectedTab}
                currentStatus={currentStatus}
                currentFilterValue={currentFilterValue}
            />

            <View style={styles.content}>
                {selectedTab === TabType.Material && <MaterialMasterListTab />}
                {selectedTab === TabType.Warehouse && (
                    <WarehouseItemListScreen
                        onHistoryPress={handleHistoryPress}
                        onPressCreate={actions.createMaterial}
                    />
                )}
                {selectedTab === TabType.Import && <ImportReceiptList />}
                {selectedTab === TabType.Export && <ExportWarehouseListScreen />}
                {selectedTab === TabType.Inventory && <InventoryScreen />}
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
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
});
