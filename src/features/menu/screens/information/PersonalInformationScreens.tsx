import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { GeneralInformation } from '@/features/menu/components/information/GeneralInformation';
import { FarmConnecter } from '@/features/menu/components/information/FarmConnecter';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { launchImageLibrary } from 'react-native-image-picker';

export const PersonalInformationScreens: React.FC = () => {
  const navigation = useNavigation();
  const { setTabBarVisible } = useTabBarVisibility();
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setTabBarVisible(false);
      return () => {
        setTabBarVisible(true);
      };
    }, [setTabBarVisible])
  );

  // Mock Data
  const userInfo = {
    name: '{ten người nuôi}',
    phone: '{sdt}',
    email: '{email@gmail.com}',
    role: '{chức vụ}',
    level: '{cấp quản lý}',
  };

  const connectedFarms = [
    { id: 1, name: '{Tên trại}', count: '{số lượng}' },
    { id: 2, name: '{Tên trại}', count: '{số lượng}' },
  ];

  const totalFarms = '{số lượng}';

  const handleChangePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri || null);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderMenu title="Thông tin cá nhân" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Info Section */}
        <GeneralInformation
          data={userInfo}
          avatarUri={avatarUri}
          onChangePhoto={handleChangePhoto}
        />

        {/* Connected Farms Section */}
        <FarmConnecter
          totalFarms={totalFarms}
          farms={connectedFarms}
          onFarmPress={farm => console.log('Farm Pressed', farm.id)}
        />

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ButtonBarMenu
        primaryTitle="Lưu thông tin"
        secondaryTitle="Huỷ"
        onPrimaryPress={() => {
          console.log('Save Pressed');
        }}
        onSecondaryPress={() => {
          navigation.goBack();
        }}
        // Using secondaryType="default" (gray border) as per design implicit
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  bottomSpacer: {
    height: 20,
  },
});
