import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors } from '@/styles';
import { FarmData } from '@/features/farm/types/farm.types';

interface InfoFieldProps {
  label: string;
  value: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
};

interface FarmInfoCardProps {
  farm?: FarmData;
}

export const FarmInfoCard: React.FC<FarmInfoCardProps> = ({ farm }) => {
  const farmInfo = {
    name: farm?.name || '{ten trai nuoi tom}',
    code: farm?.code || '{mã trại}',
    area: farm?.area || '{}',
    address: farm?.address || '{dia chi trại nuôi}',
  };

  return (
    <View style={styles.card}>
      <InfoField label="Tên trại:" value={farmInfo.name} />
      <InfoField label="Mã trại:" value={farmInfo.code} />
      <InfoField label="Diện tích:" value={farmInfo.area} />
      <InfoField label="Địa chỉ:" value={farmInfo.address} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    // Shadow equivalent to box-shadow: 0px 1px 6px -1px #00000005
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2, // For Android
  },
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.text,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text,
  },
});
