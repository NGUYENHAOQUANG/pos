import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ZoneHeader } from '@/features/material/components/ZoneHeader';
import {
    ButtonMetaerial,
    MaterialMenuOverlay,
} from '@/features/material/components/ButtonMaterial';
import { HeadingMeterial } from '@/features/material/components/HeadingMaterial';
import { SearchBarMeterial } from '@/features/material/components/SearchBarMaterial';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { ImportReceiptList } from '@/features/material/components/importReceipt/ImportReceiptList';
import { ExportWarehouseListScreen } from '@/features/material/screens/warehouse/ExportWarehouseListScreen';
import { MaterialListScreen } from '@/features/material/screens/material/MaterialListScreen';
import { MaterialMasterListTab } from '@/features/material/screens/material/MaterialMasterListTab';
import { InventoryScreen } from '@/features/material/screens/inventory/InventoryScreen';
import { colors, spacing } from '@/styles';
import { useMaterialScreenLogic } from '@/features/material/hooks/useMaterialScreenLogic';

export const MeterialScreen = () => {
    const {
        selectedTab,
        dropdownData,
        selectedDropdownItem,
        menuOpen,
        menuPosition,
        currentStatus,
        materials,
        importReceiptsData,
        mappedExportReceipts,
        inventoryList,
        showSkeleton,
        isLoadingImportReceipts,
        isLoadingExportWarehouse,
        isLoadingInventory,
        isRefetchingWarehouseItems,
        isRefetchingImportReceipts,
        isRefetchingExportWarehouse,
        isRefetchingInventory,
        handleDropdownSelect,
        handleShowMenu,
        handleCloseMenu,
        handleSearch,
        handleFilterType,
        handleFilterStatus,
        handleFilterPress,
        handleTabSelect,
        handleHistoryPress,
        handleAdjustmentPress,
        handleRefresh,
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
                currentStatus={currentStatus}
            />

            <View style={styles.content}>
                {selectedTab === 'material' && (
                    <MaterialMasterListTab
                        onPressCreate={actions.createMaterial}
                        onEdit={actions.editMaterial}
                        onHistoryPress={handleHistoryPress}
                        onAdjustmentPress={handleAdjustmentPress}
                    />
                )}
                {selectedTab === 'list' && (
                    <MaterialListScreen
                        materials={materials}
                        onEdit={actions.editMaterial}
                        onHistoryPress={handleHistoryPress}
                        onAdjustmentPress={handleAdjustmentPress}
                        isLoading={showSkeleton}
                        refreshing={!!isRefetchingWarehouseItems}
                        onRefresh={handleRefresh}
                        onPressCreate={actions.createMaterial}
                    />
                )}
                {selectedTab === 'history' && (
                    <ImportReceiptList
                        data={importReceiptsData}
                        isLoading={isLoadingImportReceipts}
                        refreshing={!!isRefetchingImportReceipts}
                        onRefresh={handleRefresh}
                        onPressCreate={actions.createImport}
                    />
                )}
                {selectedTab === 'export' &&
                    (isLoadingExportWarehouse ? (
                        <ExportWarehouseListScreen receipts={[]} isLoading={true} />
                    ) : mappedExportReceipts.length > 0 ? (
                        <ExportWarehouseListScreen
                            receipts={mappedExportReceipts}
                            refreshing={!!isRefetchingExportWarehouse}
                            onRefresh={handleRefresh}
                        />
                    ) : (
                        <MaterialEmptyState tab="history" onPress={actions.createImport} />
                    ))}
                {selectedTab === 'inventory' && (
                    <InventoryScreen
                        data={inventoryList}
                        isLoading={isLoadingInventory || isRefetchingInventory}
                        refreshing={!!isRefetchingInventory}
                        onRefresh={handleRefresh}
                        onPressCreate={actions.createInventory}
                    />
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
        marginTop: spacing.md,
    },
    fullWidthButton: {
        width: '100%',
    },
});
