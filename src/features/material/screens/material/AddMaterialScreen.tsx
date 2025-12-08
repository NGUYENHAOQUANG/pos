import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import { HeaderMeterial } from '../../components/HeaderMaterial';
import { AddMaterial } from '../../components/material/AddMaterial';
import { ButtonBarMaterial } from '../../components/ButtonBarMaterial';
import { colors, spacing } from '@/styles';

import { IMaterial } from '../../types/material.types';

interface AddMaterialScreenProps {
  onBack?: () => void;
  onSave?: (data: Omit<IMaterial, 'id'>) => void;
}

export const AddMaterialScreen: React.FC<AddMaterialScreenProps> = ({ onBack, onSave }) => {
  // Basic Info State
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [unit, setUnit] = useState('');

  // Advanced Info State
  const [usage, setUsage] = useState('');
  const [unitOfUse, setUnitOfUse] = useState('');
  const [dosage, setDosage] = useState('');
  const [manufacturer, setManufacturer] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.container}>
        <HeaderMeterial
          title="Thêm Vật Tư"
          onBackPress={onBack}
          rightComponent={null} // Hide the right button
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <AddMaterial
            name={name}
            onNameChange={setName}
            group={group}
            onGroupChange={setGroup}
            unit={unit}
            onUnitChange={setUnit}
            unitOptions={['Kg', 'G', 'Lít', 'Ml', 'Bao', 'Gói']}
            usage={usage}
            onUsageChange={setUsage}
            unitOfUse={unitOfUse}
            onUnitOfUseChange={setUnitOfUse}
            dosage={dosage}
            onDosageChange={setDosage}
            manufacturer={manufacturer}
            onManufacturerChange={setManufacturer}
          />
        </ScrollView>

        <View style={styles.footer}>
          <ButtonBarMaterial
            mode="double"
            primaryTitle="Lưu thông tin"
            secondaryTitle="Huỷ"
            onPrimaryPress={() => {
              onSave?.({
                name,
                group,
                unit,
                usage,
                unitOfUse,
                dosage,
                manufacturer,
                remaining: 0, // Default value for new material
              });
            }}
            onSecondaryPress={() => onBack?.()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F5FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F5FF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing.md,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
});
