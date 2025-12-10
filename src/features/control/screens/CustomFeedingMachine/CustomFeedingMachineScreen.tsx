import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/styles';

import ActivitySchedule, {
  ScheduleItem,
} from '../../components/CustomFeedingMachine/ActivitySchedule';
import { HeadingDevices } from '../../components/HeaderDevices';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { ConfirmModal } from '../../components/CustomFeedingMachine/ConfirmModal';

interface CustomFeedingMachineProps {
  onBack?: () => void;
  initialMode?: 'manual' | 'schedule';
  onSave?: (mode: 'manual' | 'schedule') => void;
}

export default function CustomFeedingMachine({
  onBack,
  initialMode = 'manual',
  onSave,
}: CustomFeedingMachineProps) {
  const navigation = useNavigation();
  const { setTabBarVisible } = useTabBarVisibility();
  const [mode, setMode] = useState<'manual' | 'schedule'>(initialMode);
  const [runDuration, setRunDuration] = useState('');
  const [stopDuration, setStopDuration] = useState('');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Dirty state tracking
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setTabBarVisible(false);
    return () => setTabBarVisible(true);
  }, [setTabBarVisible]);

  const handleSave = () => {
    console.log('Dữ liệu:', { mode, runDuration, stopDuration, schedules });
    onSave?.(mode);
    setIsDirty(false); // Reset dirty state on save
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmModal(true); // Show confirmation if changes exist
    } else {
      leaveScreen();
    }
  };

  const leaveScreen = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <HeadingDevices title="Tuỳ Chỉnh Máy Cho Ăn" onBackPress={handleCancel} />

      <ConfirmModal
        visible={showConfirmModal}
        onConfirm={() => {
          setShowConfirmModal(false);
          leaveScreen();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. CHẾ ĐỘ HOẠT ĐỘNG */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Chế độ hoạt động</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => {
                  setMode('manual');
                  setIsDirty(true);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.radioOuter, mode === 'manual' && styles.radioOuterSelected]}>
                  {mode === 'manual' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Thủ công</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => {
                  setMode('schedule');
                  setIsDirty(true);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.radioOuter, mode === 'schedule' && styles.radioOuterSelected]}>
                  {mode === 'schedule' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Lịch trình</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. CẤU HÌNH MÁY */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cấu hình máy</Text>
            <View style={styles.rowInputs}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Chạy (giây)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập số giây"
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="numeric"
                  value={runDuration}
                  onChangeText={text => {
                    setRunDuration(text);
                    setIsDirty(true);
                  }}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Dừng (phút)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập số phút"
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="numeric"
                  value={stopDuration}
                  onChangeText={text => {
                    setStopDuration(text);
                    setIsDirty(true);
                  }}
                />
              </View>
            </View>
          </View>

          {/* 3. LỊCH HOẠT ĐỘNG */}
          <ActivitySchedule schedules={schedules} onUpdateSchedules={setSchedules} />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnCancel} onPress={handleCancel}>
          <Text style={styles.txtCancel}>Hủy Thay Đổi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
          <Text style={styles.txtSave}>Lưu Thay Đổi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.text,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
    boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.02)',
  },
  btnCancel: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  txtCancel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  btnSave: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  txtSave: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
