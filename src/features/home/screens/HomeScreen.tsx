import { RootStackNavigationProp } from '@/app/navigation/types';
import { AddMenuModal } from '@/features/home/components/AddMenuModal';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { BackButton, FABMenuItem, FloatingActionButton } from '@/shared/components';
import FarmCard, { FarmStats, FarmType } from '@/shared/components/layout/FarmCard';
import { colors, spacing, typography } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Dummy Data
const DUMMY_STATS: FarmStats = {
  totalJobs: 26,
  feed: 1,
  environment: 2,
  shrimpKT: 5,
  measureShrimpSize: 1,
  otherMisc: 0,
  totalPonds: 5,
  activePonds: 3,
  criticalPonds: 2,
  miscPonds: 5,
};

export function HomeScreen() {
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigationProp>();

  const formatVietnameseDate = (date: Date): string => {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  const handlePreviousDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleCreateBreedingArea = () => {
    navigation.navigate('CreateFarm');
  };

  const handleCreateFarm = () => {
    console.log('Create farm');
    // TODO: Navigate to create farm screen
  };

  const handleCreatePond = () => {
    console.log('Create pond');
    // TODO: Navigate to create pond screen
  };

  // FAB Menu Items
  const fabMenuItems: FABMenuItem[] = [
    {
      icon: 'water',
      label: 'Tạo vùng nuôi',
      onPress: handleCreateBreedingArea,
      backgroundColor: '#E0F7FA',
      iconColor: '#00ACC1',
    },
    {
      icon: 'business',
      label: 'Tạo trại nuôi',
      onPress: handleCreateFarm,
      backgroundColor: '#FFE0B2',
      iconColor: '#FB8C00',
    },
    {
      icon: 'water-outline',
      label: 'Tạo ao',
      onPress: handleCreatePond,
      backgroundColor: '#E3F2FD',
      iconColor: '#1976D2',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top'] : []}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Android status bar spacer */}
      {Platform.OS === 'android' && (
        <View style={{ height: insets.top, backgroundColor: colors.primary }} />
      )}

      {/* Header with blue background */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Quản lý hệ thống nuôi</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity
          onPress={handlePreviousDate}
          activeOpacity={0.7}
          style={styles.dateNavButton}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
          <Text style={styles.dateText}>{formatVietnameseDate(selectedDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNextDate} activeOpacity={0.7} style={styles.dateNavButton}>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Render Farm Cards (Dummy Data) */}
        <View style={styles.cardsContainer}>
          <FarmCard
            id="1"
            name="Tên vùng nuôi ABC"
            code="DB123"
            type={FarmType.BREEDING_AREA}
            stats={DUMMY_STATS}
            containerStyle={styles.cardSpacing}
          />
          <FarmCard
            id="2"
            name="Tên ao 1"
            code="A123"
            type={FarmType.POND}
            stats={DUMMY_STATS}
            containerStyle={styles.cardSpacing}
          />
          <FarmCard
            id="3"
            name="Tên trại nuôi"
            code="A123"
            type={FarmType.FARM}
            stats={DUMMY_STATS}
            containerStyle={styles.cardSpacing}
          />
        </View>

        {/* Empty State (Hidden for now since we're showing dummy data) */}
        {/*
        <View style={styles.emptyStateText}>
          <Text style={styles.emptyTitle}>Bạn chưa có hệ thống nuôi nào.</Text>
          <Text style={styles.emptyDescription}>
            Tạo hệ thống nuôi để bắt đầu quản lý vùng nuôi, trại và ao một cách dễ dàng hơn.
          </Text>
        </View>
        */}

        {/* Create System Cards (Optional: Keep them at bottom or remove if redundant) */}
        {/* <View style={styles.createCardsContainer}>
          <CreateSystemCard type={SystemType.BREEDING_AREA} onPress={handleCreateBreedingArea} />
          <CreateSystemCard type={SystemType.FARM} onPress={handleCreateFarm} />
          <CreateSystemCard type={SystemType.POND} onPress={handleCreatePond} />
        </View> */}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton menuItems={fabMenuItems} />

      {/* Add Menu Modal */}
      <AddMenuModal
        visible={addMenuVisible}
        onClose={() => setAddMenuVisible(false)}
        onCreateFarm={handleCreateFarm}
        onCreatePond={handleCreatePond}
        onCreateQuickFarm={handleCreateBreedingArea}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        date={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateNavButton: {
    padding: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // Increased padding to avoid cut-off by FAB/BottomBar
    paddingTop: spacing.md,
  },
  cardsContainer: {
    paddingHorizontal: 0, // FarmCard has its own margin
  },
  cardSpacing: {
    marginBottom: spacing.md,
  },
  // ... (Rest of styles if needed, but mostly replaced/unused)
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
  },
  emptyStateText: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  createCardsContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
