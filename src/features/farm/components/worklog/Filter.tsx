import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { IconCheckUnactive } from '@/assets/icons';
import IconCheckActiveOrange from '@/assets/Icon/CheckActive-Orange.svg';

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

    useEffect(() => {
        if (visible) {
            setSelectedTypes(initialSelectedTypes);
        }
    }, [visible, initialSelectedTypes]);

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

    const insets = useSafeAreaInsets();
    const headerStyle = {
        ...styles.header,
        paddingTop:
            Platform.OS === 'android' ? spacing.md : Math.max(insets.top, spacing.md) + spacing.sm,
    };

    if (optionsToRender.length === 0) {
        return (
            <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={styles.overlayTouchable}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={headerStyle}>
                            <Text style={styles.headerTitle}>Bộ lọc</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.content}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: colors.textSecondary,
                                    marginTop: spacing.lg,
                                }}
                            >
                                Không có lựa chọn nào để lọc
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Close modal when tapping on overlay */}
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.container}>
                    {/* Header */}
                    <View style={headerStyle}>
                        <TouchableOpacity onPress={handleReset} style={styles.headerSide}>
                            <Text style={styles.resetText}>Thiết lập lại</Text>
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Bộ lọc</Text>

                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.headerSide, { alignItems: 'flex-end' }]}
                        >
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>Loại công việc</Text>
                        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                            {/* Select All */}
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={handleToggleAll}
                                activeOpacity={0.7}
                            >
                                {isAllSelected ? (
                                    <IconCheckActiveOrange width={16} height={16} />
                                ) : (
                                    <IconCheckUnactive width={16} height={16} />
                                )}
                                <Text style={styles.checkboxLabel}>Chọn tất cả</Text>
                            </TouchableOpacity>
                            {/* Work Types List */}
                            {optionsToRender.map(option => {
                                const isSelected = selectedTypes.includes(option.value);
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={styles.checkboxRow}
                                        onPress={() => handleToggleType(option.value)}
                                        activeOpacity={0.7}
                                    >
                                        {isSelected ? (
                                            <IconCheckActiveOrange width={16} height={16} />
                                        ) : (
                                            <IconCheckUnactive width={16} height={16} />
                                        )}
                                        <Text style={styles.checkboxLabel}>{option.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Footer */}
                    <ButtonBarFarm
                        primaryTitle="Áp dụng"
                        onPrimaryPress={handleApply}
                        secondaryTitle="Đóng"
                        onSecondaryPress={onClose}
                        secondaryType="default"
                        style={{
                            paddingHorizontal: 0,
                            marginTop: spacing.sm,
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    overlayTouchable: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: '94%',
        backgroundColor: colors.white,
        borderRadius: 24,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        textAlign: 'center',
    },
    headerSide: {
        flex: 1,
    },
    resetText: {
        fontSize: typography.fontSize.base,
        color: colors.primary,
        fontWeight: typography.fontWeight.regular,
    },
    content: {
        marginVertical: spacing.sm,
    },
    scrollArea: {
        maxHeight: 400,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },

    checkboxLabel: {
        fontSize: typography.fontSize.base,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
        marginLeft: spacing.sm,
    },
});
