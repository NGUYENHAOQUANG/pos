import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles';
import {
    DropdownHeaderButton,
    DropDownHeaderItem,
} from '@/shared/components/forms/DropdownHeaderButton';
import { ButtonHeader } from '@/features/farm/components/ButtonHeader';
import { FarmActionMenu } from '@/features/reports/components/FarmActionMenu';
import { DropDownButtonBasic } from '@/features/farm/components/DropDownButtonBasic';

interface HeadingReportsProps {
    // Header Props
    farmData?: DropDownHeaderItem[];
    selectedFarm?: DropDownHeaderItem;
    onSelectFarm?: (item: DropDownHeaderItem) => void;
    onRightPress?: () => void;

    // DropDownReports Props
    pondTypeData?: DropDownHeaderItem[];
    selectedPondType?: DropDownHeaderItem;
    onSelectPondType?: (item: DropDownHeaderItem) => void;

    pondData?: DropDownHeaderItem[];
    selectedPond?: DropDownHeaderItem;
    onSelectPond?: (item: DropDownHeaderItem) => void;

    seasonData?: DropDownHeaderItem[];
    selectedSeason?: DropDownHeaderItem;
    onSelectSeason?: (item: DropDownHeaderItem) => void;
    seasonDisabled?: boolean;
}

export const HeadingReports = ({
    farmData,
    selectedFarm,
    onSelectFarm,
    onRightPress,
    pondTypeData,
    selectedPondType,
    onSelectPondType,
    pondData,
    selectedPond,
    onSelectPond,
    seasonData,
    selectedSeason,
    onSelectSeason,
    seasonDisabled,
}: HeadingReportsProps) => {
    const insets = useSafeAreaInsets();
    const [menuVisible, setMenuVisible] = useState(false);

    // Header padding (12) + Button height (40) + Gap (4) = 56
    const menuPosition = { top: insets.top + 56, right: 16 };

    const handleFarmInfoPress = () => {
        setMenuVisible(false);
        if (onRightPress) {
            onRightPress();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Top Row: Farm Selector and Action Button */}
            <View style={styles.headerRow}>
                <View style={styles.leftContainer}>
                    {onSelectFarm && (
                        <DropdownHeaderButton
                            data={farmData}
                            value={selectedFarm}
                            onSelect={onSelectFarm}
                        />
                    )}
                </View>

                <View style={styles.rightContainer}>
                    <ButtonHeader onPress={() => setMenuVisible(true)} />
                </View>
            </View>

            <FarmActionMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onFarmInfo={handleFarmInfoPress}
                position={menuPosition}
            />

            {/* Row 1: Pond Type and Pond Select */}
            <View style={styles.dropdownRow}>
                <View style={styles.halfWidth}>
                    <DropDownButtonBasic
                        data={pondTypeData}
                        value={selectedPondType}
                        onSelect={onSelectPondType}
                        showIcon={false}
                        height={40}
                    />
                </View>
                <View style={styles.halfWidth}>
                    <DropDownButtonBasic
                        data={pondData}
                        value={selectedPond}
                        onSelect={onSelectPond}
                        showIcon={false}
                        height={40}
                    />
                </View>
            </View>

            {/* Row 2: Season Select */}
            <View style={styles.seasonRow}>
                <DropDownButtonBasic
                    data={seasonData}
                    value={selectedSeason}
                    onSelect={onSelectSeason}
                    showIcon={false}
                    height={40}
                    disabled={seasonDisabled}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundPrimary,
        paddingBottom: spacing.md,
        zIndex: 100,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingTop: 12, // Ensure 12px padding top and bottom
        paddingHorizontal: 16,
    },
    leftContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    rightContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderMedium,
        marginBottom: spacing.md, // Spacing after divider
        width: '100%',
    },
    dropdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
        paddingHorizontal: 16,
        gap: spacing.xs,
    },
    halfWidth: {
        flex: 1,
    },

    seasonRow: {
        marginTop: spacing.xs,
        zIndex: 1,
        paddingHorizontal: 16,
    },
});
