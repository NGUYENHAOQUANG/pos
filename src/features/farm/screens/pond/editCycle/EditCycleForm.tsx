import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CycleData } from '@/features/farm/types/farm.types';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';

interface EditCycleFormProps {
    activeCycleData?: CycleData | null;
    seasonLabel: string;
    breedLabel: string;
    doc: number;
    sourcePondName: string;
    shrimpSize: string;
    displayStockingDate: string;
    refreshing: boolean;
    onRefresh: () => void;
    onEditPress: () => void;
}

export const EditCycleForm: React.FC<EditCycleFormProps> = ({
    activeCycleData,
    seasonLabel,
    breedLabel,
    doc,
    sourcePondName,
    shrimpSize,
    displayStockingDate,
    refreshing,
    onRefresh,
    onEditPress,
}) => {
    const [isCycleNameExpanded, setIsCycleNameExpanded] = useState(false);

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.black]}
                />
            }
        >
            {/* Thông tin thả giống - Chu kỳ gốc của ao nhận */}
            <View style={styles.card}>
                <View style={styles.cardHeaderWithBorder}>
                    <Text style={styles.cardTitle}>Thông tin thả giống</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={onEditPress}>
                            <EditIcon />
                        </TouchableOpacity>
                        <Ionicons name="chevron-up" size={20} color={colors.gray[700]} />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Vụ nuôi:</Text>
                        <Text style={styles.value}>{seasonLabel}</Text>
                    </View>
                    {/* Custom row for Tên chu kỳ with expand/collapse */}
                    <View style={[styles.infoRow, styles.cycleNameRow]}>
                        <Text style={[styles.label, styles.cycleNameLabel]}>Tên chu kỳ:</Text>
                        <View style={styles.cycleNameValueContainer}>
                            <Text
                                style={[styles.value, styles.cycleNameText]}
                                numberOfLines={isCycleNameExpanded ? undefined : 1}
                            >
                                {activeCycleData?.cycleName || '---'}
                            </Text>
                            {(activeCycleData?.cycleName?.length || 0) > 25 && (
                                <TouchableOpacity
                                    onPress={() => setIsCycleNameExpanded(!isCycleNameExpanded)}
                                    style={styles.expandButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={isCycleNameExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={18}
                                        color={colors.gray[500]}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Tôm giống:</Text>
                        <Text style={styles.value}>{breedLabel}</Text>
                    </View>

                    <View style={[styles.line]} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Ngày thả:</Text>
                        <Text style={styles.value}>{displayStockingDate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Số ngày nuôi (DOC):</Text>
                        <Text style={styles.value}>{doc} ngày</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Số lượng thả (Pls):</Text>
                        <Text style={styles.value}>
                            {activeCycleData?.stockingQuantity?.toLocaleString() ||
                                activeCycleData?.totalStocking?.toLocaleString() ||
                                0}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Thông tin sang ao - Luôn hiển thị */}
            <View style={[styles.card, { marginTop: spacing.sm }]}>
                <View style={styles.cardHeaderWithBorder}>
                    <Text style={styles.cardTitle}>Thông tin sang ao</Text>
                    <Ionicons name="chevron-up" size={20} color={colors.gray[700]} />
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Ngày nhận ao:</Text>
                        <Text style={styles.value}>{displayStockingDate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Chuyển sang từ ao:</Text>
                        <Text style={styles.value}>{sourcePondName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Ngày nuôi (DOC):</Text>
                        <Text style={styles.value}>{doc} ngày</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Cỡ tôm (con/kg)</Text>
                        <Text style={styles.value}>{shrimpSize}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Số lượng tôm sang (con):</Text>
                        <Text style={styles.value}>
                            {activeCycleData?.stockingQuantity?.toLocaleString() ||
                                activeCycleData?.totalStocking?.toLocaleString() ||
                                0}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingVertical: spacing.sm,
    },
    card: {
        backgroundColor: colors.white,
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    cardHeaderWithBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.gray[900],
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        backgroundColor: colors.gray[50],
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    line: {
        height: 1,
        backgroundColor: colors.borderLight,
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
    cycleNameRow: {
        alignItems: 'flex-start',
    },
    cycleNameLabel: {
        marginTop: 2,
    },
    cycleNameValueContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    cycleNameText: {
        textAlign: 'right',
        flex: 1,
    },
    expandButton: {
        marginLeft: 6,
        paddingHorizontal: 2,
    },
});
