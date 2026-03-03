import React, { useState, useMemo } from 'react';
import { formatDate } from '@/features/farm/utils/dateUtils';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    Dimensions,
} from 'react-native';

import { colors, spacing, borderRadius, typography } from '@/styles';
import { IconPond } from '@/assets/icons'; // Import new SVG
import { PondTypeTag } from '@/features/farm/components/pond/PondTypeTag';
import { PondType, POND_TYPES } from '@/features/farm/types/farm.types';
import { Tag, TagStatus } from '@/features/farm/components/pond/Tag';
import { ButtonHeader } from '@/features/farm/components/ButtonHeader';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    ActionMenu,
    ActionMenuItem,
    ActionMenuPosition,
} from '@/shared/components/buttons/ActionMenuButton';

interface ShrimpPondProps {
    name: string;
    area: string;
    type: PondType;
    lastUpdate?: string;
    lastActivity?: string;
    onInfoPress?: () => void;
    onCyclePress?: () => void;
    onDetailPress?: () => void;
    style?: StyleProp<ViewStyle>;
    status?: TagStatus;
    pondId?: string;
    effectiveZoneId?: string; // Add prop to receive zoneId from parent
}

import { usePondBreedInfo } from '@/features/farm/hooks/usePondBreedInfo';
import { useActiveCycle } from '@/features/farm/hooks/useCycle';

export const ShrimpPond: React.FC<ShrimpPondProps> = ({
    name,
    area,
    type,
    lastUpdate,
    lastActivity,
    onInfoPress,
    onCyclePress,
    onDetailPress,
    style,
    status,
    pondId,
    effectiveZoneId: propZoneId,
}) => {
    // Logic hasData: Now includes almost all functional ponds
    // Exclude 'Ao lắng' (Settling) as it has no tasks, unless specific logic arises later.
    const typeValue = typeof type === 'string' ? type : type?.name;

    const hasData =
        typeValue === POND_TYPES.CULTIVATION ||
        typeValue === POND_TYPES.NURSERY ||
        typeValue === POND_TYPES.READY ||
        typeValue === POND_TYPES.TREATMENT ||
        typeValue === POND_TYPES.WATER_STORAGE ||
        typeValue === POND_TYPES.WASTE;

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const calculateDOC = useFarmStore(state => state.calculateDOC);
    const pond = useFarmStore(state => state.ponds.find(p => p.id === pondId));
    // Store actions to sync local data
    // Store actions removed as data syncing is handled by list screen

    // Data syncing is now handled centrally by ShrimpPondListScreens
    // We rely on useFarmStore (activeCycles) for data.
    // -----------------------------

    // --- Dynamic Breed Name Fetching ---
    // 1. Get Zone ID - Prefer prop if available (reliable), else try store (might be missing on list refresh)
    const effectiveZoneId = propZoneId || pond?.zoneId?.toString();

    const { getBreedLabel } = usePondBreedInfo(effectiveZoneId);

    // Get cycle data for this pond - prioritize active cycle

    // Get cycle data for this pond - prioritize STORE data (has full details from ShrimpPondListScreens)
    // over fresh API data (which only has basic info from list endpoint)
    // Get cycle data for this pond - prioritize active cycle
    const activeCycle = useActiveCycle(pondId || '');

    const cycleData = useMemo(() => {
        if (!pondId) return null;

        // 1. Prefer active cycle
        if (activeCycle) return activeCycle;

        return null;
    }, [pondId, activeCycle]);

    // Calculate DOC - check both possible field names
    const effectiveStockingDate = cycleData?.stockingDate || cycleData?.startDate;
    const doc = useMemo(() => {
        return calculateDOC(effectiveStockingDate);
    }, [effectiveStockingDate, calculateDOC]);

    const breedLabel = useMemo(() => {
        const breedId = cycleData?.breedSource || cycleData?.warehouseItemId;
        return getBreedLabel(breedId, cycleData?.breedName);
    }, [cycleData, getBreedLabel]);

    // Display Logic Override: REMOVED as per request.
    const displayType = type;

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<ActionMenuPosition>({});
    const buttonRef = React.useRef<View>(null);

    const openMenu = () => {
        if (buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                const windowWidth = Dimensions.get('window').width;
                const rightSpace = windowWidth - (x + width);

                setMenuPosition({
                    top: y + height + 4,
                    right: rightSpace >= 0 ? rightSpace : 24,
                });

                setMenuVisible(true);
            });
        }
    };

    const menuItems: ActionMenuItem[] = [
        {
            label: 'Thông tin ao',
            onPress: () => {
                onInfoPress?.();
                setMenuVisible(false);
            },
        },
        ...(cycleData
            ? [
                  {
                      label: 'Các chu kì nuôi',
                      onPress: () => {
                          onCyclePress?.();
                          setMenuVisible(false);
                      },
                  },
              ]
            : []),
    ];

    return (
        <View style={[styles.container, style]}>
            {/* Header Section */}
            <View style={styles.header}>
                <IconPond width={40} height={40} style={styles.pondIcon} />
                <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{name}</Text>
                    <Text style={styles.areaText}>
                        {area ? `${parseInt(area.toString().replace(/[^0-9.]/g, ''), 10)} m²` : ''}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <PondTypeTag type={displayType} style={styles.tag} />
                    <View ref={buttonRef} collapsable={false}>
                        <ButtonHeader onPress={openMenu} style={styles.menuBtn} />
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Info Section */}
            <View style={styles.body}>
                {status &&
                    (typeValue === POND_TYPES.NURSERY ||
                        typeValue === POND_TYPES.CULTIVATION ||
                        typeValue === POND_TYPES.READY) && (
                        <>
                            <Tag status={status} style={styles.statusTag} />
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
                    <Text style={styles.bodyEmptyText}>
                        Ao chức năng không có dữ liệu công việc
                    </Text>
                )}
            </View>

            {/* Cycle Info Section */}
            {cycleData && cycleData.status !== 'Hoàn thành' && (
                <>
                    <View style={styles.cycleSection}>
                        <View style={styles.cycleHeader}>
                            <Text style={styles.cycleName}>
                                {cycleData.name || cycleData.cycleName || 'Chưa đặt tên'}
                            </Text>
                            <Text style={styles.cycleDate}>
                                {cycleData.stockingDate || cycleData.startDate
                                    ? `${formatDate(
                                          new Date(
                                              (cycleData.stockingDate ||
                                                  cycleData.startDate) as string
                                          )
                                      )} - nay`
                                    : '- - nay'}
                            </Text>
                        </View>
                        <View style={styles.cycleInfo}>
                            <View style={styles.cycleInfoRow}>
                                <Text style={styles.cycleLabel}>Số ngày nuôi (DOC):</Text>
                                <Text style={styles.cycleValue}>{doc}</Text>
                            </View>
                            <View style={styles.cycleInfoRow}>
                                <Text style={styles.cycleLabel}>Số lượng thả (Pls):</Text>
                                <Text style={styles.cycleValue}>
                                    {cycleData.stockingQuantity || cycleData.totalStocking
                                        ? (
                                              cycleData.stockingQuantity ?? cycleData.totalStocking
                                          )?.toLocaleString('vi-VN')
                                        : '-'}
                                </Text>
                            </View>
                            <View style={styles.cycleInfoRow}>
                                <Text style={styles.cycleLabel}>Tôm giống:</Text>
                                <Text style={styles.cycleValue}>{breedLabel || '-'}</Text>
                            </View>
                        </View>
                    </View>
                </>
            )}

            {hasData && (
                <>
                    <View style={styles.divider} />
                    {/* Footer Section */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.detailButton}
                            onPress={onDetailPress}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <ActionMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                position={menuPosition}
                items={menuItems}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        padding: spacing.md,
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    pondIcon: {
        marginRight: spacing.sm,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    areaText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    tag: {
        marginRight: spacing.sm,
        alignSelf: 'center',
    },
    statusTag: {
        marginBottom: spacing.sm,
    },
    menuBtn: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: colors.border,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    body: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
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
    footer: {
        padding: spacing.md,
    },
    detailButton: {
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    detailButtonText: {
        color: colors.primary,
        fontWeight: '400',
        fontSize: 14,
    },
    cycleSection: {
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.md,
        marginBottom: 12,
    },
    cycleHeader: {
        backgroundColor: colors.geekblue[100],
        padding: spacing.sm,
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
    },
    cycleName: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    cycleDate: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    cycleInfo: {
        gap: spacing.xs,
        padding: spacing.sm,
    },
    cycleInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cycleLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        flex: 1,
        fontWeight: typography.fontWeight.bold,
        lineHeight: 22,
    },
    cycleValue: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
    },
});
