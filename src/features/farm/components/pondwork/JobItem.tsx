import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { JobExecution, EnvironmentMeta } from '@/features/farm/types/farm.types';
import { borderRadius, colors } from '@/styles';
import { spacing } from '@/styles/spacing';
import {
    IconFeed,
    IconShrimpInspection,
    IconRuler,
    IconEnvironment,
    IconWaterTreatment,
    IconWaterChanger,
    IconXyPhong,
    IconTroubleshooting,
    IconTransferPond,
    IconCleaningThePond,
    IconDryingThePond,
    IconHarvest,
    IconEdit,
} from '@/assets/icons';
import Warning from '@/assets/Icon/Warning.svg';

export type JobType =
    | 'FEED'
    | 'SHRIMP_INSPECTION'
    | 'MEASURE_SIZE'
    | 'ENVIRONMENT'
    | 'WATER_TREATMENT'
    | 'WATER_CHANGE'
    | 'SIPHON'
    | 'TROUBLESHOOTING'
    | 'TRANSFER_POND'
    | 'CLEAN_POND'
    | 'SUN_DRY_POND'
    | 'HARVEST';

interface JobConfig {
    icon: React.FC<any>;
    backgroundColor: string;
    defaultTitle: string;
}

export const JOB_CONFIG: Record<JobType, JobConfig> = {
    FEED: {
        icon: IconFeed,
        backgroundColor: colors.blue[50],
        defaultTitle: 'Cho ăn',
    },
    SHRIMP_INSPECTION: {
        icon: IconShrimpInspection,
        backgroundColor: colors.orange[50],
        defaultTitle: 'Kiểm tra tôm (canh nhá)',
    },
    MEASURE_SIZE: {
        icon: IconRuler,
        backgroundColor: colors.blue[50],
        defaultTitle: 'Đo kích thước tôm',
    },
    ENVIRONMENT: {
        icon: IconEnvironment,
        backgroundColor: colors.orange[50],
        defaultTitle: 'Đo thông số môi trường',
    },
    WATER_TREATMENT: {
        icon: IconWaterTreatment,
        backgroundColor: colors.blue[50],
        defaultTitle: 'Xử lý nước',
    },
    WATER_CHANGE: {
        icon: IconWaterChanger,
        backgroundColor: colors.blue[50],
        defaultTitle: 'Thay/Cấp nước',
    },
    SIPHON: {
        icon: IconXyPhong,
        backgroundColor: colors.blue[50],
        defaultTitle: 'Xi - phông',
    },
    TROUBLESHOOTING: {
        icon: IconTroubleshooting,
        backgroundColor: colors.orange[50],
        defaultTitle: 'Xử lý sự cố',
    },
    TRANSFER_POND: {
        icon: IconTransferPond,
        backgroundColor: colors.pink[50],
        defaultTitle: 'Sang ao',
    },
    CLEAN_POND: {
        icon: IconCleaningThePond,
        backgroundColor: colors.purple[50],
        defaultTitle: 'Rửa ao',
    },
    SUN_DRY_POND: {
        icon: IconDryingThePond,
        backgroundColor: colors.orange[50],
        defaultTitle: 'Phơi ao',
    },
    HARVEST: {
        icon: IconHarvest,
        backgroundColor: colors.cyan[50],
        defaultTitle: 'Thu hoạch',
    },
};

// ... (keep JOB_CONFIG and JobType)

interface JobCardProps {
    type: JobType;
    title?: string;
    data?: string;
    items?: JobExecution[];
    onPress?: () => void;
    onPressAdd?: () => void;
    onEditItem?: (item: JobExecution) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
    type,
    title,
    data = 'Chưa có dữ liệu.',
    items,
    onPress,
    onPressAdd,
    onEditItem,
}) => {
    const config = JOB_CONFIG[type];
    const displayTitle = title || config.defaultTitle;
    const hasItems = items && items.length > 0;

    const hasWarning = (item: JobExecution) => {
        if (type !== 'ENVIRONMENT' || !item.meta) return false;
        const meta = item.meta as EnvironmentMeta;
        return (
            meta.pHWarning ||
            meta.doWarning ||
            meta.temperatureWarning ||
            meta.salinityWarning ||
            meta.alkalinityWarning ||
            meta.transparencyWarning ||
            meta.kaliWarning ||
            meta.tanWarning ||
            meta.magieWarning ||
            meta.no3Warning
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={onPress}
                disabled={type === 'TRANSFER_POND'}
            >
                <View style={styles.leftContent}>
                    <View style={styles.iconContainer}>
                        <config.icon width={40} height={40} />
                    </View>
                    <Text style={styles.title}>{displayTitle}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.addButton} onPress={onPressAdd}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                    <AntDesign name="right" size={16} color={colors.text} />
                </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.body}>
                {hasItems ? (
                    <View style={styles.listContent}>
                        {/* Always show total count */}
                        <Text style={styles.countText}>{items.length} lượt</Text>
                        {/* Show only the first 3 items (latest ones) */}
                        {items.slice(0, 3).map((item, index, arr) => (
                            <React.Fragment key={item.id || index}>
                                <View style={styles.itemRow}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        <Text style={styles.itemText}>
                                            {item.label} - {item.time}
                                        </Text>
                                        {hasWarning(item) && <Warning width={16} height={16} />}
                                    </View>
                                    {type !== 'TRANSFER_POND' && (
                                        <TouchableOpacity onPress={() => onEditItem?.(item)}>
                                            <IconEdit />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {arr.length > 1 && index < arr.length - 1 && (
                                    <View style={styles.itemDivider} />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.dataText}>{data}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        marginBottom: 8,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    title: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 24,
    },
    addButtonText: {
        fontSize: 20,
        color: colors.text,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: -spacing.md,
    },
    body: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    dataText: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center', // Center only for empty state text if desired, or remove to align left
    },
    listContent: {
        width: '100%',
    },
    countText: {
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
        fontWeight: '400',
    },
    itemDivider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginVertical: spacing.xs,
    },
    headerCountText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
});
