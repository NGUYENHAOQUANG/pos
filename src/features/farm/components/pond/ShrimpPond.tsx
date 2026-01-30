import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    Dimensions,
} from 'react-native';

import { colors, spacing, borderRadius, shadows, typography } from '@/styles';
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
    type: PondType | string;
    lastUpdate?: string;
    lastActivity?: string;
    onInfoPress?: () => void;
    onCyclePress?: () => void;
    onDetailPress?: () => void;
    style?: StyleProp<ViewStyle>;
    status?: TagStatus;
    pondId?: string;
}

import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';

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
    const activeCycles = useFarmStore(state => state.activeCycles);
    const getCyclesByPondId = useFarmStore(state => state.getCyclesByPondId);
    const breedOptions = useFarmStore(state => state.breedOptions);
    const calculateDOC = useFarmStore(state => state.calculateDOC);
    const pond = useFarmStore(state => state.ponds.find(p => p.id === pondId));

    // --- Dynamic Breed Name Fetching ---
    // 1. Get Zone ID
    const effectiveZoneId = pond?.zoneId?.toString();

    // 2. Fetch Warehouses for this Zone
    const { data: warehouses } = useWarehouses({
        PageSize: 100,
        ZoneId: effectiveZoneId,
    });
    const defaultWarehouseId = warehouses?.[0]?.id;

    // 3. Fetch Shrimp Seeds
    const { data: shrimpSeeds } = useShrimpSeeds(defaultWarehouseId);
    // -----------------------------------

    // --- Dynamic Breed Name Fetching ---
    // 1. Get Zone ID
    // ... (keep this part)

    // Get cycle data for this pond
    const cycleData = useMemo(() => {
        if (!pondId) return null;
        const currentCycle = activeCycles[pondId];
        const cyclesForPond = getCyclesByPondId(pondId);

        // Ưu tiên activeCycle, sau đó tìm cycle có pondId trong receivingPonds, cuối cùng lấy cycle đầu tiên
        return (
            currentCycle ||
            cyclesForPond.find(cycle => cycle.receivingPonds?.includes(pondId)) ||
            cyclesForPond[0] ||
            null
        );
    }, [pondId, activeCycles, getCyclesByPondId]);

    // Calculate DOC
    const doc = useMemo(() => {
        return calculateDOC(cycleData?.stockingDate);
    }, [cycleData?.stockingDate, calculateDOC]);

    const breedLabel = useMemo(() => {
        if (!cycleData?.breedSource) return undefined;

        // 1. Prefer saved name
        if (cycleData.breedName) return cycleData.breedName;

        // 2. Try dynamic API data
        if (shrimpSeeds?.length) {
            const seed = shrimpSeeds.find((s: any) => s.id === cycleData.breedSource);
            if (seed?.materialName) return seed.materialName;
        }

        // 3. Fallback to static/store options
        return breedOptions.find(b => b.value === cycleData.breedSource)?.label;
    }, [cycleData, shrimpSeeds, breedOptions]);

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
                <IconPond width={40} height={40} style={{ marginRight: spacing.sm }} />
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
            {cycleData && hasData && (
                <>
                    <View style={styles.cycleSection}>
                        <View style={styles.cycleHeader}>
                            <Text style={styles.cycleName}>
                                {cycleData.cycleName || 'Chưa đặt tên'}
                            </Text>
                            <Text style={styles.cycleDate}>
                                {cycleData.stockingDate || '-'} - nay
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
                                    {cycleData.stockingQuantity
                                        ? cycleData.stockingQuantity.toLocaleString('vi-VN')
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
        borderRadius: borderRadius.sm,
        ...shadows.sm, // Assuming a small shadow for card look
        borderWidth: 1,
        borderColor: colors.borderDark, // Or transparent if shadow is enough
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
        width: 32, // Smaller menu button in card? Image shows standard size but maybe compact
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
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    detailButtonText: {
        color: colors.primary,
        fontWeight: '500',
        fontSize: 14,
    },
    cycleSection: {
        borderWidth: 1,
        borderColor: '#DEE4ED',
        borderRadius: 8,
        marginHorizontal: spacing.md,
        marginBottom: 12,
    },
    cycleHeader: {
        backgroundColor: '#F0F5FF',
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
