import React from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles/colors';
import { QUICK_REPLIES } from '@/features/menu/constants/chatbot.constants';
import { Zone, PondData } from '@/features/farm/types/farm.types';
import { PondCategory } from '@/features/farm/types/pond-category.types';
import { SelectionStep } from '@/features/menu/hooks/useChatbotInput';
import { useInputStyles } from '@/features/menu/styles/chatbotInputStyles';

interface QuickSuggestionChipsProps {
    step: SelectionStep;
    isLoading: boolean;
    zones: Zone[];
    categories: PondCategory[];
    ponds: PondData[];
    showZonePicker: boolean;
    activeZoneName: string | null;
    allZones: Zone[];
    scrollViewRef: React.RefObject<ScrollView | null>;
    onChipPress: (chipText: string) => void;
    onZoneSelect: (zone: Zone) => void;
    onCategorySelect: (category: PondCategory & { id: string }) => void;
    onPondSelect: (pond: PondData & { id: string }) => void;
    onBack: () => void;
    onZonePick: (zone: Zone) => void;
}

export const QuickSuggestionChips: React.FC<QuickSuggestionChipsProps> = ({
    step,
    isLoading,
    zones,
    categories,
    ponds,
    showZonePicker,
    activeZoneName,
    allZones,
    scrollViewRef,
    onChipPress,
    onZoneSelect,
    onCategorySelect,
    onPondSelect,
    onBack,
    onZonePick,
}) => {
    const styles = useInputStyles();

    const renderChips = () => {
        if (isLoading) {
            return (
                <View style={[styles.chip, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                    <ActivityIndicator size="small" color={colors.textSecondary} />
                    <Text style={styles.chipText}>Đang tải...</Text>
                </View>
            );
        }

        type ListItem = { id: string; name: string };
        let data: ListItem[] = [];
        let onItemPress: (item: ListItem) => void = () => {};

        if (step === 'SUGGESTIONS') {
            return QUICK_REPLIES.map(item => (
                <TouchableOpacity
                    key={item.id}
                    style={styles.chip}
                    activeOpacity={0.7}
                    onPress={() => onChipPress(item.text)}
                >
                    <Text style={styles.chipText}>{item.text}</Text>
                </TouchableOpacity>
            ));
        } else if (step === 'SELECT_ZONE') {
            data = zones;
            onItemPress = item => onZoneSelect(item as Zone);
        } else if (step === 'SELECT_CATEGORY') {
            data =
                categories.length > 0
                    ? [...categories, { id: 'all_categories', name: 'Tất cả ao' } as ListItem]
                    : [];
            onItemPress = item => onCategorySelect(item as PondCategory & { id: string });
        } else if (step === 'SELECT_POND') {
            data =
                ponds.length > 0
                    ? [...ponds, { id: 'all_ponds', name: 'Tất cả ao' } as ListItem]
                    : [];
            onItemPress = item => onPondSelect(item as PondData & { id: string });
        }

        return (
            <>
                <TouchableOpacity
                    style={[styles.chip, styles.backChip]}
                    activeOpacity={0.7}
                    onPress={onBack}
                >
                    <Ionicons
                        name="arrow-back"
                        size={16}
                        color={colors.text}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.chipText}>Quay lại</Text>
                </TouchableOpacity>

                {data.length === 0 ? (
                    <View style={styles.chip}>
                        <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                            Không có dữ liệu
                        </Text>
                    </View>
                ) : (
                    data.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.chipAction}
                            activeOpacity={0.7}
                            onPress={() => onItemPress(item)}
                        >
                            <Text style={styles.chipActionText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </>
        );
    };

    // Zone picker replaces suggestion chips when user must select a zone
    if (showZonePicker && !activeZoneName) {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text
                    style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        alignSelf: 'center',
                        marginRight: 4,
                    }}
                >
                    Chọn trại:
                </Text>
                {allZones.map(zone => (
                    <TouchableOpacity
                        key={zone.id}
                        style={styles.zonePickerChip}
                        onPress={() => onZonePick(zone)}
                    >
                        <Text style={styles.selectedZoneText}>{zone.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    }

    return (
        <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
            keyboardShouldPersistTaps="handled"
        >
            {renderChips()}
        </ScrollView>
    );
};
