import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing, colors } from '@/styles';

// Card section with skeleton header and divider
const CardSkeleton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Skeleton width={150} height={16} borderRadius={4} />
        </View>
        <View style={styles.divider} />
        <View style={styles.cardContent}>{children}</View>
    </View>
);

// Full-width input skeleton with label
const InputSkeleton: React.FC<{ labelWidth?: number }> = ({ labelWidth = 100 }) => (
    <View>
        <Skeleton width={labelWidth} height={14} style={{ marginBottom: 8 }} borderRadius={4} />
        <Skeleton width="100%" height={48} borderRadius={8} />
    </View>
);

// Info row skeleton (label: value)
const InfoRowSkeleton: React.FC = () => (
    <View style={styles.infoRow}>
        <Skeleton width={120} height={14} borderRadius={4} />
        <Skeleton width={80} height={14} borderRadius={4} />
    </View>
);

// Result row skeleton (highlighted bottom row)
const ResultRowSkeleton: React.FC = () => (
    <View style={styles.resultRow}>
        <Skeleton width={160} height={14} borderRadius={4} />
        <Skeleton width={60} height={16} borderRadius={4} />
    </View>
);

// Receiving pond row skeleton
const ReceivingPondSkeleton: React.FC = () => (
    <View style={styles.pondRow}>
        {/* Dropdown */}
        <View style={{ flex: 1, marginRight: 8 }}>
            <Skeleton width={80} height={14} style={{ marginBottom: 8 }} borderRadius={4} />
            <Skeleton width="100%" height={48} borderRadius={8} />
        </View>
        {/* Quantity */}
        <View style={{ flex: 1 }}>
            <Skeleton width={60} height={14} style={{ marginBottom: 8 }} borderRadius={4} />
            <Skeleton width="100%" height={48} borderRadius={8} />
        </View>
    </View>
);

/**
 * Skeleton loading placeholder for Stock Transfer form.
 * Matches the layout of StockTransferForm:
 * 1. GeneralInfoBox (date input)
 * 2. CurrentPondInfoBox (info rows + shrimp size input + result row)
 * 3. TransferInfoBox (transfer method + receiving ponds)
 * 4. SelectionNotesBox (notes textarea)
 */
export const StockTransferSkeleton: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Card 1: Thông tin chung (Date) */}
            <CardSkeleton>
                <InputSkeleton labelWidth={80} />
            </CardSkeleton>

            {/* Card 2: Thông tin ao hiện tại */}
            <CardSkeleton>
                {/* Info rows: Tôm giống + Số lượng thả */}
                <View style={styles.infoSection}>
                    <InfoRowSkeleton />
                    <InfoRowSkeleton />
                </View>

                {/* Cỡ tôm input */}
                <InputSkeleton labelWidth={110} />

                {/* Result: Tổng số tôm dự kiến */}
                <ResultRowSkeleton />
            </CardSkeleton>

            {/* Card 3: Thông tin sang ao */}
            <CardSkeleton>
                {/* Transfer method */}
                <InputSkeleton labelWidth={100} />

                {/* Receiving pond row */}
                <ReceivingPondSkeleton />
            </CardSkeleton>

            {/* Card 4: Ghi chú */}
            <CardSkeleton>
                <View>
                    <Skeleton width={60} height={14} style={{ marginBottom: 8 }} borderRadius={4} />
                    <Skeleton width="100%" height={100} borderRadius={8} />
                </View>
            </CardSkeleton>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <View style={{ flex: 1, marginRight: 12 }}>
                    <Skeleton width="100%" height={48} borderRadius={24} />
                </View>
                <View style={{ flex: 1 }}>
                    <Skeleton width="100%" height={48} borderRadius={24} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        marginTop: 8,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    cardHeader: {
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: 12,
        marginHorizontal: -spacing.md,
    },
    cardContent: {
        gap: spacing.md,
    },
    infoSection: {
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.backgroundPrimary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    pondRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    footer: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
});
