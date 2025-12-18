import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles/colors';

export interface WaterSupplyLogData {
  id: string;
  time: string;
  label: string;
  targetLevel: number | string;
  supplyLevel: number | string;
  drainLevel: number | string;
  volumeAfterDrain: number | string;
  volumeSupply: number | string;
  volumeAfterSupply: number | string;
  materials?: { name: string; quantity: string }[];
}

interface WaterSupplyLogItemProps {
  item: WaterSupplyLogData;
  onEdit?: (item: WaterSupplyLogData) => void;
}

export const WaterSupplyLogItem: React.FC<WaterSupplyLogItemProps> = ({ item, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper render row
  const renderRow = (label: string, value: string | number) => (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Time Column */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>

      {/* Timeline Line & Dot */}
      <View style={styles.timelineColumn}>
        <View style={styles.line} />
        <View style={styles.dot} />
      </View>

      {/* Card Content */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Body Content */}
          <View style={styles.cardBody}>
            {renderRow('Mực nước mục tiêu (cm)', item.targetLevel)}
            {renderRow('Số cm cấp', item.supplyLevel)}

            {/* Expanded Content */}
            {isExpanded && (
              <>
                {renderRow('Mực nước xả xuống (cm)', item.drainLevel)}
                {renderRow('Thể tích sau xả (m³)', item.volumeAfterDrain)}
                {renderRow('Thể tích nước cấp vào (m³)', item.volumeSupply)}
                {renderRow('Thể tích nước sau cấp (m³)', item.volumeAfterSupply)}

                {/* Materials List if any */}
                {item.materials && item.materials.length > 0 && (
                  <View style={styles.materialsBlock}>
                    {item.materials.map((mat, idx) => (
                      <View key={idx} style={styles.materialRow}>
                        <Text style={styles.materialName}>{mat.name}</Text>
                        <Text style={styles.materialQty}>{mat.quantity}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Toggle Button */}
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  icon: {
    marginLeft: 4,
  },
  timeColumn: {
    width: 50,
    paddingTop: 16,
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '400',
  },
  timelineColumn: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.borderLight,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginTop: 20,
    zIndex: 1,
  },
  cardContainer: {
    flex: 1,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  cardBody: {
    padding: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    color: colors.text,
  },
  dataValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  materialsBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  materialName: {
    fontSize: 14,
    color: colors.text,
  },
  materialQty: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  toggleBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});
