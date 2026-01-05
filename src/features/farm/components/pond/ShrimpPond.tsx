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
import { PondTypeTag, PondType } from '@/features/farm/components/pond/PondTypeTag';
import { Tag, TagStatus } from '@/features/farm/components/pond/Tag';
import { ButtonHeader } from '@/features/farm/components/ButtonHeader';
import { useFarm } from '@/features/farm/context/FarmContext';
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
}

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
    // If no update/activity provided, consider it empty/no-data mode
    const hasData = type === 'Ao nuôi' || type === 'Ao vèo' || type === 'Ao sẵn sàng';

    const { activeCycles, getCyclesByPondId, breedOptions, calculateDOC } = useFarm();

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

    const breedLabel = cycleData?.breedSource
        ? breedOptions.find(b => b.value === cycleData.breedSource)?.label
        : undefined;

    // Display Logic Override:
    // If "Ao sẵn sàng" has an active cycle, show as "Ao vèo"
    const displayType = type === 'Ao sẵn sàng' && cycleData ? 'Ao vèo' : type;

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
        {
            label: 'Các chu kì nuôi',
            onPress: () => {
                onCyclePress?.();
                setMenuVisible(false);
            },
        },
    ];

    return (
        <View style={[styles.container, style]}>
            {/* Header Section */}
            <View style={styles.header}>
                <IconPond width={40} height={40} style={{ marginRight: spacing.sm }} />
                <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{name}</Text>
                    <Text style={styles.areaText}>{area}</Text>
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
                {status && <Tag status={status} style={styles.statusTag} />}
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
