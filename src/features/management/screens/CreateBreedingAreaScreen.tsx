/**
 * @file CreateBreedingAreaScreen.tsx
 * @description Create Breeding Area Screen
 * @author Auto
 * @created 2025-01-27
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackNavigationProp, RootStackParamList} from '@/app/navigation/types';
import {
  BackButton,
  Input,
  Button,
  ImageUpload,
  CountrySelector,
  MapView,
  Container,
} from '@/shared/components';
import {colors, spacing, typography, sizes} from '@/styles';
import {CreateBreedingAreaFormData} from '../types/management.types';

type CreateFarmRouteProp = RouteProp<RootStackParamList, 'CreateFarm'>;

export function CreateBreedingAreaScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<CreateFarmRouteProp>();
  const insets = useSafeAreaInsets();

  // Listen for location updates from MapEditor
  useEffect(() => {
    const params = route.params;
    if (params?.updatedLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: params.updatedLocation!.latitude,
        longitude: params.updatedLocation!.longitude,
      }));
      // Clear the params
      navigation.setParams({updatedLocation: undefined});
    }
  }, [route.params, navigation]);

  const [formData, setFormData] = useState<CreateBreedingAreaFormData>({
    name: '',
    code: '',
    country: 'Việt Nam',
    countryCode: 'VN',
    address: '',
    latitude: 10.8231, // Default to Ho Chi Minh City
    longitude: 106.6297,
    imageUri: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateBreedingAreaFormData, string>>>({});

  const handleImageSelect = (uri: string) => {
    setFormData(prev => ({...prev, imageUri: uri}));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({...prev, imageUri: null}));
  };

  const handleCountryChange = (value: string, country: {label: string; value: string; code: string}) => {
    setFormData(prev => ({
      ...prev,
      country: country.label,
      countryCode: country.code,
    }));
  };

  const handleLocationChange = (latitude: number, longitude: number) => {
    setFormData(prev => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const handleEditLocation = () => {
    navigation.navigate('MapEditor', {
      latitude: formData.latitude,
      longitude: formData.longitude,
    });
  };

  // Listen for location updates when returning from MapEditor
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Location will be updated via navigation params if needed
      // For now, we'll use a different approach
    });
    return unsubscribe;
  }, [navigation]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateBreedingAreaFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên vùng nuôi';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Vui lòng nhập mã vùng nuôi';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // TODO: Implement API call to create breeding area
      console.log('Form data:', formData);
      Alert.alert('Thành công', 'Tạo vùng nuôi thành công', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === 'ios' ? ['top'] : []}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Android status bar spacer */}
      {Platform.OS === 'android' && (
        <View style={{height: insets.top, backgroundColor: colors.white}} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Tạo vùng nuôi</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Container>
        {/* Image Upload */}
        <ImageUpload
          imageUri={formData.imageUri}
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
        />

        {/* Form Fields */}
        <View style={styles.formRow}>
          <View style={styles.formFieldHalf}>
            <Input
              label="Tên vùng nuôi"
              placeholder="Nhập tên vùng nuôi"
              value={formData.name}
              onChangeText={text => {
                setFormData(prev => ({...prev, name: text}));
                if (errors.name) {
                  setErrors(prev => ({...prev, name: undefined}));
                }
              }}
              error={errors.name}
              required
              containerStyle={styles.inputContainer}
            />
          </View>
          <View style={styles.formFieldHalf}>
            <Input
              label="Mã vùng nuôi"
              placeholder="Nhập mã vùng nuôi"
              value={formData.code}
              onChangeText={text => {
                setFormData(prev => ({...prev, code: text}));
                if (errors.code) {
                  setErrors(prev => ({...prev, code: undefined}));
                }
              }}
              error={errors.code}
              required
              containerStyle={styles.inputContainer}
            />
          </View>
        </View>

        {/* Country Selector */}
        <CountrySelector
          value={formData.countryCode}
          onChange={handleCountryChange}
          label="Quốc gia"
          required
        />

        {/* Address Input */}
        <Input
          label="Địa chỉ"
          placeholder="Nhập địa chỉ"
          value={formData.address}
          onChangeText={text => {
            setFormData(prev => ({...prev, address: text}));
            if (errors.address) {
              setErrors(prev => ({...prev, address: undefined}));
            }
          }}
          error={errors.address}
          required
          multiline
          numberOfLines={2}
        />

        {/* Map */}
        <View style={styles.mapSection}>
          <Text style={styles.mapLabel}>Vị trí</Text>
          <MapView
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={handleLocationChange}
            onEditPress={handleEditLocation}
            height={250}
            editable={true}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title="Gửi"
            onPress={handleSubmit}
            fullWidth
            variant="primary"
          />
        </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  headerSpacer: {
    width: sizes.icon.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  formFieldHalf: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 0,
  },
  mapSection: {
    marginBottom: spacing.lg,
  },
  mapLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  submitContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
