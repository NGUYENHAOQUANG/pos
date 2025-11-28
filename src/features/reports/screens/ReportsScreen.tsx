import { colors, spacing, typography } from '@/styles';
import React, { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterRow, GrowthSection, SelectorModal, SelectorOption } from '../components';


const BREEDING_AREAS: SelectorOption[] = [
  { label: 'Vùng nuôi A1', value: 'Vùng nuôi A1' },
  { label: 'Vùng nuôi A2', value: 'Vùng nuôi A2' },
  { label: 'Vùng nuôi A3', value: 'Vùng nuôi A3' },
  { label: 'Vùng nuôi B1', value: 'Vùng nuôi B1' },
  { label: 'Vùng nuôi B2', value: 'Vùng nuôi B2' },
  { label: 'Vùng nuôi C1', value: 'Vùng nuôi C1' },
  { label: 'Vùng nuôi C2', value: 'Vùng nuôi C2' },
];

const PONDS: SelectorOption[] = [
  { label: 'Ao A1N1', value: 'Ao A1N1' },
  { label: 'Ao A1N2', value: 'Ao A1N2' },
  { label: 'Ao A1N3', value: 'Ao A1N3' },
  { label: 'Ao A1N4', value: 'Ao A1N4' },
  { label: 'Ao A2N1', value: 'Ao A2N1' },
  { label: 'Ao A2N2', value: 'Ao A2N2' },
  { label: 'Ao A2N3', value: 'Ao A2N3' },
  { label: 'Ao B1N1', value: 'Ao B1N1' },
  { label: 'Ao B1N2', value: 'Ao B1N2' },
  { label: 'Ao B2N1', value: 'Ao B2N1' },
  { label: 'Ao C1N1', value: 'Ao C1N1' },
  { label: 'Ao C1N2', value: 'Ao C1N2' },
];

const CROPS: SelectorOption[] = [
  { label: 'Vụ 4 - 2025 (17/08 - N/A)', value: 'Vụ 4 - 2025 (17/08 - N/A)' },
  { label: 'Vụ 3 - 2025 (15/06 - 17/08)', value: 'Vụ 3 - 2025 (15/06 - 17/08)' },
  { label: 'Vụ 2 - 2025 (10/04 - 15/06)', value: 'Vụ 2 - 2025 (10/04 - 15/06)' },
  { label: 'Vụ 1 - 2025 (01/02 - 10/04)', value: 'Vụ 1 - 2025 (01/02 - 10/04)' },
  { label: 'Vụ 4 - 2024 (20/08 - 15/11)', value: 'Vụ 4 - 2024 (20/08 - 15/11)' },
  { label: 'Vụ 3 - 2024 (15/06 - 20/08)', value: 'Vụ 3 - 2024 (15/06 - 20/08)' },
];

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedBreedingArea, setSelectedBreedingArea] = useState<string | undefined>(
    'Vùng nuôi A1'
  );
  const [selectedPond, setSelectedPond] = useState<string | undefined>('Ao A1N2');
  const [selectedCrop, setSelectedCrop] = useState<string | undefined>('Vụ 4 - 2025 (17/08 - N/A)');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'breedingArea' | 'pond' | 'crop' | null>(null);

  const handleBreedingAreaPress = () => {
    setModalType('breedingArea');
    setModalVisible(true);
  };

  const handlePondPress = () => {
    setModalType('pond');
    setModalVisible(true);
  };

  const handleCropPress = () => {
    setModalType('crop');
    setModalVisible(true);
  };

  const handleModalSelect = (value: string) => {
    if (modalType === 'breedingArea') {
      setSelectedBreedingArea(value);
    } else if (modalType === 'pond') {
      setSelectedPond(value);
    } else if (modalType === 'crop') {
      setSelectedCrop(value);
    }
  };

  const getModalOptions = (): SelectorOption[] => {
    if (modalType === 'breedingArea') return BREEDING_AREAS;
    if (modalType === 'pond') return PONDS;
    if (modalType === 'crop') return CROPS;
    return [];
  };

  const getModalTitle = (): string => {
    if (modalType === 'breedingArea') return 'Chọn Vùng nuôi';
    if (modalType === 'pond') return 'Chọn Ao';
    if (modalType === 'crop') return 'Chọn Vụ';
    return '';
  };

  const getSelectedValue = (): string | undefined => {
    if (modalType === 'breedingArea') return selectedBreedingArea;
    if (modalType === 'pond') return selectedPond;
    if (modalType === 'crop') return selectedCrop;
    return undefined;
  };

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top'] : []}>
      <StatusBar barStyle="light-content" backgroundColor="#007CFF" translucent />
      {Platform.OS === 'android' && (
        <View style={[styles.androidStatusBar, { height: insets.top }]} />
      )}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Báo cáo</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Selectors */}
        <FilterRow
          breedingArea={{
            value: selectedBreedingArea,
            onPress: handleBreedingAreaPress,
            onClear: () => setSelectedBreedingArea(undefined),
          }}
          pond={{
            value: selectedPond,
            onPress: handlePondPress,
            onClear: () => setSelectedPond(undefined),
          }}
          crop={{
            value: selectedCrop,
            onPress: handleCropPress,
            onClear: () => setSelectedCrop(undefined),
          }}
        />

        {/* Growth Section */}
        <GrowthSection />
      </ScrollView>

      {/* Selector Modal */}
      <SelectorModal
        visible={modalVisible}
        title={getModalTitle()}
        options={getModalOptions()}
        selectedValue={getSelectedValue()}
        onSelect={handleModalSelect}
        onClose={() => {
          setModalVisible(false);
          setModalType(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  androidStatusBar: {
    backgroundColor: '#007CFF',
  },
  header: {
    backgroundColor: '#007CFF',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100, 
  },
});
