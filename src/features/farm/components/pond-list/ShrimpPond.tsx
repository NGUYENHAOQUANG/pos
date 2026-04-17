import React, { useState, useMemo } from 'react';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Dimensions } from 'react-native';

import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { PondType, POND_TYPES } from '@/features/farm/types/farm.types';
import { CyclePond } from '@/features/farm/types/pond.types';
import { TagStatus } from '@/features/farm/components/pond/Tag';
import {
    ActionMenu,
    ActionMenuItem,
    ActionMenuPosition,
} from '@/shared/components/buttons/ActionMenuButton';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';

// Old imports — kept for reference
// import { useCurrentShrimpBreed } from '@/features/material/hooks/useShrimpSeeds';
// import { useActiveCycle } from '@/features/farm/hooks/useCycle';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';
import { IShrimpSeed } from '@/features/material/types/warehouse.types';
import { useLatestPondActivity } from '@/features/farm/hooks/usePondRecords';
import { pondRecordService } from '@/features/farm/services/pond-record.service';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';
import { createMMKV } from 'react-native-mmkv';
import { NativeModules } from 'react-native';

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
    cyclePond?: CyclePond | null;
    /** Whether to show onboarding spotlight on the detail button */
    showOnboardingDetail?: boolean;
    /** Callback for navigating to pond detail (used by onboarding onNext) */
    onDetailNavigate?: () => void;
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
    cyclePond,
    showOnboardingDetail,
    onDetailNavigate,
}) => {
    const typeValue = typeof type === 'string' ? type : type?.name;

    const theme = useAppTheme();
    const styles = getStyles(theme);

    const hasData =
        typeValue === POND_TYPES.CULTIVATION ||
        typeValue === POND_TYPES.NURSERY ||
        typeValue === POND_TYPES.READY ||
        typeValue === POND_TYPES.SETTLING ||
        typeValue === POND_TYPES.TREATMENT ||
        typeValue === POND_TYPES.WATER_STORAGE ||
        typeValue === POND_TYPES.WASTE;

    const calculateDOC = pondDetailService.calculateDOC;

    // --- OLD: Fetch cycle data via separate API calls (3 calls per card) ---
    // const { data: activeCycle } = useActiveCycle(pondId || '');
    // const cycleData = useMemo(() => {
    //     if (!pondId) return null;
    //     if (activeCycle) return activeCycle;
    //     return null;
    // }, [pondId, activeCycle]);
    // const { breedName } = useCurrentShrimpBreed(
    //     pondId || '',
    //     cycleData?.id || '',
    //     warehouseId || ''
    // );

    // --- NEW: Use cyclePond data from pond list API directly ---
    const effectiveStockingDate = cyclePond?.createAt;
    const doc = useMemo(() => {
        return calculateDOC(effectiveStockingDate);
    }, [effectiveStockingDate, calculateDOC]);

    // Breed name: warehouseItemId is available from cyclePond, only need 1 API call (shrimp seeds)
    const warehouseId = useFarmStore(state => state.currentWarehouseId) ?? undefined;
    const { data: shrimpSeeds } = useShrimpSeeds(warehouseId);
    const breedName = useMemo(() => {
        const itemId = cyclePond?.record?.warehouseItemId;
        if (!itemId || !shrimpSeeds) return undefined;
        const found = shrimpSeeds.find((s: IShrimpSeed) => s.id === itemId);
        return found?.materialName;
    }, [cyclePond?.record?.warehouseItemId, shrimpSeeds]);

    const { data: latestRecordData } = useLatestPondActivity(pondId || '');
    const latestRecord = latestRecordData?.data?.items?.[0];

    React.useEffect(() => {
        if (latestRecord && name) {
            try {
                const widgetStorage = createMMKV({
                    id: 'widget-storage',
                });

                const widgetData = {
                    id: latestRecord.id,
                    operationType: latestRecord.operationType,
                    createdAt: latestRecord.createdAt,
                    pondName: name,
                };

                widgetStorage.set('latestPondRecord', JSON.stringify(widgetData));
                if (NativeModules.WidgetCenter) {
                    NativeModules.WidgetCenter.reloadAllTimelines();
                }
            } catch (error) {
                console.log('Sync widget failed', error);
            }
        }
    }, [latestRecord, name]);

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

    // const effectiveStockingDate = cycleData?.createdAt;
    // const doc = useMemo(() => {
    //     return calculateDOC(effectiveStockingDate);
    // }, [effectiveStockingDate, calculateDOC]);

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

            {cyclePond && (
                <ShrimpPondCycleInfo cyclePond={cyclePond} doc={doc} breedLabel={breedName} />
            )}

            {hasData && (
                <>
                    <View style={styles.divider} />
                    <View style={styles.footer}>
                        {showOnboardingDetail ? (
                            <OnboardingStep step="VIEW_DETAIL" onNext={onDetailNavigate}>
                                <View collapsable={false} style={{ width: '100%' }}>
                                    <TouchableOpacity
                                        style={styles.detailButton}
                                        onPress={onDetailPress}
                                        activeOpacity={1}
                                    >
                                        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                                    </TouchableOpacity>
                                </View>
                            </OnboardingStep>
                        ) : (
                            <TouchableOpacity
                                style={styles.detailButton}
                                onPress={onDetailPress}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                            </TouchableOpacity>
                        )}
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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            overflow: 'hidden',
        },
        divider: {
            height: 1,
            backgroundColor: theme.borderLight,
        },
        footer: {
            padding: spacing.md,
        },
        detailButton: {
            paddingVertical: 10,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.background,
        },
        detailButtonText: {
            color: theme.text,
            fontWeight: '500',
            fontSize: 16,
        },
    });
