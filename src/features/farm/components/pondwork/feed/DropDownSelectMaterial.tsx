import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';

interface DropDownSelectMaterialProps {
    data: IMaterial[];
    selectedItem?: IMaterial;
    onSelect: (item: IMaterial) => void;
    placeholder?: string;
    onCreateNew?: () => void;
    onImportMore?: (item: IMaterial) => void;
}

export const DropDownSelectMaterial: React.FC<DropDownSelectMaterialProps> = ({
    data,
    selectedItem,
    onSelect,
    placeholder = 'Chọn',
    onCreateNew,
    onImportMore,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const inputRef = useRef<TextInput>(null);

    // Filter data based on search text
    const filteredData = useMemo(() => {
        if (!searchText) return data;
        const lowerSearch = searchText.toLowerCase();
        return data.filter(item => item.name.toLowerCase().includes(lowerSearch));
    }, [data, searchText]);

    useEffect(() => {
        if (isOpen) {
            // Focus input after dropdown opens
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleSelect = (item: IMaterial) => {
        onSelect(item);
        setIsOpen(false);
        setSearchText('');
    };

    const handleCreateNew = () => {
        setIsOpen(false);
        onCreateNew?.();
    };

    // Render the input trigger
    const renderTrigger = () => {
        // If open, we hide the trigger visually, effectively replaced by the dropdown input
        // But we keep it rendered to maintain layout height if needed,
        // OR simply let the absolute dropdown sit on top.
        // Since the dropdown wrapper is absolute, the trigger remains in flow underneath.
        return (
            <TouchableOpacity
                style={styles.triggerContainer}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.triggerText, !selectedItem && styles.placeholderText]}>
                    {selectedItem ? selectedItem.name : placeholder}
                </Text>
                <Ionicons name="chevron-down-outline" size={18} color={colors.defaultBorder} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {renderTrigger()}

            {isOpen && (
                <>
                    {/* Backdrop to close on outside press */}
                    <TouchableOpacity
                        style={styles.overlayBackdrop}
                        activeOpacity={1}
                        onPress={() => setIsOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <View style={styles.dropdownWrapper}>
                        {/* Search Input (Replaces Trigger visual) */}
                        <View style={[styles.triggerContainer, styles.triggerOpen]}>
                            <TextInput
                                ref={inputRef}
                                style={styles.input}
                                placeholder={placeholder}
                                placeholderTextColor={colors.gray[400]}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Ionicons
                                    name="search-outline"
                                    size={18}
                                    color={colors.defaultBorder}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* List Content */}
                        <View style={styles.dropdownListContainer}>
                            {filteredData.length > 0 ? (
                                <FlatList
                                    data={filteredData}
                                    keyExtractor={item => item.id}
                                    renderItem={({ item }) => {
                                        const isOutOfStock =
                                            item.remaining === 0 || item.remaining === undefined;
                                        return (
                                            <TouchableOpacity
                                                style={styles.item}
                                                onPress={() => handleSelect(item)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.itemName,
                                                        isOutOfStock && styles.textDisabled,
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {item.name}
                                                </Text>
                                                <View style={styles.stockContainer}>
                                                    <Text
                                                        style={[
                                                            styles.itemStock,
                                                            isOutOfStock && styles.textDisabled,
                                                        ]}
                                                    >
                                                        Kho: {item.remaining ?? 0}{' '}
                                                        {item.unitName
                                                            ? String(item.unitName).toLowerCase()
                                                            : ''}
                                                    </Text>
                                                    {isOutOfStock && (
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setIsOpen(false);
                                                                onImportMore?.(item);
                                                            }}
                                                            hitSlop={{
                                                                top: 10,
                                                                bottom: 10,
                                                                left: 10,
                                                                right: 10,
                                                            }}
                                                        >
                                                            <Text style={styles.importMore}>
                                                                . Nhập thêm
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                    style={styles.list}
                                    keyboardShouldPersistTaps="handled"
                                    nestedScrollEnabled={true}
                                />
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <EmptyStateIcon width={60} height={60} />
                                    <Text style={styles.emptyText}>Không tìm thấy vật tư</Text>
                                    <TouchableOpacity
                                        style={styles.createButton}
                                        onPress={handleCreateNew}
                                    >
                                        <Ionicons name="add" size={16} color={colors.primary} />
                                        <Text style={styles.createButtonText}>Tạo vật tư mới</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 10, // Ensure dropdown sits on top within its local context
        width: '100%',
        position: 'relative',
    },
    overlayBackdrop: {
        position: 'absolute',
        top: -1000,
        left: -1000,
        right: -1000,
        bottom: -1000,
        zIndex: 1,
        // backgroundColor: 'rgba(0,0,0,0.1)', // Optional debug color
    },
    dropdownWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 2,
    },
    triggerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: colors.white,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    triggerOpen: {
        borderColor: colors.blue ? colors.blue[600] : '#1677FF',
    },
    triggerText: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    placeholderText: {
        color: colors.textSecondary,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        padding: 0, // Reset default padding
        marginRight: spacing.sm,
    },
    dropdownListContainer: {
        marginTop: 4,
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: colors.defaultBorder,
        maxHeight: 300,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    list: {
        maxHeight: 250,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    itemName: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemStock: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    textDisabled: {
        color: colors.gray[400],
    },
    importMore: {
        fontSize: 12,
        color: colors.primary,
        marginLeft: 2,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: spacing.sm,
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    createButtonText: {
        fontSize: 14,
        color: colors.primary,
        marginLeft: 4,
        fontWeight: '500',
    },
});
