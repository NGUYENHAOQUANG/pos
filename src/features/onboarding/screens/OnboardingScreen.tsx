/**
 * @file OnboardingScreen.tsx
 * @description Onboarding Screen - First screen when app opens
 * @author Kindy
 * @created 2025-11-17
 */
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackNavigationProp } from '@/app/navigation/types';
import { colors } from '@/styles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Directions } from 'react-native-gesture-handler/src';
import OnboardingBackgroundTwo from '@/features/onboarding/components/OnboardingBackgroundTwo.tsx';
import OnboardingBackgroundOne from '@/features/onboarding/components/OnboardingBackgroundOne.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OnboardingBackgroundThree from '@/features/onboarding/components/OnboardingBackgroundThree.tsx';
import { Logo } from '@/shared/components/brand/Logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SlideContent = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.slideContentContainer}>
    {/* Logo Section - Giữ nguyên như yêu cầu */}
    <View style={styles.logoContainer}>
      <Logo size="large" />
    </View>

    {/* Nội dung thay đổi */}
    <Text style={styles.slideTitle}>{title}</Text>
    <Text style={styles.slideDescription}>{description}</Text>
  </View>
);

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT / 2);
  const navigation = useNavigation<AuthStackNavigationProp>();

  const sliderAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  const sliderContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Chạy animation ngay khi mount
  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slidesData = [
    {
      id: '1',
      content: (
        <SlideContent
          title="Theo dõi ao nuôi theo thời gian thực"
          description={`Cập nhật tức thì mọi chỉ số môi trường – nhiệt độ, độ mặn, oxy, pH.\nGiúp bạn kiểm soát ao nuôi thông minh, mọi lúc, mọi nơi.`}
        />
      ),
      background: <OnboardingBackgroundOne />,
    },
    {
      id: '2',
      content: (
        <SlideContent
          title="Tự động cho ăn & cảnh báo thông minh"
          description={`Cảm biến thông minh giúp ao nuôi của bạn vận hành tối ưu 24/7.\nTự động điều chỉnh lượng thức ăn, gửi cảnh báo ngay khi có bất thường.`}
        />
      ),
      background: <OnboardingBackgroundTwo />,
    },
    {
      id: '3',
      content: (
        <SlideContent
          title="Trợ lý AI – Luôn sẵn sàng hỗ trợ bạn"
          description={`Khi có thắc mắc về tình trạng ao, lượng ăn hay cách xử lý sự cố,\nchỉ cần hỏi – Mebione AI sẽ giúp bạn đưa ra giải pháp chính xác, nhanh chóng.`}
        />
      ),
      background: <OnboardingBackgroundThree />,
    },
  ];

  const goToNextSlide = () => {
    const nextIndex = (currentIndex + 1) % slidesData.length;
    goToSlide(nextIndex);
  };
  // const goToPreviousSlide = () => {
  //   const prevIndex = currentIndex === 0 ? slidesData.length - 1 : currentIndex - 1;
  //   goToSlide(prevIndex);
  // }; // TODO: Uncomment when implementing previous slide functionality
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    translateX.value = withTiming(-index * SCREEN_WIDTH, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  };

  const flingGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .onStart(() => {})
    .direction(Directions.RIGHT)
    .onStart(() => {});

  const renderActionButtons = () => {
    const isFirstSlide = currentIndex === 0;
    const isLastSlide: boolean = currentIndex === slidesData.length - 1;
    const mainButtonText = isLastSlide ? 'Bắt đầu ngay' : 'Tiếp tục';

    const handleFinish = () => {
      navigation.navigate('Login');
    };

    const handleMainButtonPress = isLastSlide ? handleFinish : goToNextSlide;

    return (
      <View style={styles.actionContainer}>
        {/* Nút Back */}
        {!isFirstSlide && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goToSlide(currentIndex - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" color={colors.primary} size={24} />
          </TouchableOpacity>
        )}

        {/* Nút Main: Sử dụng flexGrow để tự động co giãn */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={handleMainButtonPress}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>{mainButtonText}</Text>
          <Ionicons
            name="arrow-forward-outline"
            color={colors.white}
            size={24}
            style={styles.iconArrow}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" />

      {Platform.OS === 'android' && (
        <View style={{ height: insets.top, backgroundColor: colors.white }} />
      )}

      {/*Layer 1: SliderBackgroundItem */}
      <View style={styles.backgroundWrapper}>{slidesData[currentIndex]?.background}</View>

      {/* Layer 2: Spacer Layer*/}
      <View style={styles.spacer} pointerEvents="none" />

      {/* Layer 3: Content Layer */}
      <Animated.View style={[styles.sliderContainer, sliderContainerAnimatedStyle]}>
        <GestureHandlerRootView style={styles.gestureHandler}>
          <GestureDetector gesture={flingGesture}>
            {/* Layer 3: Content Layer */}
            <Animated.View style={[styles.sliderWrapper, sliderAnimatedStyle]}>
              {slidesData.map(slide => (
                <View key={slide.id} style={styles.slideItem}>
                  {slide.content}
                </View>
              ))}
            </Animated.View>
          </GestureDetector>

          <View style={styles.pagination}>
            {slidesData.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => goToSlide(index)}
                style={[styles.dot, index === currentIndex && styles.activeDot]}
              />
            ))}
          </View>

          {/* Khu vực Nút Bấm (Action Buttons) */}
          {renderActionButtons()}
        </GestureHandlerRootView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    // backgroundColor: colors.secondary,
    // overflow: 'hidden',
  },
  slideContentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    width: SCREEN_WIDTH,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    height: 60,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12, // Khoảng cách giữa Tiêu đề và Mô tả
    lineHeight: 32, // Tăng chiều cao dòng cho tiêu đề dễ đọc
  },
  slideDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24, // Tăng chiều cao dòng cho mô tả
    paddingHorizontal: 10,
  },

  backgroundWrapper: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  // Layer spacer
  spacer: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Layer Content
  sliderContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sliderWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  slideItem: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  activeDot: {
    backgroundColor: '#6366f1',
    width: 24,
  },
  actionContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginRight: 12,
  },
  mainButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  iconArrow: {
    marginLeft: 8,
  },
  gestureHandler: {
    flex: 1,
  },
});
