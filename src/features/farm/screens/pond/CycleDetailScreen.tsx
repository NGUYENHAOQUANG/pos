import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { useFarm } from '../../context/FarmContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FarmStackParamList } from '../../navigation/FarmNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Sử dụng HeaderFarm có sẵn
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';

import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CycleDetail'>;

export const CycleDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ScreenRouteProp>();

    // Lấy dữ liệu từ params truyền sang
    const { cycleData, pondId } = route.params || {};
    const { breedOptions, seasonOptions, calculateDOC } = useFarm();

    const breedLabel = breedOptions.find(b => b.value === cycleData?.breedSource)?.label || 'N/A';
    const seasonLabel = seasonOptions.find(s => s.value === cycleData?.season)?.label || 'N/A';

    // Calculate DOC (Days of Culture)
    const doc = useMemo(() => {
        return calculateDOC(cycleData?.stockingDate);
    }, [cycleData?.stockingDate, calculateDOC]);

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="cycle-detail"
                titleAlign="left"
                leftComponent={
                    <View style={styles.leftHeaderContainer}>
                        <TouchableOpacity
                            style={styles.customBackButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                }
                title={
                    <View style={styles.leftTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {cycleData?.cycleName}
                        </Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {cycleData?.stockingDate ?? '---'} - nay
                        </Text>
                    </View>
                }
                rightAction={
                    <View style={styles.badgeWrapper}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText} numberOfLines={1}>
                                Chưa hoàn thành
                            </Text>
                        </View>
                    </View>
                }
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.cardHeaderWithBorder}>
                        <Text style={styles.cardTitle}>Thông tin thả giống</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() =>
                                    navigation.navigate('CreateCycle', {
                                        pondId,
                                        initialData: cycleData,
                                    })
                                }
                            >
                                <EditIcon />
                            </TouchableOpacity>
                            <Ionicons name="chevron-up" size={20} color="#374151" />
                        </View>
                    </View>

                    {/* ... phần nội dung infoRow giữ nguyên */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Vụ nuôi:</Text>
                            <Text style={styles.value}>{seasonLabel}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Tên chu kỳ:</Text>
                            <Text style={styles.value}>{cycleData?.cycleName || '---'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Tôm giống:</Text>
                            <Text style={styles.value}>{breedLabel}</Text>
                        </View>

                        <View style={[styles.line]} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Ngày thả:</Text>
                            <Text style={styles.value}>{cycleData?.stockingDate ?? '---'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Số ngày nuôi (DOC):</Text>
                            <Text style={styles.value}>{doc} ngày</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Số lượng thả (Pls):</Text>
                            <Text style={styles.value}>
                                {cycleData?.stockingQuantity?.toLocaleString() || 0}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    // ... các styles khác giữ nguyên
    badgeWrapper: {
        height: 40,
        minWidth: 110, // Ensure specific width for balance
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    // ... statusBadge style kept ...
    leftHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    customBackButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB', // Match border colors
    },

    statusBadge: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FFE58F',
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        color: '#D48806',
        fontWeight: typography.fontWeight.regular,
        lineHeight: 20,
    },
    content: {
        paddingVertical: spacing.sm,
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardHeaderWithBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // NÚT BỌC 32x32 THEO Ý BA
    iconBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    line: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
    },
    infoContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        gap: 8,
    },
    label: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
    value: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
    },
    leftTitleContainer: {
        alignItems: 'flex-start',
        marginLeft: 8, // Ensures ~16px total spacing from back button (8px from header + 8px here)
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.regular,
    },
});
