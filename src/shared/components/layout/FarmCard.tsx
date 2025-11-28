import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';

export enum FarmType {'BREEDING_AREA' , 'POND' , 'FARM' };

export interface FarmStats {
  totalJobs: number; // Tổng công việc
  feed: number; // Cho ăn
  environment: number; // Môi trường
  shrimpKT: number; // KT tôm
  measureShrimpSize: number; // Đo cỡ tôm
  otherMisc: number; // Khác
  totalPonds: number; // Tổng ao
  activePonds: number; // Hoạt động
  criticalPonds: number; // Nguy cơ
  miscPonds: number; // Khác
}

export interface FarmCardProps {
  id: string;
  name: string;
  code: string;
  type: FarmType;
  stats: FarmStats;
  onEdit?: () => void;
  onViewReport?: () => void;
  containerStyle?: ViewStyle;
}

const FarmCard: React.FC<FarmCardProps> = ({
  name,
  code,
  type,
  stats,
  onEdit,
  onViewReport,
  containerStyle,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case FarmType.BREEDING_AREA:
        return {
          label: 'Vùng nuôi',
          icon: 'leaf-outline',
          color: '#11B3B8',
          bgColor: '#E0FCFC',
          codeLabel: 'Mã vùng',
        };
      case FarmType.POND:
        return {
          label: 'Ao',
          icon: 'water-outline',
          color: '#00h76F7',
          bgColor: '#EBF7FF',
          codeLabel: 'Mã ao',
        };
      case FarmType.FARM:
        return {
          label: 'Trại nuôi',
          icon: 'home-outline',
          color: '#FFA769',
          bgColor: '#FFE8DE',
          codeLabel: 'Mã trại',
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <View style={[styles.card, containerStyle]}>
      {/* --- 1. HEADER SECTION --- */}
      <View style={styles.sectionPadding}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: typeConfig.bgColor }]}>
              <Ionicons name={typeConfig.icon} size={24} color={typeConfig.color} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.farmName}>{name}</Text>
              <Text style={styles.farmCode}>
                {typeConfig.codeLabel}: {code}
              </Text>
            </View>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: '#FFE8DE' }]}>
            <Text style={[styles.typeBadgeText, { color: '#D54D12' }]}>{typeConfig.label}</Text>
          </View>
        </View>
      </View>

      {/* DIVIDER FULL WIDTH (Header vs Body) */}
      <View style={styles.fullWidthDivider} />

      {/* --- 2. BODY SECTION (Chứa cả Main Stats & Status Indicators) --- */}
      <View style={styles.sectionPadding}>
        {/* Main Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.leftStatColumn}>
            <Text style={styles.bigNumber}>{stats.totalJobs}</Text>
            <Text style={styles.statLabel}>Tổng công việc</Text>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.rightStatColumn}>
            <View style={styles.statRow}>
              <View style={styles.statCell}>
                <Text style={styles.smallNumber}>{stats.feed}</Text>
                <Text style={styles.smallLabel}>Cho ăn</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.smallNumber}>{stats.environment}</Text>
                <Text style={styles.smallLabel}>Môi trường</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.smallNumber}>{stats.shrimpKT}</Text>
                <Text style={styles.smallLabel}>KT tôm</Text>
              </View>
            </View>

            <View style={styles.horizontalDivider} />

            <View style={styles.statRow}>
              <View style={styles.statCell}>
                <Text style={styles.smallNumber}>{stats.measureShrimpSize}</Text>
                <Text style={styles.smallLabel}>Đo cỡ tôm</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.smallNumber}>{stats.otherMisc}</Text>
                <Text style={styles.smallLabel}>Khác</Text>
              </View>
              <View style={styles.statCell} />
            </View>
          </View>
        </View>

        {/* DIVIDER NỘI BỘ (Nằm trong padding) */}
        <View style={styles.innerDivider} />

        {/* Status Indicators */}
        <View style={styles.statusRow}>
          <View style={[styles.statusItem, styles.statusBlue]}>
            <Text style={[styles.statusNumber, { color: colors.info }]}>{stats.totalPonds}</Text>
            <Text style={styles.statusLabel}>Tổng ao</Text>
          </View>
          <View style={[styles.statusItem, styles.statusGreen]}>
            <Text style={[styles.statusNumber, { color: colors.success }]}>
              {stats.activePonds}
            </Text>
            <Text style={styles.statusLabel}>Hoạt động</Text>
          </View>
          <View style={[styles.statusItem, styles.statusRed]}>
            <Text style={[styles.statusNumber, { color: colors.error }]}>
              {stats.criticalPonds}
            </Text>
            <Text style={styles.statusLabel}>Nguy cơ</Text>
          </View>
          <View style={[styles.statusItem, styles.statusGray]}>
            <Text style={[styles.statusNumber, { color: colors.gray[700] }]}>
              {stats.miscPonds}
            </Text>
            <Text style={styles.statusLabel}>Khác</Text>
          </View>
        </View>
      </View>

      {/* DIVIDER FULL WIDTH (Body vs Actions) */}
      <View style={styles.fullWidthDivider} />

      {/* --- 3. ACTIONS SECTION --- */}
      <View style={styles.sectionPadding}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.7}>
            <Ionicons name="pencil" color="#242C34" size={16} />
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportButton} onPress={onViewReport} activeOpacity={0.7}>
            {/*<MaterialCommunityIcons name="finance" color="#0076F7" size={16} />*/}
            <Ionicons name="newspaper-outline" color="#0076F7" size={16} />
            <Text style={styles.reportButtonText}>Xem báo cáo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionPadding: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  // --- DIVIDERS ---
  fullWidthDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    width: '100%',
    marginVertical: 8,
  },

  // --- HEADER ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  farmName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  farmCode: {
    fontSize: 13,
    color: '#6b7280',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // --- STATS SECTION ---
  statsContainer: {
    flexDirection: 'row',
  },
  leftStatColumn: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },
  bigNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#242C34',
    textAlign: 'center',
    lineHeight: 16,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    height: '100%',
    marginHorizontal: 8,
  },
  rightStatColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    width: '100%',
    marginVertical: 2,
  },
  smallNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  smallLabel: {
    fontSize: 11,
    color: '#65798D',
  },
  // --- STATUS ROW ---
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBlue: { backgroundColor: '#eff6ff' },
  statusGreen: { backgroundColor: '#f0fdf4' },
  statusRed: { backgroundColor: '#fef2f2' },
  statusGray: { backgroundColor: '#f9fafb' },
  statusNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 11,
    color: '#242C34',
    textAlign: 'center',
  },
  // --- ACTIONS ---
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#242C34',
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0076F7',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0076F7',
  },
});

export default FarmCard;
