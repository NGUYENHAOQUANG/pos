import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';

export type JobType =
  | 'FEED'
  | 'SHRIMP_INSPECTION'
  | 'MEASURE_SIZE'
  | 'ENVIRONMENT'
  | 'WATER_TREATMENT'
  | 'WATER_CHANGE'
  | 'SIPHON'
  | 'TROUBLESHOOTING'
  | 'TRANSFER_POND'
  | 'CLEAN_POND'
  | 'SUN_DRY_POND'
  | 'HARVEST';

interface JobConfig {
  icon: ImageSourcePropType;
  backgroundColor: string;
  defaultTitle: string;
}

const JOB_CONFIG: Record<JobType, JobConfig> = {
  FEED: {
    icon: require('../../../../assets/images/Icon/IconFarm/Feed.png'),
    backgroundColor: colors.blue[50],
    defaultTitle: 'Cho ăn',
  },
  SHRIMP_INSPECTION: {
    icon: require('../../../../assets/images/Icon/IconFarm/ShrimpInspection.png'),
    backgroundColor: colors.orange[50],
    defaultTitle: 'Kiểm tra tôm (canh nhá)',
  },
  MEASURE_SIZE: {
    icon: require('../../../../assets/images/Icon/IconFarm/Ruler.png'),
    backgroundColor: colors.blue[50], // Or a different blue/purple if available
    defaultTitle: 'Đo kích thước tôm',
  },
  ENVIRONMENT: {
    icon: require('../../../../assets/images/Icon/IconFarm/Environment.png'),
    backgroundColor: colors.orange[50],
    defaultTitle: 'Đo thông số môi trường',
  },
  WATER_TREATMENT: {
    icon: require('../../../../assets/images/Icon/IconFarm/WaterTreatment.png'),
    backgroundColor: colors.blue[50], // Using blue[50] as generic light blue
    defaultTitle: 'Xử lý nước',
  },
  WATER_CHANGE: {
    icon: require('../../../../assets/images/Icon/IconFarm/WaterChanger.png'),
    backgroundColor: colors.blue[50], // Using blue[50] (cyan-ish)
    defaultTitle: 'Thay/Cấp nước',
  },
  SIPHON: {
    icon: require('../../../../assets/images/Icon/IconFarm/XyPhong.png'),
    backgroundColor: colors.blue[50],
    defaultTitle: 'Xi - phông',
  },
  TROUBLESHOOTING: {
    icon: require('../../../../assets/images/Icon/IconFarm/Troubleshooting.png'),
    backgroundColor: colors.orange[50], // Warning color
    defaultTitle: 'Xử lý sự cố',
  },
  TRANSFER_POND: {
    icon: require('../../../../assets/images/Icon/IconFarm/TransferPond.png'),
    backgroundColor: colors.pink[50],
    defaultTitle: 'Sang ao',
  },
  CLEAN_POND: {
    icon: require('../../../../assets/images/Icon/IconFarm/CleaningThePond.png'),
    backgroundColor: colors.purple[50],
    defaultTitle: 'Rửa ao',
  },
  SUN_DRY_POND: {
    icon: require('../../../../assets/images/Icon/IconFarm/DryingThePond.png'),
    backgroundColor: colors.orange[50],
    defaultTitle: 'Phơi ao',
  },
  HARVEST: {
    icon: require('../../../../assets/images/Icon/IconFarm/Harvest.png'),
    backgroundColor: colors.cyan[50],
    defaultTitle: 'Thu hoạch',
  },
};

export interface JobExecution {
  id: string;
  label: string;
  time: string;
}

interface JobCardProps {
  type: JobType;
  title?: string;
  data?: string;
  items?: JobExecution[];
  onPress?: () => void;
  onPressAdd?: () => void;
  onEditItem?: (item: JobExecution) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  type,
  title,
  data = 'Chưa có dữ liệu.',
  items,
  onPress,
  onPressAdd,
  onEditItem,
}) => {
  const config = JOB_CONFIG[type];
  const displayTitle = title || config.defaultTitle;
  const hasItems = items && items.length > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onPress}>
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
            <Image source={config.icon} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={styles.title}>{displayTitle}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.addButton} onPress={onPressAdd}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <AntDesign name="right" size={16} color={colors.text} />
        </View>
      </TouchableOpacity>
      <View style={styles.divider} />
      <View style={styles.body}>
        {hasItems ? (
          <View style={styles.listContent}>
            <Text style={styles.countText}>{items.length} lượt</Text>
            {items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {item.label} - {item.time}
                </Text>
                <TouchableOpacity onPress={() => onEditItem?.(item)}>
                  <AntDesign name="edit" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.dataText}>{data}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: colors.borderDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 20,
    color: colors.text,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 12,
  },
  body: {
    padding: 12,
  },
  dataText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center', // Center only for empty state text if desired, or remove to align left
  },
  listContent: {
    width: '100%',
  },
  countText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  itemText: {
    fontSize: 16, // Slightly larger for list items
    color: colors.text,
  },
});
