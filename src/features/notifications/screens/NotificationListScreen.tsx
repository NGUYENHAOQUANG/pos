import React from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import {
    useNotifications,
    useMarkNotificationAsRead,
} from '@/features/notifications/hooks/useNotifications';
import { INotification } from '@/features/notifications/types/notification.types';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

export const NotificationListScreen: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const navigation = useNavigation();

    const {
        data: notifications,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
    } = useNotifications();

    const { mutate: markAsReadMutate } = useMarkNotificationAsRead();

    const getIconName = (type: string) => {
        const typeLower = type?.toLowerCase() || '';
        if (
            typeLower.includes('shrimp') ||
            typeLower.includes('water') ||
            typeLower.includes('pond')
        ) {
            return 'droplet';
        }
        if (typeLower.includes('user') || typeLower.includes('account')) {
            return 'user';
        }
        if (
            typeLower.includes('alert') ||
            typeLower.includes('warning') ||
            typeLower.includes('spark')
        ) {
            return 'star';
        }
        return 'bell';
    };

    const handlePressNotification = (item: INotification) => {
        if (!item.isRead) {
            markAsReadMutate(item.id);
        }
        // TODO: Map item.targetUrl to deep linking navigation later if needed
    };

    const renderItem = ({ item }: { item: INotification }) => {
        const isSpark =
            item.type?.toLowerCase().includes('alert') ||
            item.type?.toLowerCase().includes('warning');

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                activeOpacity={0.7}
                onPress={() => handlePressNotification(item)}
            >
                {/* Left Icon */}
                <View style={[styles.iconWrapper, isSpark && styles.iconWrapperSpark]}>
                    <Feather
                        name={getIconName(item.type) as any}
                        size={20}
                        color={isSpark ? theme.white : theme.text}
                    />
                </View>

                {/* Content */}
                <View style={[styles.contentContainer, item.isRead && styles.bodyRead]}>
                    <View style={styles.titleRow}>
                        <Text style={styles.titleText} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View style={styles.timeWrapper}>
                            <Text style={styles.timeText}>
                                {formatDateWithTime(new Date(item.createdAt))}
                            </Text>
                            {!item.isRead && <View style={styles.unreadDot} />}
                        </View>
                    </View>

                    <Text style={styles.subtitleText} numberOfLines={2}>
                        {item.message}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={{ paddingVertical: spacing.md }}>
                <ActivityIndicator color={theme.primaryOrange} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={{ paddingTop: spacing.xl }}>
                    <ActivityIndicator size="large" color={theme.primaryOrange} />
                </View>
            );
        }
        return <EmptyStateCard message="Bạn không có thông báo nào." />;
    };

    return (
        <View style={styles.container}>
            <HeaderSection title="Thông báo" onBack={() => navigation.goBack()} />

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContent,
                    notifications.length === 0 && { flex: 1, justifyContent: 'center' },
                ]}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isFetchingNextPage}
                        onRefresh={refetch}
                    />
                }
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        listContent: {
            paddingVertical: spacing.sm,
            paddingBottom: 80,
            backgroundColor: theme.backgroundPrimary,
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            backgroundColor: 'transparent',
        },
        iconWrapper: {
            width: 44,
            height: 44,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.gray?.[200],
            backgroundColor: theme.white,
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconWrapperSpark: {
            backgroundColor: theme.primary,
            borderWidth: 0,
        },
        contentContainer: {
            flex: 1,
            marginLeft: spacing.md,
            justifyContent: 'center',
        },
        bodyRead: {
            opacity: 0.7,
        },
        titleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
        },
        titleText: {
            flex: 1,
            fontFamily: typography.fontFamily.medium,
            fontWeight: '600',
            fontSize: 15,
            lineHeight: 22,
            color: theme.text,
            marginRight: spacing.sm,
        },
        timeWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        subtitleText: {
            fontFamily: typography.fontFamily.regular,
            fontWeight: '400',
            fontSize: 14,
            lineHeight: 20,
            color: theme.textSecondary,
        },
        timeText: {
            fontFamily: typography.fontFamily.regular,
            fontSize: 12,
            color: theme.textSecondary,
        },
        unreadDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.error,
            marginLeft: 4,
        },
    });
