/**
 * @file SelectProductBottomSheet.tsx
 * @description Bottom sheet for browsing and selecting a product from material list
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    FlatList,
    TextInput,
    TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SelectProductBottomSheetProps {
    /** Whether the bottom sheet is visible */
    visible: boolean;
    /** Callback when bottom sheet is closed */
    onClose: () => void;
    /** Callback when a product is selected */
    onSelect: (material: IMaterial) => void;
    /** Available materials list */
    materials: IMaterial[];
}

export const SelectProductBottomSheet: React.FC<SelectProductBottomSheetProps> = ({
    visible,
    onClose,
    onSelect,
    materials,
}) => {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef<TextInput>(null);

    // Filter materials based on search text
    const filteredMaterials = useMemo(() => {
        const trimmed = searchText.trim().toLowerCase();
        if (!trimmed) return materials;
        return materials.filter(item => item.name.toLowerCase().includes(trimmed));
    }, [materials, searchText]);

    // Slide-up animation
    useEffect(() => {
        if (visible) {
            slideAnim.setValue(SCREEN_HEIGHT);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
            // Focus search input after animation
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 300);
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    // Reset search when closing
    useEffect(() => {
        if (!visible) {
            setSearchText('');
        }
    }, [visible]);

    const handleSelect = (item: IMaterial) => {
        onSelect(item);
        onClose();
    };

    const renderItem = ({ item }: { item: IMaterial }) => {
        const stockText = `Kho ${item.remaining ?? 0} ${
            item.unitName ? String(item.unitName).toLowerCase() : ''
        }`;

        return (
            <TouchableOpacity
                style={styles.itemRow}
                onPress={() => handleSelect(item)}
                activeOpacity={0.6}
            >
                <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.itemStock}>{stockText}</Text>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <EmptyStateIcon width={60} height={60} />
            <Text style={styles.emptyText}>Không tìm thấy vật tư</Text>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Chọn loại sản phẩm</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.closeButton}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <CloseIcon width={16} height={16} />
                                </TouchableOpacity>
                            </View>

                            {/* Search Input */}
                            <View style={styles.searchContainer}>
                                <Ionicons
                                    name="search-outline"
                                    size={18}
                                    color={colors.textSecondary}
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    ref={searchInputRef}
                                    style={styles.searchInput}
                                    placeholder="Tìm vật tư"
                                    placeholderTextColor={colors.textTertiary}
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                            </View>

                            {/* Material List */}
                            <FlatList
                                data={filteredMaterials}
                                keyExtractor={item => item.id}
                                renderItem={renderItem}
                                ListEmptyComponent={renderEmpty}
                                style={styles.list}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: 40,
        maxHeight: SCREEN_HEIGHT * 0.7,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    closeButton: {
        marginLeft: spacing.sm,
        padding: spacing.xs,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: colors.white,
        marginBottom: spacing.md,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        padding: 0,
    },
    list: {
        flexGrow: 0,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    itemName: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
    },
    itemStock: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: spacing.sm,
        fontSize: 14,
        color: colors.textSecondary,
    },
});
