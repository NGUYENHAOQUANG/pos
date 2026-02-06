import { useCallback } from 'react';
import { useMaterialStore } from '@/features/material/store';

export const useMaterialFilterLogic = () => {
    // Search & Filter State from Store
    const selectedTab = useMaterialStore(state => state.selectedTab);
    const searchText = useMaterialStore(state => state.searchText);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const filterType = useMaterialStore(state => state.filterType);
    const filterGroup = useMaterialStore(state => state.filterGroup);
    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);

    // Actions
    const setSearchText = useMaterialStore(state => state.setSearchText);
    const setFilterType = useMaterialStore(state => state.setFilterType);
    const setFilterGroup = useMaterialStore(state => state.setFilterGroup);
    const setFilterMaterialName = useMaterialStore(state => state.setFilterMaterialName);
    const setImportReceiptStatusFilter = useMaterialStore(
        state => state.setImportReceiptStatusFilter
    );

    const handleSearch = useCallback(
        (text: string) => {
            setSearchText(text);
        },
        [setSearchText]
    );

    const handleFilterType = useCallback(
        (value: string) => {
            if (selectedTab === 'list') {
                setFilterGroup(value);
            } else {
                setFilterType(value);
            }
        },
        [selectedTab, setFilterGroup, setFilterType]
    );

    const handleFilterStatus = useCallback(
        (status: string) => {
            setImportReceiptStatusFilter(status);
        },
        [setImportReceiptStatusFilter]
    );

    const handleFilterPress = useCallback(() => {}, []);

    const clearFilters = useCallback(() => {
        setFilterType('');
        setFilterGroup('');
        setImportReceiptStatusFilter('');
        setFilterMaterialName(null);
    }, [setFilterType, setFilterGroup, setImportReceiptStatusFilter, setFilterMaterialName]);

    // Derive the current filter value for the UI dropdown
    const currentFilterValue = selectedTab === 'list' ? filterGroup : filterType;

    return {
        // State
        searchText,
        filterType,
        filterGroup,
        filterMaterialName,
        currentStatus: importReceiptStatusFilter,
        currentFilterValue, // Exposed for UI

        // Handlers
        handleSearch,
        handleFilterType,
        handleFilterStatus,
        handleFilterPress,
        clearFilters,

        // Raw Setters (try to use handlers instead)
        setSearchText,
        setFilterType,
        setFilterGroup,
        setFilterMaterialName,
        setImportReceiptStatusFilter,
    };
};
