import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ArrowLeftIcon from '@/assets/Icon/ArrowLeft.svg';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

/**
 * Skeleton placeholder for the PondDetail header area.
 * Mimics the layout of HeaderFarm (detail mode) + HeadingBar tabs.
 */
export const PondDetailHeaderSkeleton: React.FC = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* 1. HeaderSection Skeleton */}
            <View style={[styles.headerSection, { paddingTop: insets.top + 12 }]}>
                {/* Left */}
                <View style={styles.leftContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <ArrowLeftIcon width={20} height={20} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Center */}
                <View style={styles.centerContainer}>
                    {/* Title */}
                    <Skeleton width={120} height={20} borderRadius={4} />
                    {/* Subtitle */}
                    <Skeleton width={60} height={16} borderRadius={4} style={{ marginTop: 4 }} />
                </View>

                {/* Right */}
                <View style={styles.rightContainer}>
                    <View style={styles.rightContent}>
                        <Skeleton
                            width={70}
                            height={28}
                            borderRadius={14}
                            style={{ marginRight: 8 }}
                        />
                        <Skeleton width={40} height={40} borderRadius={20} />
                    </View>
                </View>
            </View>

            {/* 2. HeadingBar Skeleton */}
            <View style={styles.headingBarContainer}>
                <View style={styles.tabBackground}>
                    <View style={styles.tabItem}>
                        <Skeleton width={60} height={20} borderRadius={4} />
                    </View>
                    <View style={styles.tabItem}>
                        <Skeleton width={100} height={20} borderRadius={4} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.backgroundPrimary,
        },
        headerSection: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
            paddingHorizontal: 16,
            zIndex: 1000,
        },
        leftContainer: {
            minWidth: 40,
            alignItems: 'flex-start',
            justifyContent: 'center',
        },
        iconButton: {
            width: 40,
            height: 40,
            borderRadius: borderRadius.full,
            backgroundColor: theme.backgroundButton, // Using proper theme token for back button
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        centerContainer: {
            flex: 1,
            marginHorizontal: 8,
            justifyContent: 'center',
            alignItems: 'flex-start', // Title is aligned to left in Pond Detail
        },
        rightContainer: {
            minWidth: 40,
            alignItems: 'flex-end',
            justifyContent: 'center',
            overflow: 'visible',
            zIndex: 1000,
        },
        rightContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headingBarContainer: {
            paddingTop: 16,
            paddingBottom: 16,
        },
        tabBackground: {
            height: 40,
            backgroundColor: theme.backgroundTertiary,
            borderRadius: borderRadius.full,
            marginHorizontal: 16,
            padding: 4,
            flexDirection: 'row',
            alignItems: 'center',
        },
        tabItem: {
            flex: 1,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
