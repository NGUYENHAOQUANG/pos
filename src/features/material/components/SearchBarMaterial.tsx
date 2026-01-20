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
import { useMaterialTypes } from '@/features/material/hooks';
import { useMaterialsStore } from '@/features/material/store/materialsStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SearchBarMeterialProps {
    onSearch?: (text: string) => void;
    onFilterPress?: () => void;
    selectedTab?: TabType;
    onGroupChange?: (group: string) => void;
}

export const SearchBarMeterial: React.FC<SearchBarMeterialProps> = ({
    onSearch,
    onFilterPress: _onFilterPress,
    selectedTab = 'list',
    onGroupChange,
}) => {
    const [searchText, setSearchText] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Dropdown states
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const [voteStatus, setVoteStatus] = useState('');

    // Get filterType from store to sync with selected value
    const filterType = useMaterialsStore(state => state.filterType);
    const [materialGroup, setMaterialGroup] = useState(filterType || '');

    // Get material types from React Query
    const { data: materialTypes = [], isLoading: isLoadingMaterialTypes } = useMaterialTypes();

    // Get dropdown options from material types
    const materialTypeOptions = [
        'Tất cả loại vật tư',
        ...materialTypes.map(t => t.name || '').filter(n => n),
    ];

    // Sync materialGroup with filterType from store
    useEffect(() => {
        if (filterType !== materialGroup) {
            setMaterialGroup(filterType || '');
        }
    }, [filterType, materialGroup]);

    const handleToggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const handleClearSearch = () => {
        setSearchText('');
        onSearch?.('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color={colors.textSecondary || '#999'}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm tên vật tư"
                        placeholderTextColor={colors.textSecondary || '#999'}
                        value={searchText}
                        onChangeText={text => {
                            setSearchText(text);
                            onSearch?.(text);
                        }}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <Ionicons
                                name="close-circle"
                                size={18}
                                color={colors.textSecondary || '#999'}
                            />
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
                        color={isExpanded ? colors.primary : colors.text || '#333'}
                    />
                </TouchableOpacity>
            </View>

            {isExpanded && (
                <View style={styles.expandedContent}>
                    {selectedTab === 'history' && (
                        <View style={styles.dropdownWrapper}>
                            <DropdownMaterial
                                value={voteStatus}
                                onChange={setVoteStatus}
                                options={['Hoàn thành', 'Lưu nháp']}
                                placeholder="Trạng thái"
                                isOpen={isStatusDropdownOpen}
                                onToggle={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                useAutoScroll={true}
                                showAllOption={false}
                            />
                        </View>
                    )}
                    <View style={styles.dropdownWrapper}>
                        <DropdownMaterial
                            value={materialGroup}
                            onChange={value => {
                                setMaterialGroup(value);
                                onGroupChange?.(value);
                            }}
                            options={materialTypeOptions}
                            isOpen={isGroupDropdownOpen}
                            onToggle={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                            useAutoScroll={selectedTab === 'history'}
                            disabled={isLoadingMaterialTypes}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        paddingBottom: spacing.xs,
        backgroundColor: '#F0F5FF',
        zIndex: 1, // Lower than header so popup can show above
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
