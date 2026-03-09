import React, { useState, useMemo } from 'react';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    Dimensions,
} from 'react-native';

import { colors, spacing, borderRadius } from '@/styles';
import { PondType, POND_TYPES } from '@/features/farm/types/farm.types';
import { TagStatus } from '@/features/farm/components/pond/Tag';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    ActionMenu,
    ActionMenuItem,
    ActionMenuPosition,
} from '@/shared/components/buttons/ActionMenuButton';

import { usePondBreedInfo } from '@/features/farm/hooks/usePondBreedInfo';
import { useActiveCycle } from '@/features/farm/hooks/useCycle';
import { useLatestPondActivity } from '@/features/farm/hooks/usePondRecords';
import { pondRecordService } from '@/features/farm/services/pond-record.service';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';

import { ShrimpPondHeader } from './ShrimpPondHeader';
import { ShrimpPondInfo } from './ShrimpPondInfo';
import { ShrimpPondCycleInfo } from './ShrimpPondCycleInfo';

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
    const typeValue = typeof type === 'string' ? type : type?.name;

    const hasData =
        typeValue === POND_TYPES.CULTIVATION ||
        typeValue === POND_TYPES.NURSERY ||
        typeValue === POND_TYPES.READY ||
        typeValue === POND_TYPES.TREATMENT ||
        typeValue === POND_TYPES.WATER_STORAGE ||
        typeValue === POND_TYPES.WASTE;

    const calculateDOC = pondDetailService.calculateDOC;
    const pond = useFarmStore(state => state.ponds.find(p => p.id === pondId));

    const effectiveZoneId = propZoneId || pond?.zoneId?.toString();

    const { getBreedLabel } = usePondBreedInfo(effectiveZoneId);

    const { data: activeCycle } = useActiveCycle(pondId || '');

    const cycleData = useMemo(() => {
        if (!pondId) return null;

        // 1. Prefer active cycle
        if (activeCycle) return activeCycle;

        return null;
    }, [pondId, activeCycle]);

    const { data: latestRecordData } = useLatestPondActivity(pondId || '');
    const latestRecord = latestRecordData?.data?.items?.[0];

    const displayLastUpdate = useMemo(() => {
        if (latestRecord && latestRecord.createdAt) {
            return formatDateWithTime(new Date(latestRecord.createdAt));
        }
        return lastUpdate;
    }, [latestRecord, lastUpdate]);

    const displayLastActivity = useMemo(() => {
        if (latestRecord && latestRecord.operationType) {
            return pondRecordService.getOperationTypeName(latestRecord.operationType);
        }
        return lastActivity;
    }, [latestRecord, lastActivity]);

    const effectiveStockingDate = cycleData?.createdAt;
    const doc = useMemo(() => {
        return calculateDOC(effectiveStockingDate);
    }, [effectiveStockingDate, calculateDOC]);

    const breedLabel = useMemo(() => {
        const breedId = cycleData?.warehouseItemId;
        return getBreedLabel(breedId);
    }, [cycleData, getBreedLabel]);

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
        {
            label: 'Các chu kỳ nuôi',
            onPress: () => {
                onCyclePress?.();
                setMenuVisible(false);
            },
        },
    ];

    return (
        <View style={[styles.container, style]}>
            <ShrimpPondHeader
                name={name}
                area={area}
                displayType={displayType}
                buttonRef={buttonRef}
                onMenuPress={openMenu}
            />

            <View style={styles.divider} />

            <ShrimpPondInfo
                status={status}
                hasData={hasData}
                lastUpdate={displayLastUpdate as string | undefined}
                lastActivity={displayLastActivity as string | undefined}
            />

            {cycleData && (
                <ShrimpPondCycleInfo cycleData={cycleData} doc={doc} breedLabel={breedLabel} />
            )}

            {hasData && (
                <>
                    <View style={styles.divider} />
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
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    footer: {
        padding: spacing.md,
    },
    detailButton: {
        paddingVertical: 10,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    detailButtonText: {
        color: colors.text,
        fontWeight: '500',
        fontSize: 16,
    },
});
