import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { CurrentPondInfoBox } from '@/features/farm/components/pondwork/transfer/CurrentPondInfoBox';
import {
  TransferInfoBox,
  ReceivingPondItem,
} from '@/features/farm/components/pondwork/transfer/TransferInfoBox';
import { TransferConfirmationModal } from '@/features/farm/components/pondwork/transfer/TransferConfirmationModal';
import { useFarm } from '@/features/farm/context/FarmContext';
import { TransferMeta } from '@/features/farm/types/farm.types';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddTransferScreen'>;

export const AddTransferScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond, itemToEdit } = route.params || {};
  const insets = useSafeAreaInsets();
  const { setTabBarVisible } = useTabBarVisibility();
  const { getPondJobItems, updatePondJob } = useFarm();

  // Mock data for receiving ponds
  const MOCK_POND_OPTIONS: DropDownItem[] = [
    { id: '1', label: 'Ao 1' },
    { id: '2', label: 'Ao 2' },
    { id: '3', label: 'Ao 3' },
    { id: '4', label: 'Ao 4' },
    { id: '5', label: 'Ao 5' },
  ];

  // Initialize state from itemToEdit if available
  const meta = useMemo(() => (itemToEdit?.meta as TransferMeta) || {}, [itemToEdit?.meta]);
  const [selectedDate, setSelectedDate] = useState<Date>(
    meta.date ? new Date(meta.date) : new Date()
  );
  const [notes, setNotes] = useState<string>(meta.notes || '');
  const [shrimpSize, setShrimpSize] = useState<string>(meta.shrimpSize?.toString() || '60');
  const [transferMethod] = useState<string>(meta.transferMethod || 'Sang hết');

  const actualStockingQuantity = 400000;
  const shrimpBreed = 'Tôm thẻ chân trắng – SIS PL12';

  // Formula: (actualStockingQuantity * 1000) / shrimpSize
  const totalEstimatedShrimp = useMemo(() => {
    if (actualStockingQuantity && shrimpSize && parseFloat(shrimpSize) > 0) {
      return Math.round((actualStockingQuantity * 1000) / parseFloat(shrimpSize));
    }
    return 0;
  }, [shrimpSize]);

  const [receivingPonds, setReceivingPonds] = useState<ReceivingPondItem[]>(() => {
    if (meta.receivingPonds && meta.receivingPonds.length > 0) {
      return meta.receivingPonds;
    }
    return [{ id: Date.now().toString(), quantity: '' }];
  });

  const hasInitialized = useRef(false);

  // Initialize first row with totalEstimatedShrimp when component mounts or totalEstimatedShrimp changes
  useEffect(() => {
    if (!hasInitialized.current && totalEstimatedShrimp > 0) {
      setReceivingPonds(prev => {
        if (prev.length === 1 && prev[0].quantity === '') {
          hasInitialized.current = true;
          return [{ ...prev[0], quantity: totalEstimatedShrimp.toString() }];
        }
        return prev;
      });
    }
  }, [totalEstimatedShrimp]);

  // Store initial data for comparison when editing
  const initialData = useMemo(() => {
    if (!itemToEdit) return null;
    return {
      date: meta.date ? new Date(meta.date) : new Date(),
      notes: meta.notes || '',
      shrimpSize: meta.shrimpSize || '60',
      transferMethod: meta.transferMethod || 'Sang hết',
      receivingPonds: meta.receivingPonds || [],
    };
  }, [itemToEdit, meta]);

  // Hide tab bar when this screen is mounted
  useEffect(() => {
    setTabBarVisible(false);
  }, [setTabBarVisible]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Check if data has changed from initial (when editing)
  const hasChanges = useMemo(() => {
    if (!itemToEdit || !initialData) return true; // New item always has "changes"

    // Compare dates (only date part, not time)
    const currentDateStr = selectedDate.toDateString();
    const initialDateStr = initialData.date.toDateString();
    if (currentDateStr !== initialDateStr) return true;

    // Compare notes
    if (notes !== initialData.notes) return true;

    // Compare shrimpSize
    if (shrimpSize !== initialData.shrimpSize) return true;

    // Compare transferMethod
    if (transferMethod !== initialData.transferMethod) return true;

    // Compare receivingPonds
    if (JSON.stringify(receivingPonds) !== JSON.stringify(initialData.receivingPonds)) return true;

    return false;
  }, [itemToEdit, initialData, selectedDate, notes, shrimpSize, transferMethod, receivingPonds]);

  const isButtonDisabled = itemToEdit && !hasChanges;
  const shouldShowDisabledStyle = itemToEdit && !hasChanges;

  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

  const handleSavePress = () => {
    // Only show confirmation modal for new transfers (not when editing)
    if (!itemToEdit) {
      setIsConfirmationModalVisible(true);
    } else {
      handleSave();
    }
  };

  const handleConfirmSave = () => {
    setIsConfirmationModalVisible(false);
    handleSave();
  };

  const handleCancelConfirmation = () => {
    setIsConfirmationModalVisible(false);
  };

  const handleSave = () => {
    if (!pond?.id) {
      navigation.goBack();
      return;
    }

    const pondId = pond.id;
    const currentItems = getPondJobItems(pondId, 'TRANSFER_POND');

    // Time & date formatting (reuse pattern from feeding)
    const timeString = selectedDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateString = selectedDate.toLocaleDateString('en-GB'); // dd/mm/yyyy

    const baseData = {
      label: itemToEdit?.label || `Lần ${currentItems.length + 1}`,
      time: timeString,
      date: dateString,
      meta: {
        ...(itemToEdit?.meta || {}),
        date: selectedDate,
        notes: notes || undefined,
        shrimpSize,
        transferMethod,
        receivingPonds,
      } as TransferMeta,
    };

    if (itemToEdit) {
      // Update existing TRANSFER_POND job
      const updatedItems = currentItems.map(item =>
        item.id === itemToEdit.id ? { ...item, ...baseData } : item
      );
      updatePondJob(pondId, 'TRANSFER_POND', updatedItems);
    } else {
      // Create new TRANSFER_POND job with proper next index
      let maxIndex = 0;
      currentItems.forEach(item => {
        const match = item.label.match(/Lần (\d+)/);
        if (match) {
          const index = parseInt(match[1], 10);
          if (index > maxIndex) maxIndex = index;
        }
      });
      const nextIndex = maxIndex + 1;

      const newItem = {
        id: Date.now().toString(),
        ...baseData,
        label: `Lần ${nextIndex}`,
      };

      updatePondJob(pondId, 'TRANSFER_POND', [...currentItems, newItem]);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sang ao</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <GeneralInfoBox type="default" date={selectedDate} onDateChange={setSelectedDate} />

        <CurrentPondInfoBox
          shrimpBreed={shrimpBreed}
          actualStockingQuantity={actualStockingQuantity}
          shrimpSize={shrimpSize}
          onShrimpSizeChange={setShrimpSize}
          totalEstimatedShrimp={totalEstimatedShrimp}
        />

        <TransferInfoBox
          transferMethod={transferMethod}
          onTransferMethodPress={() => {
            // TODO: Implement transfer method selection
            console.log('Select transfer method');
          }}
          receivingPonds={receivingPonds}
          onReceivingPondsChange={setReceivingPonds}
          onReceivingPondPress={id => {
            // TODO: Implement pond selection
            console.log('Select receiving pond for id:', id);
          }}
          totalEstimatedShrimp={totalEstimatedShrimp}
          pondOptions={MOCK_POND_OPTIONS}
        />

        <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <ButtonBarMaterial
          mode="double"
          primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
          secondaryTitle="Huỷ"
          onPrimaryPress={handleSavePress}
          onSecondaryPress={handleCancel}
          primaryButtonDisabled={isButtonDisabled}
          primaryButtonStyle={shouldShowDisabledStyle ? styles.disabledButton : undefined}
          primaryButtonTextStyle={shouldShowDisabledStyle ? styles.disabledButtonText : undefined}
        />
      </View>

      {/* Confirmation Modal */}
      <TransferConfirmationModal
        visible={isConfirmationModalVisible}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirmation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 0,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12 - 4,
    paddingBottom: spacing.xs,
  },
  disabledButton: {
    backgroundColor: colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: colors.defaultBorder,
  },
  disabledButtonText: {
    color: colors.borderSubtle,
    lineHeight: 24,
    fontWeight: '400',
    fontSize: 16,
  },
});
