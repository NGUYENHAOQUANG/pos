import React, { useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    ViewStyle,
    FlatList,
    Modal,
    ActivityIndicator,
    Dimensions,
    Keyboard,
    RefreshControl,
} from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '@/styles';
import { AutoScrollText } from '@/shared/components/ui/AutoScrollText';
import { RequiredDot } from '@/shared/components/forms/Input';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import type { InfiniteDropdownItem } from '@/shared/hooks/useInfiniteDropdown';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fixed list height = modal maxHeight minus header/search/padding
const LIST_HEIGHT = SCREEN_HEIGHT * 0.8 - 160;

// ────────────────────────────── Types ──────────────────────────────

export interface InfiniteScrollDropdownProps<T extends InfiniteDropdownItem> {
    /** Currently selected item ID */
    value?: string;
    /** Display value override (e.g. from parent) */
    displayValue?: string;
    /** Callback when an item is selected */
    onSelect?: (id: string, item: T) => void;

    /** Label text above the dropdown */
    label?: string | React.ReactNode;
    /** Whether the field is required */
    required?: boolean;
    /** Placeholder text when no value is selected */
    placeholder?: string;
    /** Whether dropdown is disabled */
    disabled?: boolean;
    /** Additional style for the trigger button */
    buttonStyle?: ViewStyle;
    /** Use auto-scroll text for long names */
    useAutoScroll?: boolean;

    /** Modal title (defaults to label if string) */
    modalTitle?: string;
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Empty state text */
    emptyText?: string;

    // ─── Data props (from hook / parent) ───
    /** Whether the modal is open */
    isOpen: boolean;
    /** Open the modal */
    onOpen: () => void;
    /** Close the modal */
    onClose: () => void;
    /** Current search text */
    searchText: string;
    /** Handle search text change */
    onSearchChange: (text: string) => void;
    /** Clear search */
    onClearSearch: () => void;

    /** Flat list of items to display */
    items: T[];
    /** Whether the initial load is in progress */
    isLoading?: boolean;
    /** Whether the next page is being fetched */
    isFetchingNextPage?: boolean;
    /** Whether there is a next page */
    hasNextPage?: boolean;
    /** Fetch the next page */
    fetchNextPage?: () => void;

    /** Custom render for each item row (optional) */
    renderItemContent?: (item: T, isSelected: boolean) => React.ReactElement;

    /** Whether the list is currently refreshing */
    refreshing?: boolean;
    /** Callback when pull-to-refresh is triggered */
    onRefresh?: () => void;
}

// ────────────────────────────── Component ──────────────────────────────

function InfiniteScrollDropdownInner<T extends InfiniteDropdownItem>(
    props: InfiniteScrollDropdownProps<T>
) {
    const {
        value,
        displayValue,
        onSelect,
        label,
        required,
        placeholder = 'Chọn...',
        disabled = false,
        buttonStyle,
        useAutoScroll: useAutoScrollProp = false,
        modalTitle,
        searchPlaceholder = 'Tìm kiếm...',
        emptyText = 'Không tìm thấy kết quả',
        isOpen,
        onOpen,
        onClose,
        searchText,
        onSearchChange,
        onClearSearch,
        items,
        isLoading = false,
        isFetchingNextPage = false,
        hasNextPage = false,
        fetchNextPage,
        renderItemContent,
        refreshing = false,
        onRefresh,
    } = props;

    // Derive display label
    const selectedItem = items.find(item => item.id === value);
    const currentLabel = displayValue || selectedItem?.name || '';

    const handleOpen = useCallback(() => {
        if (disabled) return;
        onOpen();
    }, [disabled, onOpen]);

    const handleSelect = useCallback(
        (item: T) => {
            onSelect?.(item.id, item);
            onClose();
        },
        [onSelect, onClose]
    );

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage?.();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ─── Render helpers ───

    const renderItem = useCallback(
        ({ item }: { item: T }) => {
            const isSelected = item.id === value;
            if (renderItemContent) {
                return (
                    <TouchableOpacity
                        style={styles.itemRow}
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.6}
                    >
                        {renderItemContent(item, isSelected)}
                    </TouchableOpacity>
                );
            }
            return (
                <TouchableOpacity
                    style={styles.itemRow}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.6}
                >
                    <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            );
        },
        [value, handleSelect, renderItemContent]
    );

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.primaryOrange} />
            </View>
        );
    }, [isFetchingNextPage]);

    const renderEmpty = useCallback(() => {
        if (isLoading) {
            return (
                <View style={styles.skeletonContainer}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <View key={i} style={styles.skeletonRow}>
                            <Skeleton
                                width={`${55 + (i % 3) * 15}%`}
                                height={14}
                                borderRadius={6}
                            />
                        </View>
                    ))}
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <EmptyStateIcon width={60} height={60} />
                <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
        );
    }, [isLoading, emptyText]);

    const renderButtonContent = () => {
        if (useAutoScrollProp && currentLabel) {
            return (
                <AutoScrollText
                    text={currentLabel}
                    key={`${value}-${currentLabel}`}
                    style={{
                        ...StyleSheet.flatten(styles.text),
                        flex: undefined,
                    }}
                    containerStyle={{ width: '100%' }}
                />
            );
        }
        return (
            <Text
                style={[styles.text, !value && styles.placeholderText]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {currentLabel || placeholder}
            </Text>
        );
    };

    const resolvedTitle = modalTitle || (typeof label === 'string' ? label : placeholder);

    return (
        <View style={styles.container}>
            {/* Label */}
            {label && (
                <View style={styles.labelContainer}>
                    <Text style={styles.label} maxFontSizeMultiplier={1.1}>
                        {label}
                    </Text>
                    {required && <RequiredDot />}
                </View>
            )}

            {/* Trigger Button */}
            <TouchableOpacity
                style={[styles.button, disabled && { opacity: 0.6 }, buttonStyle]}
                onPress={handleOpen}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <View style={styles.buttonContent}>{renderButtonContent()}</View>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary || '#999'} />
            </TouchableOpacity>

            {/* Bottom Sheet Modal */}
            <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalContainer}>
                                {/* Header */}
                                <View style={styles.header}>
                                    <Text style={styles.title}>{resolvedTitle}</Text>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={styles.closeButton}
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <CloseIcon width={20} height={20} />
                                    </TouchableOpacity>
                                </View>

                                {/* Search */}
                                <View style={styles.searchContainer}>
                                    <Ionicons
                                        name="search-outline"
                                        size={18}
                                        color={colors.textSecondary}
                                        style={styles.searchIcon}
                                    />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder={searchPlaceholder}
                                        placeholderTextColor={colors.textTertiary}
                                        value={searchText}
                                        onChangeText={onSearchChange}
                                    />
                                    {searchText.length > 0 && (
                                        <TouchableOpacity
                                            onPress={onClearSearch}
                                            style={styles.clearButton}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={18}
                                                color={colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* List */}
                                <FlatList
                                    data={items}
                                    keyExtractor={item => item.id}
                                    renderItem={renderItem}
                                    ListFooterComponent={renderFooter}
                                    ListEmptyComponent={renderEmpty}
                                    onEndReached={handleEndReached}
                                    onEndReachedThreshold={0.3}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                    style={styles.list}
                                    contentContainerStyle={
                                        items.length === 0 ? styles.listContentEmpty : undefined
                                    }
                                    refreshControl={
                                        onRefresh ? (
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                            />
                                        ) : undefined
                                    }
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

export const InfiniteScrollDropdown = React.memo(
    InfiniteScrollDropdownInner
) as typeof InfiniteScrollDropdownInner;

// ────────────────────────────── Styles ──────────────────────────────

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
    },
    buttonContent: {
        flex: 1,
        marginRight: spacing.xs,
        justifyContent: 'center',
    },
    text: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 40,
        textAlignVertical: 'center',
    },
    placeholderText: {
        color: colors.textSecondary || '#999',
    },

    // Modal styles
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        maxHeight: SCREEN_HEIGHT * 0.8,
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
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
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
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
    clearButton: {
        padding: 4,
    },

    // List
    list: {
        height: LIST_HEIGHT,
    },
    listContentEmpty: {
        flex: 1,
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
        fontWeight: '500',
        marginRight: spacing.sm,
    },
    loadingFooter: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
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

    // Skeleton
    skeletonContainer: {
        paddingVertical: spacing.sm,
    },
    skeletonRow: {
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
});
