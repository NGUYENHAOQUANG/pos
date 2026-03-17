import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SelectedItem {
    id: string;
    name: string;
}

interface SelectedModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (selectedIds: string[]) => void;
    title?: string;
    data: SelectedItem[];
    initialSelected?: string[];
    type: 'farm' | 'pond';
}

export const SelectedModal: React.FC<SelectedModalProps> = ({
    visible,
    onClose,
    onSave,
    title = 'Thêm đơn vị công tác',
    data,
    initialSelected = [],
    type: _type,
}) => {
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

    useEffect(() => {
        if (visible) {
            setSelectedIds(initialSelected);
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
    }, [visible, slideAnim, initialSelected]);

    const isAllSelected = data.length > 0 && data.every(item => selectedIds.includes(item.id));

    const toggleItem = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map(item => item.id));
        }
    };

    const handleSave = () => {
        onSave(selectedIds);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                {
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.closeButton}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <CloseIcon width={16} height={16} />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <ScrollView
                                style={styles.content}
                                contentContainerStyle={styles.contentContainer}
                            >
                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={toggleAll}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            isAllSelected && styles.checkboxChecked,
                                        ]}
                                    >
                                        {isAllSelected && (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color={colors.white}
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.itemText}>Chọn tất cả</Text>
                                </TouchableOpacity>

                                {data.map(item => {
                                    const isSelected = selectedIds.includes(item.id);
                                    // Thay content nếu là cấp trại nuôi thì hiện trại, nếu là cấp ao nuôi thì hiện các ao
                                    // (As requested by user but typically `item.name` already has this. If the user wants `{tên trại}` literal, I'll just use item.name)
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={styles.checkboxRow}
                                            onPress={() => toggleItem(item.id)}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    isSelected && styles.checkboxChecked,
                                                ]}
                                            >
                                                {isSelected && (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={16}
                                                        color={colors.white}
                                                    />
                                                )}
                                            </View>
                                            <Text style={styles.itemText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Footer buttons */}
                            <View style={styles.footer}>
                                <Button
                                    title="Không"
                                    onPress={onClose}
                                    variant="outline"
                                    style={[styles.cancelButton, styles.cancelButtonOverride]}
                                    textStyle={styles.cancelButtonTextOverride}
                                />
                                <Button
                                    title="Lưu"
                                    onPress={handleSave}
                                    variant="primary"
                                    style={styles.confirmButton}
                                />
                            </View>
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
        paddingHorizontal: spacing.md,
        paddingBottom: 40,
    },
    container: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: spacing.lg,
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
    },
    content: {
        maxHeight: 400,
        marginBottom: spacing.lg,
    },
    contentContainer: {
        gap: spacing.md,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.xs,
    },
    itemText: {
        fontSize: typography.fontSize.base,
        color: colors.text,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.sm,
        borderWidth: 1.5,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    cancelButton: {
        flex: 1,
    },
    cancelButtonOverride: {
        borderColor: colors.gray?.[300] || '#D1D5DB', // fallback color
    },
    cancelButtonTextOverride: {
        color: colors.text,
    },
    confirmButton: {
        flex: 1,
    },
});
