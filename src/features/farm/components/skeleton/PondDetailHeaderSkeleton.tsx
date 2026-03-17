import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ArrowLeftIcon from '@/assets/Icon/ArrowLeft.svg';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing, borderRadius } from '@/styles';

/**
 * Skeleton placeholder for the PondDetail header area.
 * Mimics the layout of HeaderFarm (detail mode) + HeadingBar tabs.
 */
export const PondDetailHeaderSkeleton: React.FC = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View>
            {/* Header Row: Back button | Title + Subtitle | Tag + Menu */}
            <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
                {/* Real back button – always tappable even while loading */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon width={20} height={20} />
                </TouchableOpacity>

                {/* Title + Subtitle */}
                <View style={styles.centerContainer}>
                    <Skeleton width={100} height={18} borderRadius={4} />
                    <Skeleton
                        width={50}
                        height={12}
                        borderRadius={4}
                        style={styles.subtitleSkeleton}
                    />
                </View>

                {/* Right: Tag + Menu Button */}
                <View style={styles.rightContainer}>
                    <Skeleton width={60} height={28} borderRadius={14} style={styles.tagSkeleton} />
                    <Skeleton width={40} height={40} borderRadius={20} />
                </View>
            </View>

            {/* Tab Bar Skeleton */}
            <View style={styles.tabBarContainer}>
                <View style={styles.tabBarBackground}>
                    <View style={styles.tabItem}>
                        <Skeleton width={80} height={20} borderRadius={10} />
                    </View>
                    <View style={styles.tabItem}>
                        <Skeleton width={110} height={20} borderRadius={10} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.backgroundPrimary,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    centerContainer: {
        flex: 1,
        marginHorizontal: 8,
        justifyContent: 'center',
    },
    subtitleSkeleton: {
        marginTop: 4,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagSkeleton: {
        marginRight: spacing.sm,
    },
    tabBarContainer: {
        paddingBottom: 16,
        paddingTop: 16,
    },
    tabBarBackground: {
        height: 40,
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.full,
        marginHorizontal: spacing.md,
        padding: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabItem: {
        flex: 1,
        height: 36,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
