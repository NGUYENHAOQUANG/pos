import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { useFarm } from '../../context/FarmContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CycleData } from '../../types/farm.types';
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
    const typedCycleData = cycleData as CycleData | undefined;
    const { breedOptions, seasonOptions, calculateDOC } = useFarm();

    const breedLabel =
        breedOptions.find(b => b.value === typedCycleData?.breedSource)?.label || 'N/A';
    const seasonLabel = seasonOptions.find(s => s.value === typedCycleData?.season)?.label || 'N/A';

    // Calculate DOC (Days of Culture)
    const doc = useMemo(() => {
        return calculateDOC(typedCycleData?.stockingDate);
    }, [typedCycleData?.stockingDate, calculateDOC]);

    // Get transfer info if exists
    const transferInfo = typedCycleData?.transferInfo;

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="cycle-detail"
                titleAlign="left"
                onBack={() => navigation.goBack()}
                title={
                    <View style={styles.leftTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {typedCycleData?.cycleName}
                        </Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {typedCycleData?.stockingDate ?? '---'} - nay
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
                {/* Thông tin thả giống - Chu kỳ gốc của ao nhận */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderWithBorder}>
                        <Text style={styles.cardTitle}>Thông tin thả giống</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() =>
                                    navigation.navigate('CreateCycle', {
                                        pondId,
                                        initialData: typedCycleData,
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
                            <Text style={styles.value}>{typedCycleData?.cycleName || '---'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Tôm giống:</Text>
                            <Text style={styles.value}>{breedLabel}</Text>
                        </View>

                        <View style={[styles.line]} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Ngày thả:</Text>
                            <Text style={styles.value}>
                                {typedCycleData?.stockingDate ?? '---'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Số ngày nuôi (DOC):</Text>
                            <Text style={styles.value}>{doc} ngày</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Số lượng thả (Pls):</Text>
                            <Text style={styles.value}>
                                {typedCycleData?.stockingQuantity?.toLocaleString() || 0}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Thông tin sang ao - Hiển thị nếu có transferInfo */}
                {transferInfo && (
                    <View style={[styles.card, styles.transferCard]}>
                        <View style={styles.cardHeaderWithBorder}>
                            <Text style={styles.cardTitle}>Thông tin sang ao</Text>
                            <Ionicons name="chevron-up" size={20} color="#374151" />
                        </View>

                        <View style={styles.infoContainer}>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Ngày sang ao:</Text>
                                <Text style={styles.value}>{transferInfo.transferDate}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Cỡ tôm (con/kg)</Text>
                                <Text style={styles.value}>{transferInfo.shrimpSize}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Tổng số tôm dự kiến (con):</Text>
                                <Text style={styles.value}>
                                    {transferInfo.totalEstimatedShrimp?.toLocaleString() || 0}
                                </Text>
                            </View>

                            <View style={[styles.line]} />

                            {/* Ao nhận header - outside of card */}
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Ao nhận</Text>
                                <Text style={styles.value}>1</Text>
                            </View>

                            {/* Card for receiving ponds list */}
                            <View style={styles.receivingPondCard}>
                                {/* Hiển thị ao nguồn và số lượng */}
                                <View style={styles.subRow}>
                                    <Text style={styles.subLabel}>
                                        {transferInfo.sourcePondName}
                                    </Text>
                                    <Text style={styles.subValue}>
                                        {transferInfo.quantity?.toLocaleString() || 0}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
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
    // Transfer Card Styles
    transferCard: {
        marginTop: spacing.sm,
    },
    receivingPondCard: {
        backgroundColor: colors.backgroundPrimary,
        borderRadius: 8,
        padding: spacing.sm,
        gap: 8,
    },
    subRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: spacing.md,
    },
    subLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.regular,
    },
    subValue: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
        marginTop: spacing.xs,
    },
});
