import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { Tag, TagStatus } from '@/features/farm/components/pond/Tag';

interface ShrimpPondInfoProps {
    status?: TagStatus;
    hasData: boolean;
    lastUpdate?: string;
    lastActivity?: string;
}

export const ShrimpPondInfo: React.FC<ShrimpPondInfoProps> = ({
    status,
    hasData,
    lastUpdate,
    lastActivity,
}) => {
    return (
        <View style={styles.body}>
            {hasData ? (
                <View style={styles.contentContainer}>
                    {status && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Trạng thái</Text>
                            <Tag status={status} />
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Lần cập nhật gần nhất:</Text>
                        <Text style={styles.value}>{lastUpdate || '-'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Hoạt động gần nhất:</Text>
                        <Text style={styles.value}>{lastActivity || '-'}</Text>
                    </View>
                </View>
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
    contentContainer: {
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: colors.text,
    },
    value: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    bodyEmptyText: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        paddingVertical: spacing.sm,
    },
});
