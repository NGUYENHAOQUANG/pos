import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { DropdownMaterial } from '@/features/material/components/material/DropdownMaterialGroup';
import { TabType } from '@/features/material/components/HeadingMaterial';
import { useMaterialTypes, useMaterialGroups } from '@/features/material/hooks';
import { ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { useDebounce } from '@/shared/hooks/useDebounce';

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
    selectedTab = 'list',
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
        if (selectedTab === 'list') {
            // Use Material Groups for 'list' tab
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

    const isLoading = selectedTab === 'list' ? isLoadingMaterialGroups : isLoadingMaterialTypes;
    const placeholder = isLoading
        ? 'Đang tải dữ liệu...'
        : selectedTab === 'list'
        ? 'Tất cả nhóm vật tư'
        : 'Tất cả loại vật tư';

    const isValueInOptions = React.useMemo(() => {
        if (!currentFilterValue) return true;
        return dropdownOptions.some(opt => opt.value === currentFilterValue);
    }, [currentFilterValue, dropdownOptions]);

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color={colors.textSecondary}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm"
                        placeholderTextColor={colors.textSecondary}
                        value={localSearchText}
                        onChangeText={setLocalSearchText}
                    />
                    {localSearchText.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.moreButton, isExpanded && styles.moreButtonActive]}
                    onPress={handleToggleExpand}
                >
                    <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color={isExpanded ? colors.primary : colors.text}
                    />
                </TouchableOpacity>
            </View>

            {isExpanded && (
                <View style={styles.expandedContent}>
                    {(selectedTab === 'history' ||
                        selectedTab === 'export' ||
                        selectedTab === 'inventory') && (
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
                    {(selectedTab === 'list' || selectedTab === 'material') && (
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
        backgroundColor: '#F0F5FF',
        zIndex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm,
    },
    searchIcon: {
        marginRight: spacing.xs,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: colors.text,
        padding: 0, // Remove default padding on Android
    },
    moreButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
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
        marginBottom: spacing['2xl'],
        flexDirection: 'row',
        gap: spacing.md,
        zIndex: 100, // Ensure dropdowns sit on top
    },
    dropdownWrapper: {
        flex: 1,
        zIndex: 100,
    },
});
