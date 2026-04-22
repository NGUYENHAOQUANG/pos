import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing } from '@/styles';

interface ZoneHeaderProps {
    title?: string;
    dropdownData?: DropDownItem[];
    dropdownValue?: DropDownItem;
    onDropdownSelect?: (item: DropDownItem) => void;
    dropdownPlaceholder?: string;
    rightComponent?: React.ReactNode;
}

export const ZoneHeader: React.FC<ZoneHeaderProps> = ({
    title = 'Quản Lý Vật Tư',
    dropdownData,
    dropdownValue,
    onDropdownSelect,
    dropdownPlaceholder,
    rightComponent,
}) => {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={[styles.wrapper, { paddingTop: insets.top + 12 }]}>
            {/* Row 1: Title + Right action */}
            <View style={styles.topRow}>
                <Text style={styles.title}>{title}</Text>
                {rightComponent && <View style={styles.rightWrapper}>{rightComponent}</View>}
            </View>

            {/* Row 2: Dropdown full-width */}
            <OnboardingStep step="MATERIAL_SELECTOR" wrapperStyle={{ borderRadius: 12 }}>
                <DropDownButtonBasic
                    data={dropdownData}
                    value={dropdownValue}
                    onSelect={onDropdownSelect}
                    placeholder={dropdownPlaceholder}
                    showIcon={false}
                    height={40}
                    borderRadius={12}
                    style={styles.dropdown}
                />
            </OnboardingStep>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        wrapper: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.sm,
            backgroundColor: theme.transparent,
            zIndex: 1000,
            overflow: 'visible',
        },
        topRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.text,
            flex: 1,
        },
        rightWrapper: {
            marginLeft: spacing.sm,
        },
        dropdown: {
            width: '100%',
        },
    });
