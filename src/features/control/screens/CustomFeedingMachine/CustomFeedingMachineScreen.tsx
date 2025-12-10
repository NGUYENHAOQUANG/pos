import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles';

import ActivitySchedule, {
  ScheduleItem,
} from '../../components/CustomFeedingMachine/ActivitySchedule';

export default function CustomFeedingMachine() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'manual' | 'schedule'>('manual');
  const [runDuration, setRunDuration] = useState('');
  const [stopDuration, setStopDuration] = useState('');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const handleSave = () => {
    console.log('Dữ liệu:', { mode, runDuration, stopDuration, schedules });
    Alert.alert('Thành công', 'Đã lưu thay đổi cấu hình máy.');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const headerDynamicStyle = {
    paddingTop: insets.top + 12,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, headerDynamicStyle]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuỳ Chỉnh Máy Cho Ăn</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

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
                onPress={() => setMode('manual')}
                activeOpacity={0.8}
              >
                <View style={[styles.radioOuter, mode === 'manual' && styles.radioOuterSelected]}>
                  {mode === 'manual' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Thủ công</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setMode('schedule')}
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
                  onChangeText={setRunDuration}
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
                  onChangeText={setStopDuration}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerRightPlaceholder: {
    width: 40,
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
