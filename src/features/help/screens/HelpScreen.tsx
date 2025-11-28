/**
 * @file HelpScreen.tsx
 * @description Help Screen
 * @author Kindy
 * @created 2025-01-XX
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WingBlank, WhiteSpace } from '@ant-design/react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar } from "react-native";
import { colors, commonStyles } from '@/styles';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

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
        <Text style={commonStyles.headerTitle}>Trợ giúp</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <WingBlank size="lg">
          <WhiteSpace size="xl" />
          {/* Empty State */}
          <View style={commonStyles.emptyState}>
            <View style={commonStyles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textTertiary} />
            </View>
            <Text style={commonStyles.emptyTitle}>Trung tâm trợ giúp</Text>
            <Text style={commonStyles.emptyDescription}>
              Tìm kiếm câu trả lời cho các câu hỏi thường gặp
            </Text>
          </View>
          <WhiteSpace size="xl" />
        </WingBlank>
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
});
