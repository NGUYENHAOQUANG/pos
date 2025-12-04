/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ViewStyle, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthStackNavigationProp } from '@/app/navigation/types';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SlideItem {
  id: string | number;
  content: React.ReactNode;
}

export interface SliderProps {
  slides: SlideItem[];
  autoPlayDuration?: number;
  progressBarHeight?: number;
  progressBarColor?: string;
  progressBarBackgroundColor?: string;
  containerStyle?: ViewStyle;
  onSlideChange?: (index: number) => void;
  enableAutoPlay?: boolean;
  showPaginationDots?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  slides,
  containerStyle,
  onSlideChange,
  showPaginationDots = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const navigation = useNavigation<AuthStackNavigationProp>();

  const handleFinish = () => {
    console.log('Onboarding Finished. Navigating to Login.');
    navigation.navigate('Login');
  };

  const goToNextSlide = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  };

  const goToPreviousSlide = () => {
    const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    translateX.value = withTiming(-index * SCREEN_WIDTH, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    onSlideChange?.(index);
  };

  const slidesContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Gesture handler for swipe (giữ nguyên để người dùng vẫn vuốt được)
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      const newTranslateX = -currentIndex * SCREEN_WIDTH + event.translationX;
      translateX.value = newTranslateX;
    })
    .onEnd(event => {
      const threshold = SCREEN_WIDTH * 0.3;

      if (event.translationX < -threshold && currentIndex < slides.length - 1) {
        runOnJS(goToSlide)(currentIndex + 1);
      } else if (event.translationX > threshold && currentIndex > 0) {
        runOnJS(goToSlide)(currentIndex - 1);
      } else {
        translateX.value = withTiming(-currentIndex * SCREEN_WIDTH);
      }
    });

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;

  const renderActionButtons = () => {
    const mainButtonText = isLastSlide ? 'Bắt đầu ngay' : 'Tiếp tục';
    const handleMainButtonPress = isLastSlide ? handleFinish : goToNextSlide;

    return (
      <View style={styles.actionContainer}>
        {/* Nút Back */}
        {!isFirstSlide && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPreviousSlide}
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
            style={styles.iconMargin}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <GestureHandlerRootView style={[styles.container, containerStyle]}>
      {/* Slides */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.slidesContainer, slidesContainerStyle]}>
          {slides.map((slide, index) => (
            <View key={slide.id} style={styles.slide}>
              {slide.content}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>

      {/* Pagination Doc */}
      {showPaginationDots && (
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}

      {/* Khu vực Nút Bấm (Action Buttons) */}
      {renderActionButtons()}
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slidesContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  iconMargin: {
    marginLeft: 8,
  },
});

export default Slider;
