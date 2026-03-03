import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { Tag, TagStatus } from '@/features/farm/components/pond/Tag';
import { POND_TYPES } from '@/features/farm/types/farm.types';

interface ShrimpPondInfoProps {
    status?: TagStatus;
    typeValue?: string;
    hasData: boolean;
    lastUpdate?: string;
    lastActivity?: string;
}

export const ShrimpPondInfo: React.FC<ShrimpPondInfoProps> = ({
    status,
    typeValue,
    hasData,
    lastUpdate,
    lastActivity,
}) => {
    const showStatusTag = !!(
        status &&
        (typeValue === POND_TYPES.NURSERY ||
            typeValue === POND_TYPES.CULTIVATION ||
            typeValue === POND_TYPES.READY)
    );

    return (
        <View style={styles.body}>
            {showStatusTag && (
                <>
                    <Tag status={status!} style={styles.statusTag} />
                    <View
                        style={[
                            styles.divider,
                            { marginHorizontal: -spacing.md, marginBottom: spacing.sm },
                        ]}
                    />
                </>
            )}
            {hasData ? (
                <>
                    <Text style={styles.bodyText}>
                        Lần cập nhật gần nhất:{' '}
                        <Text style={styles.bodyValue}>{lastUpdate || '-'}</Text>
                    </Text>
                    <Text style={[styles.bodyText, { marginTop: spacing.xs }]}>
                        Hoạt động gần nhất:{' '}
                        <Text style={styles.bodyValue}>{lastActivity || '-'}</Text>
                    </Text>
                </>
            ) : (
                <Text style={styles.bodyEmptyText}>Ao chức năng không có dữ liệu công việc</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    body: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    statusTag: {
        marginBottom: spacing.sm,
    },
    bodyText: {
        fontSize: 14,
        color: colors.text,
    },
    bodyValue: {
        color: colors.text,
    },
    bodyEmptyText: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        paddingVertical: spacing.sm,
    },
});
