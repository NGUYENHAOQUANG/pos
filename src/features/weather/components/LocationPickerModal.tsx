import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { IWeatherLocation } from '@/features/weather/types/weather.types';
import { WEATHER_LOCATIONS } from '@/features/weather/utils/weatherLocations';
import AntDesign from 'react-native-vector-icons/AntDesign';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

interface LocationPickerModalProps {
    readonly visible: boolean;
    readonly currentLocation: IWeatherLocation;
    readonly onSelect: (location: IWeatherLocation) => void;
    readonly onClose: () => void;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
    visible,
    currentLocation,
    onSelect,
    onClose,
}) => {
    const insets = useSafeAreaInsets();
    const [searchText, setSearchText] = useState('');

    const filteredLocations = useMemo(() => {
        if (!searchText.trim()) return WEATHER_LOCATIONS;
        const query = searchText.toLowerCase().trim();
        return WEATHER_LOCATIONS.filter(loc => (loc.name ?? '').toLowerCase().includes(query));
    }, [searchText]);

    const handleSelect = (location: IWeatherLocation) => {
        onSelect(location);
        setSearchText('');
        onClose();
    };

    const handleClose = () => {
        setSearchText('');
        onClose();
    };

    const renderItem = ({ item }: { item: IWeatherLocation }) => {
        const isSelected = item.name === currentLocation.name;
        return (
            <TouchableOpacity
                style={[styles.locationItem, isSelected && styles.locationItemSelected]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
            >
                <View style={styles.locationInfo}>
                    <Text style={[styles.locationName, isSelected && styles.locationNameSelected]}>
                        {item.name}
                    </Text>
                    <Text style={styles.locationCoords}>
                        {item.latitude.toFixed(2)}°N, {item.longitude.toFixed(2)}°E
                    </Text>
                </View>
                {isSelected && <AntDesign name="check" size={18} color={colors.blue[600]} />}
            </TouchableOpacity>
        );
    };

    const keyExtractor = (item: IWeatherLocation, index: number) =>
        item.name ?? `location-${index}`;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Dismiss backdrop */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

                {/* Bottom sheet */}
                <View
                    style={[
                        styles.sheet,
                        { paddingBottom: insets.bottom + spacing.md, height: SHEET_HEIGHT },
                    ]}
                >
                    {/* Handle bar */}
                    <View style={styles.handleBar} />

                    {/* Header */}
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Chọn vùng nuôi</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <AntDesign name="close" size={22} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Search input */}
                    <View style={styles.searchContainer}>
                        <AntDesign
                            name="search1"
                            size={16}
                            color={colors.textTertiary}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm tên thành phố/tỉnh"
                            placeholderTextColor={colors.textTertiary}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <AntDesign
                                    name="closecircle"
                                    size={16}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Location list */}
                    <FlatList
                        data={[...filteredLocations]}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Không tìm thấy "{searchText}"</Text>
                            </View>
                        }
                    />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default LocationPickerModal;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        flex: 1,
        backgroundColor: colors.overlayLight,
    },

    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: spacing.md,
    },

    handleBar: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray[300],
        alignSelf: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },

    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },

    sheetTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
        height: 40,
        marginBottom: spacing.sm,
    },

    searchIcon: {
        marginRight: spacing.xs,
    },

    searchInput: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.text,
        padding: 0,
    },

    list: {
        flex: 1,
    },

    listContent: {
        paddingBottom: spacing.md,
    },

    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.sm,
        marginBottom: 2,
    },

    locationItemSelected: {
        backgroundColor: colors.blue[50],
    },

    locationInfo: {
        flex: 1,
    },

    locationName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
    },

    locationNameSelected: {
        color: colors.blue[600],
        fontWeight: typography.fontWeight.semibold,
    },

    locationCoords: {
        fontSize: typography.fontSize.xs,
        color: colors.textTertiary,
        marginTop: 2,
    },

    emptyContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },

    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
});
