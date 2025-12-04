/**
 * @file DevicesScreen.tsx
 * @description Devices Screen with New Design
 * @author Kindy
 * @created 2025-01-XX
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { spacing } from '@/styles';
import { DeviceCard } from '../components/DeviceCard';
import { DeviceIconButton } from '../components/DeviceIconButton';

const { width } = Dimensions.get('window');

interface CurvedHeaderProps {
  height: number;
  insetsTop: number;
}

const CurvedHeader = React.memo<CurvedHeaderProps>(({ height, insetsTop }) => {
  const curveHeight = 40;

  return (
    <View style={[styles.headerContainer, { height }]}>
      <Svg
        height={height}
        width={width}
        viewBox={`0 0 ${width} ${height}`}
        style={styles.headerSvg}
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#0076F7" stopOpacity="1" />
            <Stop offset="1" stopColor="#00C6FF" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={`M0 0 L${width} 0 L${width} ${height - curveHeight} Q${width / 2} ${height + 20} 0 ${
            height - curveHeight
          } Z`}
          fill="url(#grad)"
        />
      </Svg>
      <View style={[styles.headerContent, { paddingTop: insetsTop + 10 }]}>
        <Text style={styles.headerTitle}>Thiết bị</Text>
      </View>
    </View>
  );
});

CurvedHeader.displayName = 'CurvedHeader';

interface Device {
  id: string;
  name: string;
  type: 'pump' | 'fan' | 'xyphon';
  status: boolean;
  activeColor: string;
  backgroundColor: string;
}

type FilterType = 'all' | 'active' | 'paused';

export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');

  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Máy cho ăn',
      type: 'pump',
      status: false,
      activeColor: '#00BCD4',
      backgroundColor: '#E0F7FA',
    },
    {
      id: '2',
      name: 'Máy thổi khí',
      type: 'pump',
      status: false,
      activeColor: '#4CAF50',
      backgroundColor: '#E8F5E9',
    },
    {
      id: '3',
      name: 'Quạt nước',
      type: 'fan',
      status: true,
      activeColor: '#FFC107',
      backgroundColor: '#FFF9C4',
    },
    {
      id: '4',
      name: 'Xyphong',
      type: 'xyphon',
      status: true,
      activeColor: '#00BCD4',
      backgroundColor: '#E0F7FA',
    },
  ]);

  const handleToggle = React.useCallback((deviceId: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId ? { ...device, status: !device.status } : device
      )
    );
  }, []);

  const filteredDevices = devices.filter(device => {
    if (filter === 'active') return device.status;
    if (filter === 'paused') return !device.status;
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <CurvedHeader height={180} insetsTop={insets.top} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Device Icons Row (Overlapping) */}
        <View style={styles.iconRowContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.iconRowScroll}
          >
            {devices.map(device => (
              <View key={device.id} style={styles.iconWrapper}>
                <DeviceIconButton
                  name={device.name}
                  type={device.type}
                  backgroundColor={device.backgroundColor}
                  iconColor={device.activeColor}
                  isActive={device.status}
                  onPress={() => {}}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Các thiết bị</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Thêm thiết bị</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              Tất cả thiết bị
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterTabText, filter === 'active' && styles.filterTabTextActive]}>
              Đang hoạt động
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'paused' && styles.filterTabActive]}
            onPress={() => setFilter('paused')}
          >
            <Text style={[styles.filterTabText, filter === 'paused' && styles.filterTabTextActive]}>
              Tạm dừng
            </Text>
          </TouchableOpacity>
        </View>

        {/* Device Cards */}
        <View style={styles.cardsContainer}>
          {filteredDevices.map(device => (
            <DeviceCard
              key={device.id}
              id={device.id}
              name={device.name}
              type={device.type}
              status={device.status}
              onToggle={handleToggle}
              activeColor={device.activeColor}
              backgroundColor={device.backgroundColor}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // zIndex removed to allow ScrollView content to overlap if needed,
    // but actually we want ScrollView ON TOP.
    // By default, later elements are on top.
    // So removing zIndex: 1 from header is correct.
  },
  headerSvg: {
    position: 'absolute',
    top: 0,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    marginTop: 100, // Push content down
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 10, // Add some top padding if needed
  },
  iconRowContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    paddingVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: spacing.xl,
    zIndex: 10, // Ensure this container is above the header visually if overlap happens
  },
  iconRowScroll: {
    paddingHorizontal: spacing.md,
  },
  iconWrapper: {
    marginHorizontal: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#0076F7',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0076F7',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#0076F7',
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
  },
});
