import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { DropDownHeaderItem } from '@/shared/components/forms/DropdownHeaderButton';
import { DropDownButtonBasic } from '@/features/farm/components/DropDownButtonBasic';
import { Logo } from '@/shared/components/brand/Logo';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';

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
    const theme = useAppTheme();

    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top, backgroundColor: theme.backgroundPrimary },
            ]}
        >
            {/* Top Row: Logo and Notification Action */}
            <View style={styles.topRow}>
                <Logo size="squareXs" />
                <OnboardingStep step="REPORT_NOTIFICATION">
                    <View collapsable={false}>
                        <TouchableOpacity
                            style={[
                                styles.notificationButton,
                                {
                                    backgroundColor: theme.background,
                                    borderColor: theme.borderDark,
                                },
                            ]}
                            onPress={onRightPress}
                        >
                            <Ionicons name="notifications-outline" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </OnboardingStep>
            </View>

            {/* Row 1: Farm Selector */}
            <View style={styles.rowOuter}>
                <OnboardingStep step="REPORT_FARM_SELECT">
                    <View
                        collapsable={false}
                        style={{
                            width: '100%',
                            backgroundColor: theme.backgroundPrimary,
                            borderRadius: 8,
                        }}
                    >
                        <DropDownButtonBasic
                            data={farmData}
                            value={selectedFarm}
                            onSelect={onSelectFarm}
                            showIcon={false}
                            height={40}
                        />
                    </View>
                </OnboardingStep>
            </View>

            {/* Row 2: Pond Select and Season Select */}
            <View style={styles.dropdownRowOuter}>
                <OnboardingStep step="REPORT_FILTER">
                    <View collapsable={false} style={styles.dropdownRowInner}>
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
                </OnboardingStep>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: spacing.sm,
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
    },
    rowOuter: {
        paddingHorizontal: 16,
        marginBottom: spacing.xs,
        zIndex: 2,
    },
    dropdownRowOuter: {
        paddingHorizontal: 16,
        zIndex: 1,
    },
    dropdownRowInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.xs,
        width: '100%',
    },
    halfWidth: {
        flex: 1,
    },
});
