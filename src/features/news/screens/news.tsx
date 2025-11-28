/**
 * @file news.tsx
 * @description News Screen - Display news items using ANTD-RN List and Card
 * @see https://rn.mobile.ant.design/components/list
 * @see https://rn.mobile.ant.design/components/card
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar } from "react-native";
import { List, Card } from '@ant-design/react-native';
import { colors, spacing, commonStyles, typography, borderRadius, shadows } from '@/styles';

// Sample news data - in a real app, this would come from an API
const newsItems = [
  {
    id: '1',
    title: 'Kỹ thuật nuôi tôm thẻ chân trắng hiệu quả',
    description: 'Hướng dẫn chi tiết về kỹ thuật nuôi tôm thẻ chân trắng đạt năng suất cao, giảm thiểu rủi ro dịch bệnh.',
    date: '2 giờ trước',
    category: 'Kỹ thuật',
    image: null,
  },
  {
    id: '2',
    title: 'Thị trường tôm xuất khẩu tháng 11/2025',
    description: 'Giá tôm xuất khẩu tăng nhẹ, nhu cầu thị trường châu Âu và Mỹ ổn định trong quý cuối năm.',
    date: '5 giờ trước',
    category: 'Thị trường',
    image: null,
  },
  {
    id: '3',
    title: 'Cảnh báo dịch bệnh đốm trắng trên tôm',
    description: 'Các tỉnh miền Tây xuất hiện dịch bệnh đốm trắng, người nuôi cần chú ý phòng ngừa và xử lý kịp thời.',
    date: '1 ngày trước',
    category: 'Cảnh báo',
    image: null,
  },
  {
    id: '4',
    title: 'Hội thảo công nghệ nuôi tôm bền vững',
    description: 'Sự kiện sẽ diễn ra vào ngày 25/11/2025 tại TP. Cần Thơ, giới thiệu các công nghệ nuôi tôm tiên tiến.',
    date: '2 ngày trước',
    category: 'Sự kiện',
    image: null,
  },
];

export default function NewsScreen() {
  const insets = useSafeAreaInsets();

  const handleNewsPress = (newsId: string) => {
    console.log('News item pressed:', newsId);
    // TODO: Navigate to news detail screen
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cảnh báo':
        return colors.error;
      case 'Thị trường':
        return colors.success;
      case 'Sự kiện':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Android status bar spacer */}
      {Platform.OS === "android" && (
        <View style={{ height: insets.top, backgroundColor: colors.white }} />
      )}

      {/* Header */}
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Tin tức</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {newsItems.length === 0 ? (
          /* Empty State */
          <View style={commonStyles.emptyState}>
            <View style={commonStyles.emptyIconContainer}>
              <Ionicons name="newspaper-outline" size={64} color={colors.textTertiary} />
            </View>
            <Text style={commonStyles.emptyTitle}>Chưa có tin tức</Text>
            <Text style={commonStyles.emptyDescription}>
              Tin tức và thông tin mới nhất sẽ được hiển thị ở đây
            </Text>
          </View>
        ) : (
          /* News List using ANTD-RN List */
          <List style={styles.newsList}>
            {newsItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => handleNewsPress(item.id)}
              >
                <Card style={styles.newsCard}>
                  <Card.Body>
                    <View style={styles.cardContent}>
                      {/* Category Badge */}
                      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                        <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                          {item.category}
                        </Text>
                      </View>

                      {/* Title */}
                      <Text style={styles.newsTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      {/* Description */}
                      <Text style={styles.newsDescription} numberOfLines={3}>
                        {item.description}
                      </Text>

                      {/* Footer */}
                      <View style={styles.newsFooter}>
                        <View style={styles.dateContainer}>
                          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                          <Text style={styles.dateText}>{item.date}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                      </View>
                    </View>
                  </Card.Body>
                </Card>
              </TouchableOpacity>
            ))}
          </List>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  newsList: {
    backgroundColor: 'transparent',
  },
  newsCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  cardContent: {
    padding: spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  newsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.base * 1.4,
  },
  newsDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.md,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});
