import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { CameraItem } from '@/features/control/api/cameraApi';

interface CameraFilterProps {
    cameras: CameraItem[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export const CameraFilter: React.FC<CameraFilterProps> = ({
    cameras,
    selectedCategory,
    onSelectCategory,
}) => {
    const theme = useAppTheme();

    // Dynamically build filter options based on Enums
    const filterOptions = useMemo(() => {
        // Base "All" option
        const allOption = {
            key: 'all',
            label: 'Tất cả',
            countLabel: 'Tổng cam',
            count: cameras.length,
        };

        const enumTabs = [
            { id: 'GrowOutPond', name: 'Ao Nuôi' },
            { id: 'NurseryPond', name: 'Ao Vèo' },
            { id: 'Infrastructure', name: 'Hạ Tầng' },
        ];

        const catOptions = enumTabs.map(cat => {
            const count = cameras.filter(cam => cam.locationCategory === cat.id).length;

            return {
                key: cat.id,
                label: cat.name,
                countLabel: cat.name,
                count,
            };
        });

        const otherCount = cameras.filter(
            cam => cam.locationCategory === 'None' || !cam.locationCategory
        ).length;
        if (otherCount > 0) {
            catOptions.push({
                key: 'other',
                label: 'Khác',
                countLabel: 'Khác',
                count: otherCount,
            });
        }

        return [
            {
                ...allOption,
                label: `Tất cả (${allOption.count})`,
            },
            ...catOptions.map(cat => ({
                ...cat,
                label: `${cat.label} (${cat.count})`,
            })),
        ];
    }, [cameras]);

    return (
        <View style={styles.container}>
            {/* Filter Pills */}
            <View style={styles.pillsScrollWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pillsContainer}
                >
                    {filterOptions.map(option => {
                        const isActive = selectedCategory === option.key;
                        return (
                            <TouchableOpacity
                                key={`pill-${option.key}`}
                                activeOpacity={0.7}
                                style={[
                                    styles.pill,
                                    {
                                        backgroundColor: isActive ? theme.text : theme.background,
                                        borderColor: isActive ? theme.text : theme.border,
                                    },
                                ]}
                                onPress={() => onSelectCategory(option.key)}
                            >
                                <Text
                                    style={[
                                        styles.pillText,
                                        {
                                            color: isActive
                                                ? theme.backgroundPrimary
                                                : theme.textSecondary,
                                        },
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    pillsScrollWrapper: {
        marginBottom: 8,
    },
    pillsContainer: {
        paddingHorizontal: 16,
        gap: 6,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pillText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
