import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@/styles';
import { ShrimpPondList } from '@/features/farm/components/pond/ShrimpPondList';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { FarmStackParamList } from '../../navigation/FarmNavigator';

interface ShrimpPondListScreensProps {}

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const ShrimpPondListScreens: React.FC<ShrimpPondListScreensProps> = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedFarm, setSelectedFarm] = useState<DropDownItem>({
    id: '1',
    label: 'Trại Kiên Giang',
    value: '1',
  });

  const farmOptions: DropDownItem[] = [
    { id: '1', label: 'Trại Kiên Giang', value: '1' },
    { id: '2', label: 'Trại Cà Mau', value: '2' },
    { id: '3', label: 'Trại Bạc Liêu', value: '3' },
  ];

  const handlePondPress = (pond: any) => {
    navigation.navigate('PondDetail', { pond });
  };

  const handlePondInfoPress = (pond: any) => {
    navigation.navigate('PondInfo', { pond });
  };

  const handleFarmInfoPress = () => {
    const farmData = {
      id: selectedFarm.id,
      name: selectedFarm.label,
      code: selectedFarm.value,
      area: '',
      address: '',
    };
    navigation.navigate('FarmInfo', { farm: farmData });
  };

  return (
    <View style={styles.container}>
      <HeaderFarm
        type="list"
        data={farmOptions}
        value={selectedFarm}
        onSelect={setSelectedFarm}
        onMenuPress={handleFarmInfoPress}
      />
      <HeadingFarm
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
        tabType="dashboard"
        counts={{ all: 5, active: 1, preparing: 4 }}
      />
      <ShrimpPondList onPondPress={handlePondPress} onInfoPress={handlePondInfoPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
});
