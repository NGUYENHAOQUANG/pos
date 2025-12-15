import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors } from '@/styles';
import { PondData } from '../../types/farm.types';

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

interface PondInfoCardProps {
  pond?: PondData;
}

export const PondInfoCard: React.FC<PondInfoCardProps> = ({ pond }) => {
  const pondInfo = {
    name: pond?.name || '{ten ao nuoi tom}',
    type: pond?.type || '{loại ao}',
    shape: '{hình dáng ao}',
    area: pond?.area || '{diện tích}',
    depth: '{độ sâu}',
  };

  return (
    <View style={styles.card}>
      <InfoField label="Tên ao:" value={pondInfo.name} />
      <InfoField label="Loại ao:" value={pondInfo.type} />
      <InfoField label="Hình dáng ao:" value={pondInfo.shape} />
      <InfoField label="Diện tích:" value={pondInfo.area} />
      <InfoField label="Độ sâu:" value={pondInfo.depth} />
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
