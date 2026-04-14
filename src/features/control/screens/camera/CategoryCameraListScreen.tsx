import React, { useMemo, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Text } from '@/shared/components/typography/Text';
import { CameraCard } from '@/features/control/components/camera/CameraCard';
import { CameraItem } from '@/features/control/api/cameraApi';
import { useCameras } from '@/features/control/hooks/useCameras';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

type CategoryCameraListRouteProp = RouteProp<AppStackParamList, 'CategoryCameraList'>;

export const CategoryCameraListScreen: React.FC = () => {
    const theme = useAppTheme();
    const route = useRoute<CategoryCameraListRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

    const { categoryId, categoryName } = route.params;
    const { data: cameras = [], refetch, isRefetching } = useCameras();

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Replicate grouping logic matching for the specific single category
    const categoryCameras = useMemo(() => {
        if (!cameras?.length) return [];

        if (categoryId === 'other') {
            return cameras.filter(cam => cam.locationCategory === 'None' || !cam.locationCategory);
        }

        return cameras.filter(cam => cam.locationCategory === categoryId);
    }, [cameras, categoryId]);

    // Check if the current category is an "Ao Nuôi" equivalent using precise API definition ('GrowOutPond')
    const isAoNuoi = categoryId === 'GrowOutPond';

    // Grouping & Filtering Logic specifically for Ao Nuôi
    const filterPairs = useMemo(() => {
        if (!isAoNuoi || !categoryCameras.length) return [];

        // 1. Group by exact Pond Name
        const groupsMap = new Map<string, CameraItem[]>();
        categoryCameras.forEach(cam => {
            const pondName = cam.pondName || 'Khu vực chưa phân bổ';
            if (!groupsMap.has(pondName)) {
                groupsMap.set(pondName, []);
            }
            groupsMap.get(pondName)!.push(cam);
        });

        const groupedPonds = Array.from(groupsMap.entries()).map(([pondName, cams]) => ({
            pondName,
            cameras: cams,
        }));

        // Sort alphabetically by pond name
        groupedPonds.sort((a, b) => a.pondName.localeCompare(b.pondName));

        // 2. Chunk into pairs of 2
        const pairs = [];
        for (let i = 0; i < groupedPonds.length; i += 2) {
            const pair = groupedPonds.slice(i, i + 2);
            const label = pair.map(p => p.pondName).join(' - ');
            pairs.push({
                id: i.toString(),
                label,
                ponds: pair,
            });
        }
        return pairs;
    }, [categoryCameras, isAoNuoi]);

    const [selectedPairIndex, setSelectedPairIndex] = useState(0);

    const handleCameraPress = (camera: CameraItem) => {
        navigation.navigate('CameraDetail', { camera });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
            {/* Header */}
            <HeaderSection
                title={categoryName}
                onBack={() => navigation.goBack()}
                transparent={false}
            />

            {/* Sub-Filter System for Ao Nuôi Only */}
            {isAoNuoi && filterPairs.length > 0 && (
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScrollContent}
                    >
                        {filterPairs.map((pair, idx) => {
                            const isSelected = selectedPairIndex === idx;
                            return (
                                <TouchableOpacity
                                    key={pair.id}
                                    activeOpacity={0.7}
                                    onPress={() => setSelectedPairIndex(idx)}
                                    style={[
                                        styles.filterPill,
                                        {
                                            backgroundColor: isSelected
                                                ? theme.text
                                                : theme.background,
                                            borderColor: isSelected ? theme.text : theme.border,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            {
                                                color: isSelected
                                                    ? theme.backgroundPrimary
                                                    : theme.textSecondary,
                                            },
                                        ]}
                                    >
                                        {pair.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* List Configuration based on Mode */}
            {isAoNuoi && filterPairs.length > 0 ? (
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.groupedListContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
                    }
                >
                    {filterPairs[selectedPairIndex]?.ponds.map(pondGroup => (
                        <View key={pondGroup.pondName} style={styles.pondSectionContainer}>
                            <Text style={[styles.pondSectionTitle, { color: theme.text }]}>
                                {pondGroup.pondName}
                            </Text>
                            <View style={styles.pondGridContent}>
                                {pondGroup.cameras.map(cam => (
                                    <CameraCard
                                        key={cam.deviceCode}
                                        camera={cam}
                                        onPress={handleCameraPress}
                                        isGrid={true}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <FlatList
                    contentContainerStyle={styles.listContent}
                    data={categoryCameras}
                    keyExtractor={item => item.deviceCode}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
                    }
                    renderItem={({ item }) => (
                        <CameraCard camera={item} onPress={handleCameraPress} isGrid={true} />
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingBottom: 40,
    },
    groupedListContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: 40,
        paddingTop: 8,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    filterScrollContent: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        gap: 12,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterPillText: {
        fontSize: 14,
        fontWeight: '500',
    },
    pondSectionContainer: {
        marginBottom: 12,
    },
    pondSectionTitle: {
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 4,
    },
    pondGridContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 8,
    },
});
