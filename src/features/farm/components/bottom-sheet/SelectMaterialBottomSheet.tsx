/**
 * @file SelectMaterialBottomSheet.tsx
 * @description Bottom sheet for selecting material with slide-up animation.
 * Uses inline view swapping instead of nested Modals to avoid iOS issues.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    Animated,
    Dimensions,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    FlatList,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { Input, InputFormat, RequiredDot } from '@/shared/components/forms/Input';
import { Button } from '@/shared/components/buttons/Button';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SelectMaterialBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { material: IMaterial; quantity: number; unit: string }) => void;
    materials: IMaterial[];
    isLoading?: boolean;
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    /** Controlled search text from parent */
    searchText?: string;
    /** Callback when search text changes */
    onSearchChange?: (text: string) => void;
}

export const SelectMaterialBottomSheet: React.FC<SelectMaterialBottomSheetProps> = ({
    visible,
    onClose,
    onSave,
    materials,
    isLoading,
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    searchText = '',
    onSearchChange,
}) => {
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [selectedMaterial, setSelectedMaterial] = useState<IMaterial | undefined>();
    const [quantity, setQuantity] = useState('');
    const [selectedUnit, setSelectedUnit] = useState<string>('');
    // 'form' = material form view, 'product' = product selection list view
    const [currentView, setCurrentView] = useState<'form' | 'product'>('form');
    const searchInputRef = useRef<TextInput>(null);

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
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    // Reset form when modal closes
    useEffect(() => {
        if (!visible) {
            setSelectedMaterial(undefined);
            setQuantity('');
            setSelectedUnit('');
            setCurrentView('form');
        }
    }, [visible]);

    // Auto-fill unit based on selected material
    useEffect(() => {
        if (selectedMaterial) {
            const targetUnit = selectedMaterial.unitName || selectedMaterial.unit || '';
            setSelectedUnit(String(targetUnit));
        } else {
            setSelectedUnit('');
        }
    }, [selectedMaterial]);

    const handleSave = () => {
        if (selectedMaterial && quantity && selectedUnit) {
            onSave({
                material: selectedMaterial,
                quantity: parseFloat(quantity),
                unit: selectedUnit,
            });
            setSelectedMaterial(undefined);
            setQuantity('');
            setSelectedUnit('');
            onClose();
        }
    };

    const handleQuantityChange = (text: string) => {
        let sanitized = text.replace(/[^0-9.]/g, '');
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }
        if (sanitized.length > 6) {
            sanitized = sanitized.substring(0, 6);
        }
        setQuantity(sanitized);
    };

    const handleSelectProduct = (material: IMaterial) => {
        setSelectedMaterial(material);
        setCurrentView('form');
        onSearchChange?.('');
    };

    const handleClose = () => {
        if (currentView === 'product') {
            // Go back to form view instead of closing
            setCurrentView('form');
            onSearchChange?.('');
        } else {
            onClose();
        }
    };

    // Render the material form content
    const renderFormContent = () => (
        <>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleWrapper}>
                    <Text style={styles.title}>Chọn vật tư</Text>
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <CloseIcon width={20} height={20} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Product Selection */}
                <View style={styles.fieldGroup}>
                    <View style={styles.labelWrapper}>
                        <Text style={styles.label}>Chọn loại sản phẩm</Text>
                        <RequiredDot />
                    </View>
                    <TouchableOpacity
                        style={styles.productSelector}
                        onPress={() => setCurrentView('product')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.productSelectorText,
                                !selectedMaterial && styles.placeholderText,
                            ]}
                            numberOfLines={1}
                        >
                            {selectedMaterial ? selectedMaterial.name : 'Chọn loại sản phẩm'}
                        </Text>
                        <Ionicons
                            name="chevron-down-outline"
                            size={18}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Quantity */}
                <Input
                    label="Số lượng"
                    placeholder="Nhập số lượng"
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    keyboardType="decimal-pad"
                    inputFormat={InputFormat.DECIMAL}
                    required
                    containerStyle={{ marginBottom: 0 }}
                />

                {/* Unit */}
                <Input
                    label="Đơn vị"
                    placeholder="Nhập đơn vị"
                    value={selectedUnit}
                    onChangeText={() => {}}
                    editable={false}
                    required
                    disabled
                    containerStyle={{ marginBottom: 0 }}
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title="Huỷ"
                    variant="outline"
                    onPress={onClose}
                    style={[styles.footerButton, styles.cancelButtonOverride]}
                    textStyle={styles.cancelButtonTextOverride}
                />
                <Button
                    title="Lưu"
                    variant="primary"
                    onPress={handleSave}
                    disabled={!selectedMaterial || !quantity || !selectedUnit}
                    style={styles.footerButton}
                />
            </View>
        </>
    );

    // Render product selection list
    const renderProductContent = () => (
        <>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Chọn loại sản phẩm</Text>
                <TouchableOpacity
                    onPress={() => {
                        setCurrentView('form');
                        onSearchChange?.('');
                    }}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <CloseIcon width={20} height={20} />
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
                    onChangeText={text => onSearchChange?.(text)}
                />
            </View>

            {/* Material List */}
            <FlatList
                data={materials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    const stockText = `Kho ${item.remaining ?? 0} ${
                        item.unitName ? String(item.unitName).toLowerCase() : ''
                    }`;
                    return (
                        <TouchableOpacity
                            style={styles.itemRow}
                            onPress={() => handleSelectProduct(item)}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.itemName} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text style={styles.itemStock}>{stockText}</Text>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="small" color={colors.primaryOrange} />
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <EmptyStateIcon width={60} height={60} />
                            <Text style={styles.emptyText}>Không tìm thấy vật tư</Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={styles.loadingFooter}>
                            <ActivityIndicator size="small" color={colors.primaryOrange} />
                        </View>
                    ) : null
                }
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        onLoadMore?.();
                    }
                }}
                onEndReachedThreshold={0.3}
                style={styles.list}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            />
        </>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <TouchableWithoutFeedback onPress={handleClose}>
                {currentView === 'form' ? (
                    <KeyboardAvoidingView
                        style={styles.overlay}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <Animated.View
                                style={[
                                    styles.container,
                                    { transform: [{ translateY: slideAnim }] },
                                ]}
                            >
                                {renderFormContent()}
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                ) : (
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <Animated.View
                                style={[
                                    styles.container,
                                    styles.containerProduct,
                                    { transform: [{ translateY: slideAnim }] },
                                ]}
                            >
                                {renderProductContent()}
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                )}
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
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    containerProduct: {
        height: SCREEN_HEIGHT * 0.7,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
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
    content: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    fieldGroup: {
        gap: spacing.xs,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        lineHeight: 20,
    },
    productSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    productSelectorText: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    placeholderText: {
        color: colors.textTertiary,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    footerButton: {
        flex: 1,
    },
    cancelButtonOverride: {
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    cancelButtonTextOverride: {
        color: colors.text,
        fontSize: 14,
    },
    // Product selection styles
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
    loadingFooter: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
