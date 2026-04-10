import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Colors } from '@/styles/colors';
import { Loading } from '@/shared/components/ui/Loading';
import { NewsItem } from '@/features/menu/types/news.types';

interface NewsSectionProps {
    newsData: NewsItem[];
    isLoading: boolean;
    error: unknown;
    theme: Colors;
}

/** News tab content with featured card and list */
export const NewsSection: React.FC<NewsSectionProps> = ({ newsData, isLoading, error, theme }) => {
    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Loading size="large" />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Đang tải tin tức...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <Text style={[styles.errorText, { color: theme.red[500] }]}>
                Không thể tải tin tức.
            </Text>
        );
    }

    return (
        <View style={styles.newsContainer}>
            {newsData.map((item, index) => {
                // First item renders as featured card
                if (index === 0) {
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.featuredCard,
                                {
                                    backgroundColor: theme.backgroundTertiary,
                                },
                            ]}
                            activeOpacity={0.9}
                        >
                            <Image source={{ uri: item.image }} style={styles.featuredImage} />
                            <View
                                style={[styles.featuredOverlay, { backgroundColor: theme.overlay }]}
                            >
                                <View
                                    style={[styles.categoryTag, { backgroundColor: theme.primary }]}
                                >
                                    <Text style={[styles.categoryTagText, { color: theme.white }]}>
                                        {item.category || 'Tin tức'}
                                    </Text>
                                </View>
                                <Text
                                    style={[styles.featuredTitle, { color: theme.white }]}
                                    numberOfLines={2}
                                >
                                    {item.title}
                                </Text>
                                <Text style={[styles.featuredDate, { color: theme.gray[300] }]}>
                                    {item.date}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }

                // Other items render as horizontal cards
                return (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.newsCard, { backgroundColor: theme.backgroundPrimary }]}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={[
                                styles.newsImage,
                                { backgroundColor: theme.backgroundTertiary },
                            ]}
                        />
                        <View style={styles.newsContent}>
                            <Text
                                style={[styles.newsTitle, { color: theme.text }]}
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>
                            <Text
                                style={[styles.newsSummary, { color: theme.textSecondary }]}
                                numberOfLines={1}
                            >
                                {item.summary}
                            </Text>
                            <Text style={[styles.newsDate, { color: theme.textTertiary }]}>
                                {item.date}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    centerContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    newsContainer: {
        padding: 12,
    },

    // -- Featured Card --
    featuredCard: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    featuredImage: {
        width: '100%',
        height: '100%',
    },
    featuredOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    categoryTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
    },
    categoryTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    featuredTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    featuredDate: {
        fontSize: 12,
    },

    // -- News Card --
    newsCard: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    newsImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
    },
    newsContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    newsTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
        lineHeight: 20,
    },
    newsSummary: {
        fontSize: 12,
        marginBottom: 6,
    },
    newsDate: {
        fontSize: 11,
    },
});
