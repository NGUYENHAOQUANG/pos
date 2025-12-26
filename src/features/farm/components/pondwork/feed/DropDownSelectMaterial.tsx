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
import EmptyState from '@/assets/images/EmptyState.svg';

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
        if (isOpen && inputRef.current) {
            // Create a small delay to ensure the component is rendered before focusing
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
        if (isOpen) {
            return (
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
                        <Ionicons name="search-outline" size={18} color={colors.defaultBorder} />
                    </TouchableOpacity>
                </View>
            );
        }

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
                <View style={styles.dropdown}>
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
                                                Kho: {item.remaining ?? 0}
                                                {item.unit ? item.unit.toLowerCase() : ''}
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
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <EmptyState width={60} height={60} />
                            <Text style={styles.emptyText}>Không tìm thấy vật tư</Text>
                            <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
                                <Ionicons name="add" size={16} color={colors.primary} />
                                <Text style={styles.createButtonText}>Tạo vật tư mới</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 10, // Ensure dropdown sits on top
        width: '100%',
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
        borderColor: colors.blue ? colors.blue[600] : '#1677FF', // Use fallback or check colors.ts
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
    dropdown: {
        position: 'absolute',
        top: 54, // height 48 + 6px margin
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        padding: spacing.xs,
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
