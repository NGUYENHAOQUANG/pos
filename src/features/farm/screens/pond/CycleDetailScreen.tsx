import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { useFarm } from '../../context/FarmContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FarmStackParamList } from '../../navigation/FarmNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Sử dụng HeaderFarm có sẵn
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';

import EditIcon from '@/assets/images/Icon/IconFarm/Edit.svg';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CycleDetail'>;

export const CycleDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ScreenRouteProp>();

  // Lấy dữ liệu từ params truyền sang
  const { cycleData, pondId } = route.params || {};
  const { breedOptions, seasonOptions } = useFarm();

  const breedLabel = breedOptions.find(b => b.value === cycleData?.breedSource)?.label || 'N/A';
  const seasonLabel = seasonOptions.find(s => s.value === cycleData?.season)?.label || 'N/A';

  return (
    <View style={styles.container}>
      <HeaderFarm
        type="simple"
        titleAlign="left"
        title={
          <View style={styles.leftTitleContainer}>
            <Text style={styles.headerTitle}>{cycleData?.cycleName}</Text>
            <Text style={styles.headerSubtitle}>
              {cycleData?.stockingDate ? new Date(cycleData.stockingDate).toLocaleDateString('vi-VN') : '---'} - nay
            </Text>
          </View>
        }
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.badgeWrapper}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText} numberOfLines={1}>
                Chưa hoàn thành
              </Text>
            </View>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeaderWithBorder}>
            <Text style={styles.cardTitle}>Thông tin thả giống</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('CreateCycle', { pondId, initialData: cycleData })}
              >
                <EditIcon />
              </TouchableOpacity>
              <Ionicons name="chevron-up" size={20} color="#374151" />
            </View>
          </View>

          {/* ... phần nội dung infoRow giữ nguyên */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vụ nuôi:</Text>
            <Text style={styles.value}>{seasonLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên chu kỳ:</Text>
            <Text style={styles.value}>{cycleData?.cycleName || '---'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tôm giống:</Text>
            <Text style={styles.value}>{breedLabel}</Text>
          </View>

          <View style={[styles.line, { marginVertical: spacing.md }]} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày thả:</Text>
            <Text style={styles.value}>
              {cycleData?.stockingDate ? new Date(cycleData.stockingDate).toLocaleDateString('vi-VN') : '---'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số ngày nuôi (DOC):</Text>
            <Text style={styles.value}>1 ngày</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số lượng thả (Pls):</Text>
            <Text style={styles.value}>{cycleData?.stockingQuantity?.toLocaleString() || 0}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  // ... các styles khác giữ nguyên
  badgeWrapper: {
    width: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'relative',
  },
  statusBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '#FFE58F',
    position: 'absolute',
  },
  statusText: {
    fontSize: typography.fontSize.regular,
    color: '#D48806',
    fontWeight: typography.fontWeight.regular,
  },
  content: {
    paddingVertical: spacing.sm,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderWithBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // NÚT BỌC 32x32 THEO Ý BA
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  line: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.regular,
  },
  leftTitleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.regular,
  },
});