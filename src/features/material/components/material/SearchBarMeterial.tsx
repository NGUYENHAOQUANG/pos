import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Text,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, sizes } from '@/styles';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SearchBarMeterialProps {
    onSearch?: (text: string) => void;
    onFilterPress?: () => void;
}

export const SearchBarMeterial: React.FC<SearchBarMeterialProps> = ({
    onSearch,
    onFilterPress,
}) => {
    const [searchText, setSearchText] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const handleClearSearch = () => {
        setSearchText('');
        onSearch?.('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color={colors.textSecondary || '#999'}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm tên vật tư"
                        placeholderTextColor={colors.textSecondary || '#999'}
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text);
                            onSearch?.(text);
                        }}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <Ionicons
                                name="close-circle"
                                size={18}
                                color={colors.textSecondary || '#999'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.moreButton, isExpanded && styles.moreButtonActive]}
                    onPress={handleToggleExpand}
                >
                    <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color={isExpanded ? colors.primary : (colors.text || '#333')}
                    />
                </TouchableOpacity>
            </View>

            {isExpanded && (
                <View style={styles.expandedContent}>
                    <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
                        <Text style={styles.filterText}>Tất cả nhóm vật tư</Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color={colors.textSecondary || '#999'}
                        />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        backgroundColor: colors.background,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm,
    },
    searchIcon: {
        marginRight: spacing.xs,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: colors.text,
        padding: 0, // Remove default padding on Android
    },
    moreButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    moreButtonActive: {
        borderColor: colors.primary,
    },
    expandedContent: {
        marginTop: spacing.sm,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    filterText: {
        fontSize: 15,
        color: colors.text,
    },
});
