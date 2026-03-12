import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { DropdownMaterial } from '@/features/material/components/DropdownMaterial';
import { TabType } from '@/features/material/screens/material/MaterialView';
import { useMaterialTypes, useMaterialGroups } from '@/features/material/hooks';
import { ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Input } from '@/shared/components/forms/Input';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SearchBarMeterialProps {
    onSearch?: (text: string) => void;
    onFilterPress?: () => void;
    selectedTab?: TabType;
    onGroupChange?: (group: string) => void;
    onStatusChange?: (status: string) => void;
    currentStatus?: string;
    currentFilterValue?: string;
}

export const SearchBarMeterial: React.FC<SearchBarMeterialProps> = ({
    onSearch,
    onFilterPress: _onFilterPress,
    selectedTab = TabType.Warehouse,
    onGroupChange,
    onStatusChange,
    currentStatus = '',
    currentFilterValue = '',
}) => {
    const [localSearchText, setLocalSearchText] = useState('');
    const debouncedSearchText = useDebounce(localSearchText, 500);

    // Sync debounce value to parent/store
    useEffect(() => {
        onSearch?.(debouncedSearchText);
    }, [debouncedSearchText, onSearch]);

    const [isExpanded, setIsExpanded] = useState(false);

    // Dropdown states
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const [voteStatus, setVoteStatus] = useState(currentStatus);

    useEffect(() => {
        setVoteStatus(currentStatus);
    }, [currentStatus]);

    // Get material types from React Query
    const { data: materialTypes = [], isLoading: isLoadingMaterialTypes } = useMaterialTypes();
    const { data: materialGroups = [], isLoading: isLoadingMaterialGroups } = useMaterialGroups();

    // Get dropdown options based on selectedTab
    const dropdownOptions = React.useMemo(() => {
        if (selectedTab === TabType.Warehouse) {
            // Use Material Groups for warehouse tab
            return [
                { label: 'Tất cả nhóm vật tư', value: '' },
                ...materialGroups.map(g => ({
                    label: g.name || '',
                    value: g.id,
                })),
            ];
        }

        const uniqueTypes = new Map();
        materialTypes.forEach(t => {
            if (t.name && !uniqueTypes.has(t.name)) {
                uniqueTypes.set(t.name, t);
            }
        });

        const options = Array.from(uniqueTypes.values()).map(t => ({
            label: t.name || '',
            value: t.id,
        }));

        return [{ label: 'Tất cả loại vật tư', value: '' }, ...options];
    }, [selectedTab, materialTypes, materialGroups]);

    const handleToggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const handleClearSearch = () => {
        setLocalSearchText('');
        // onSearch will be called by effect when debounced value updates to empty
    };

    // Status options for import receipts
    const statusOptions = React.useMemo(
        () => [
            { label: 'Tất cả trạng thái', value: '' },
            { label: 'Chờ duyệt', value: ImportReceiptStatus.Pending },
            { label: 'Lưu nháp', value: ImportReceiptStatus.Draft },
            { label: 'Hoàn thành', value: ImportReceiptStatus.Approved },
            { label: 'Từ chối', value: ImportReceiptStatus.Rejected },
        ],
        []
    );

    const isLoading =
        selectedTab === TabType.Warehouse ? isLoadingMaterialGroups : isLoadingMaterialTypes;
    const placeholder = isLoading
        ? 'Đang tải dữ liệu...'
        : selectedTab === TabType.Warehouse
        ? 'Tất cả nhóm vật tư'
        : 'Tất cả loại vật tư';

    const isValueInOptions = React.useMemo(() => {
        if (!currentFilterValue) return true;
        return dropdownOptions.some(opt => opt.value === currentFilterValue);
    }, [currentFilterValue, dropdownOptions]);

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.searchInputWrapper}>
                    <Input
                        icon="search-outline"
                        placeholder="Tìm kiếm tên vật tư"
                        value={localSearchText}
                        onChangeText={setLocalSearchText}
                        iconRight={localSearchText.length > 0 ? 'close-circle' : undefined}
                        onIconPress={handleClearSearch}
                        containerStyle={styles.inputContainer}
                        inputContainerStyle={styles.inputInnerContainer}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.moreButton, isExpanded && styles.moreButtonActive]}
                    onPress={handleToggleExpand}
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color={isExpanded ? colors.primary : colors.text}
                    />
                </TouchableOpacity>
            </View>

            {isExpanded && (
                <View style={styles.expandedContent}>
                    {(selectedTab === TabType.Import ||
                        selectedTab === TabType.Export ||
                        selectedTab === TabType.Inventory) && (
                        <View style={styles.dropdownWrapper}>
                            <DropdownMaterial
                                value={voteStatus}
                                onChange={status => {
                                    setVoteStatus(status);
                                    onStatusChange?.(status);
                                }}
                                options={statusOptions}
                                placeholder="Trạng thái"
                                isOpen={isStatusDropdownOpen}
                                onToggle={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                useAutoScroll={true}
                                showAllOption={false}
                            />
                        </View>
                    )}
                    {(selectedTab === TabType.Warehouse || selectedTab === TabType.Material) && (
                        <View style={styles.dropdownWrapper}>
                            <DropdownMaterial
                                value={isLoading || !isValueInOptions ? '' : currentFilterValue}
                                onChange={value => {
                                    onGroupChange?.(value);
                                }}
                                options={dropdownOptions}
                                isOpen={isGroupDropdownOpen}
                                onToggle={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                                useAutoScroll={true}
                                placeholder={placeholder}
                                disabled={isLoading}
                            />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        backgroundColor: colors.backgroundPrimary,
        zIndex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    searchInputWrapper: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputInnerContainer: {
        height: 44,
        borderRadius: 12,
    },
    moreButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    moreButtonActive: {
        borderColor: colors.primary,
        backgroundColor: '#E6F7FF', // Light blue background when active
    },
    expandedContent: {
        marginTop: spacing.md,
        flexDirection: 'row',
        gap: spacing.md,
        zIndex: 100,
    },
    dropdownWrapper: {
        flex: 1,
        zIndex: 100,
    },
});
