import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { borderRadius, colors, spacing } from '@/styles';
import { CycleData } from '@/features/farm/types/cycle.types';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';
import { DetailRow } from '@/features/material/components/DetailRow';
interface CycleDetailContentProps {
    activeCycleData?: CycleData;
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

export const CycleDetailContent: React.FC<CycleDetailContentProps> = ({
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
    const [isStockingExpanded] = useState(true);
    const [isTransferExpanded, setIsTransferExpanded] = useState(true);

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
                <CollapseHead
                    title="Thông tin thả giống"
                    isExpanded={isStockingExpanded}
                    rightComponent={
                        <TouchableOpacity style={styles.iconBtn} onPress={onEditPress}>
                            <EditIcon />
                        </TouchableOpacity>
                    }
                    style={styles.cardHeader}
                />

                {isStockingExpanded && (
                    <View style={styles.infoContainer}>
                        <DetailRow label="Vụ nuôi:" value={seasonLabel} />
                        <DetailRow label="Tên chu kỳ:" value={activeCycleData?.name || '---'} />
                        <DetailRow label="Tôm giống:" value={breedLabel} />

                        <View style={styles.line} />

                        <DetailRow label="Ngày thả:" value={displayStockingDate} />
                        <DetailRow label="Ngày nuôi (DOC):" value={`${doc} ngày`} />
                        <DetailRow
                            label="Số lượng thả (Pls):"
                            value={activeCycleData?.totalStocking?.toLocaleString() || 0}
                        />
                    </View>
                )}
            </View>

            {/* Thông tin sang ao - Luôn hiển thị */}
            <View style={[styles.card, { marginTop: spacing.sm }]}>
                <CollapseHead
                    title="Thông tin sang ao"
                    isExpanded={isTransferExpanded}
                    onToggle={() => setIsTransferExpanded(!isTransferExpanded)}
                    style={styles.cardHeader}
                />

                {isTransferExpanded && (
                    <View style={styles.infoContainer}>
                        <DetailRow label="Ngày nhận ao:" value={displayStockingDate} />
                        <DetailRow label="Chuyển sang từ ao:" value={sourcePondName} />
                        <DetailRow label="Ngày nuôi (DOC):" value={`${doc} ngày`} />
                        <DetailRow label="Cỡ tôm (con/kg):" value={shrimpSize} />
                        <DetailRow
                            label="Số lượng tôm sang (con):"
                            value={activeCycleData?.totalStocking?.toLocaleString() || 0}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: {},
    card: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginHorizontal: spacing.md,
    },
    cardHeader: {
        backgroundColor: colors.transparent, // Inherit from card to prevent corner issues
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingHorizontal: spacing.md,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    line: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: spacing.md, // match DataRow internal padding, so 12+4=16 total
    },
    infoContainer: {
        paddingBottom: 16,
        paddingHorizontal: spacing.md,
        gap: 12,
    },
});
