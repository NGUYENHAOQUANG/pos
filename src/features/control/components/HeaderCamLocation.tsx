import React from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    DropdownHeaderButton,
    DropDownHeaderItem,
} from '@/shared/components/forms/DropdownHeaderButton';

export interface FarmLocation {
    id: string;
    name: string;
}

interface HeaderCamLocationProps {
    locations?: FarmLocation[];
    selectedLocation?: FarmLocation;
    onLocationSelect?: (location: FarmLocation) => void;
    onHelpPress?: (position: { x: number; y: number; width: number; height: number }) => void;
    style?: StyleProp<ViewStyle>;
}

const DEFAULT_LOCATIONS: FarmLocation[] = [
    { id: '1', name: 'Trại Kiên Giang' },
    { id: '2', name: 'Trại Cà Mau' },
    { id: '3', name: 'Trại Bạc Liêu' },
    { id: '4', name: 'Trại Sóc Trăng' },
];

export const HeaderCamLocation: React.FC<HeaderCamLocationProps> = ({
    locations = DEFAULT_LOCATIONS,
    selectedLocation,
    onLocationSelect,
    onHelpPress,
    style,
}) => {
    const insets = useSafeAreaInsets();
    const buttonRef = React.useRef<View>(null);
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    // Adapt FarmLocation to DropDownHeaderItem
    const dropdownData: DropDownHeaderItem[] = locations.map(loc => ({
        id: loc.id,
        label: loc.name,
        value: loc,
    }));

    const selectedDropdownItem: DropDownHeaderItem | undefined = selectedLocation
        ? { id: selectedLocation.id, label: selectedLocation.name, value: selectedLocation }
        : dropdownData[0];

    const handleSelect = (item: DropDownHeaderItem) => {
        if (onLocationSelect && item.value) {
            onLocationSelect(item.value);
        }
    };

    const handleHelpPress = () => {
        buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
            if (onHelpPress) {
                onHelpPress({
                    x: pageX || 0,
                    y: pageY || 0,
                    width: width || 0,
                    height: height || 0,
                });
            }
        });
    };

    return (
        <View style={[themedStyles.container, { paddingTop: insets.top + 12 }, style]}>
            {/* Location Picker Reuse */}
            <View style={styles.locationContainer}>
                <DropdownHeaderButton
                    data={dropdownData}
                    value={selectedDropdownItem}
                    onSelect={handleSelect}
                    showIcon={true}
                    height={40}
                />
            </View>
            {/* Help Button */}
            <TouchableOpacity
                ref={buttonRef}
                style={themedStyles.menuButton}
                onPress={handleHelpPress}
                activeOpacity={0.7}
            >
                <Ionicons name="help-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
    );
};

// Static styles
const styles = StyleSheet.create({
    locationContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 64,
            paddingTop: spacing.md,
            paddingBottom: 12,
            paddingHorizontal: 16,
            backgroundColor: theme.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            zIndex: 1000,
        },
        menuButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.borderDark,
            backgroundColor: theme.background,
        },
    });
