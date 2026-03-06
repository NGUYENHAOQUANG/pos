import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { DropDownHeaderItem } from '@/shared/components/forms/DropdownHeaderButton';
import { DropDownButtonBasic } from '@/features/farm/components/DropDownButtonBasic';
import { FarmActionMenu } from '@/features/reports/components/FarmActionMenu';
import { Logo } from '@/shared/components/brand/Logo';

interface HeadingReportsProps {
    farmData?: DropDownHeaderItem[];
    selectedFarm?: DropDownHeaderItem;
    onSelectFarm?: (item: DropDownHeaderItem) => void;
    onRightPress?: () => void;

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
    // pondTypeData and selectedPondType are hidden in the new UI but kept in props for state compatibility
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

    const menuPosition = { top: insets.top + 56, right: 16 };

    const handleFarmInfoPress = () => {
        setMenuVisible(false);
        if (onRightPress) {
            onRightPress();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Top Row: Logo and Notification Action */}
            <View style={styles.topRow}>
                <Logo size="squareXs" />
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <Ionicons name="notifications-outline" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            <FarmActionMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onFarmInfo={handleFarmInfoPress}
                position={menuPosition}
            />

            {/* Row 1: Farm Selector */}
            <View style={styles.row}>
                <View style={styles.fullWidth}>
                    <DropDownButtonBasic
                        data={farmData}
                        value={selectedFarm}
                        onSelect={onSelectFarm}
                        showIcon={false}
                        height={40}
                    />
                </View>
            </View>

            {/* Row 2: Pond Select and Season Select */}
            <View style={styles.dropdownRow}>
                <View style={styles.halfWidth}>
                    <DropDownButtonBasic
                        data={pondData}
                        value={selectedPond}
                        onSelect={onSelectPond}
                        showIcon={false}
                        height={40}
                    />
                </View>
                <View style={styles.halfWidth}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundPrimary,
        paddingBottom: spacing.md,
        zIndex: 100,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        paddingTop: spacing.md,
    },
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.borderDark,
        backgroundColor: colors.white,
    },
    row: {
        paddingHorizontal: 16,
        marginBottom: spacing.xs,
        zIndex: 2,
    },
    fullWidth: {
        width: '100%',
    },
    dropdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: spacing.xs,
        zIndex: 1,
    },
    halfWidth: {
        flex: 1,
    },
});
