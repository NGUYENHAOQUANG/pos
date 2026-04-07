import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';

import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { Checkbox } from '@/shared/components/forms/Checkbox';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterProps {
    visible: boolean;
    onClose: () => void;
    onApply: (selectedTypes: string[]) => void;
    initialSelectedTypes?: string[];
    availableOptions?: FilterOption[];
}

export const Filter: React.FC<FilterProps> = ({
    visible,
    onClose,
    onApply,
    initialSelectedTypes = [],
    availableOptions = [],
}) => {
    const [selectedTypes, setSelectedTypes] = useState<string[]>(initialSelectedTypes);
    const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const theme = useAppTheme();
    const styles = getStyles(theme);

    useEffect(() => {
        if (visible) {
            setSelectedTypes(initialSelectedTypes);
            // Slide up animation
            slideAnim.setValue(Dimensions.get('window').height);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            // Slide down animation
            Animated.timing(slideAnim, {
                toValue: Dimensions.get('window').height,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, initialSelectedTypes, slideAnim]);

    // Use availableOptions for rendering
    const optionsToRender = availableOptions;

    const handleToggleType = (type: string) => {
        setSelectedTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    const handleToggleAll = () => {
        if (selectedTypes.length === optionsToRender.length) {
            setSelectedTypes([]);
        } else {
            setSelectedTypes(optionsToRender.map(opt => opt.value));
        }
    };

    const handleReset = () => {
        setSelectedTypes([]);
    };

    const handleApply = () => {
        onApply(selectedTypes);
        onClose();
    };

    const isAllSelected =
        optionsToRender.length > 0 && selectedTypes.length === optionsToRender.length;

    if (optionsToRender.length === 0) {
        return (
            <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={styles.overlayTouchable}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                    <Animated.View
                        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Bộ lọc</Text>
                            <TouchableOpacity onPress={onClose}>
                                <CloseIcon width={20} height={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.content}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: theme.textSecondary,
                                    marginTop: spacing.lg,
                                }}
                            >
                                Không có lựa chọn nào để lọc
                            </Text>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Close modal when tapping on overlay */}
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleReset} style={styles.headerSide}>
                            <Text style={styles.resetText}>Thiết lập lại</Text>
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Bộ lọc</Text>

                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.headerSide, { alignItems: 'flex-end' }]}
                        >
                            <CloseIcon width={20} height={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>Loại công việc</Text>
                        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                            {/* Select All */}
                            <Checkbox
                                checked={isAllSelected}
                                onToggle={handleToggleAll}
                                label="Chọn tất cả"
                                style={styles.checkboxRow}
                                labelStyle={styles.checkboxLabel}
                            />
                            {/* Work Types List */}
                            {optionsToRender.map(option => {
                                const isSelected = selectedTypes.includes(option.value);
                                return (
                                    <Checkbox
                                        key={option.value}
                                        checked={isSelected}
                                        onToggle={() => handleToggleType(option.value)}
                                        label={option.label}
                                        style={styles.checkboxRow}
                                        labelStyle={styles.checkboxLabel}
                                    />
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Footer */}
                    <ButtonBarFarm
                        primaryTitle="Áp dụng"
                        onPrimaryPress={handleApply}
                        secondaryTitle="Hủy"
                        onSecondaryPress={onClose}
                        secondaryType="default"
                        style={{
                            paddingHorizontal: spacing.md,
                            paddingTop: 0,
                            paddingBottom: 0,
                            marginTop: 0,
                        }}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 40,
        },
        overlayTouchable: {
            ...StyleSheet.absoluteFillObject,
        },
        container: {
            width: '94%',
            backgroundColor: theme.background,
            borderRadius: 24,
            paddingBottom: spacing.md,
            maxHeight: '80%',
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.defaultBorder,
            paddingVertical: 6,
            paddingHorizontal: 16,
        },
        headerTitle: {
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text,
            textAlign: 'center',
        },
        headerSide: {
            flex: 1,
        },
        resetText: {
            fontSize: typography.fontSize.sm,
            color: theme.primary,
            fontWeight: typography.fontWeight.medium,
        },
        content: {
            padding: spacing.md,
        },
        scrollArea: {
            maxHeight: 400,
        },
        sectionTitle: {
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.bold,
            color: theme.text,
            marginBottom: spacing.sm,
        },
        checkboxRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.sm,
        },
        checkboxLabel: {
            fontSize: typography.fontSize.base,
            color: theme.text,
            fontWeight: typography.fontWeight.regular,
            marginLeft: spacing.sm,
        },
    });
