import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';

interface FarmOperationItemProps {
  iconName: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  onPress?: () => void;
  isLast?: boolean;
}

const FarmOperationItem: React.FC<FarmOperationItemProps> = ({
  iconName,
  iconColor,
  iconBgColor,
  title,
  onPress,
  isLast,
}) => {
  return (
    <View>
      <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
        </View>
        <Text style={styles.itemTitle}>{title}</Text>
        <AntDesign name="right" size={20} color={colors.text} />
      </TouchableOpacity>
      {!isLast && <View style={styles.itemSeparator} />}
    </View>
  );
};

import { useNavigation } from '@react-navigation/native';

export const FarmOperation: React.FC = () => {
  const navigation = useNavigation<any>();

  const operations = [
    {
      id: 'cycle',
      title: 'Quản lý vụ nuôi',
      iconName: 'fish',
      iconColor: colors.blue[600],
      iconBgColor: colors.blue[50],
      screen: 'AquacultureManagement',
    },
    {
      id: 'environment',
      title: 'Thiết lập thông số môi trường',
      iconName: 'tune',
      iconColor: colors.blue[600],
      iconBgColor: colors.blue[50],
      screen: 'SettingEnvironment',
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>Vận hành trại nuôi</Text>
      <View style={styles.divider} />
      <View>
        {operations.map((item, index) => (
          <FarmOperationItem
            key={item.id}
            iconName={item.iconName}
            iconColor={item.iconColor}
            iconBgColor={item.iconBgColor}
            title={item.title}
            isLast={index === operations.length - 1}
            onPress={() => {
              if (item.screen) {
                navigation.navigate(item.screen);
              }
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '400',
  },
});
