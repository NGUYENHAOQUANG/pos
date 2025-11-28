import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type OnboardingBackgroundProps = {};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OnboardingBackgroundTwo: React.FC<OnboardingBackgroundProps> = ({}) => {
  const pondTranslateY = useSharedValue(SCREEN_HEIGHT * 0.4);
  const tankTranslateX = useSharedValue(-80);
  const appTranslateX = useSharedValue(80);
  const phTranslateY = useSharedValue(50)
  const transformWidth = useSharedValue(0);

  const transformStyle = useAnimatedStyle(() => ({
    width: transformWidth.value,
  }));
  const pondStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pondTranslateY.value }],
  }));
  const tankStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tankTranslateX.value }],
  }));
  const appStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: appTranslateX.value }],
  }));
  const phStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: phTranslateY.value }],
  }))

  useEffect(() => {
    pondTranslateY.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    tankTranslateX.value = withDelay(
      200,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );

    transformWidth.value = withDelay(
      250, // delay tí cho đẹp, muốn thì chỉnh
      withTiming(70, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );

    appTranslateX.value = withDelay(
      200,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );

    phTranslateY.value = withDelay(
      200,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      })
    )
  }, []);

  return (
    <>
      <View style={styles.layerBackground} pointerEvents="none">
        <LinearGradient
          colors={[
            'rgba(233,253,255, 1)', // top: xanh nhạt
            'rgba(252,242,240, 1)', // bottom: hồng nhạt
          ]}
          start={{ x: 0.5, y: 0 }} // từ trên
          end={{ x: 0.5, y: 1 }} // xuống dưới
          style={{ flex: 1 }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.topHalf}>
              <View style={styles.badge}>
                <View style={styles.dot} />
                <Text style={styles.text}>24/7</Text>
              </View>

              <Animated.Image
                source={require('@/assets/backgrounds/shrimp-pond.png')}
                style={[styles.iconContainer, pondStyle]}
                resizeMode="contain"
              />

              <View style={styles.iconsRowContainer}>
                {/* Feeder với gradient + animation riêng */}
                <AnimatedLinearGradient
                  colors={['#CBF5FF', '#FFE7C1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.tankContainer, tankStyle]}
                >
                  <Image
                    source={require('@/assets/backgrounds/feeder.png')}
                    style={styles.tankImage}
                    resizeMode="contain"
                  />
                </AnimatedLinearGradient>

                {/* Transform data */}
                <Animated.Image
                  source={require('@/assets/backgrounds/tranform-data.png')}
                  style={[styles.transformIcon, transformStyle]}
                  resizeMode="contain"
                />

                {/* Phone */}
                <Animated.Image
                  source={require('@/assets/backgrounds/phone.png')}
                  style={[styles.appIcon, appStyle]}
                  resizeMode="contain"
                />
              </View>

              <View
                style={styles.outer}
              >
                <Animated.View style={[styles.inner, phStyle]}>
                  <Ionicons name="water" color="#000" size={24} />
                  <Text style={styles.text}>pH 7.2</Text>
                </Animated.View>
              </View>
            </View>

            {/* Nửa dưới */}
            <View style={styles.bottomHalf}></View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  layerBackground: {
    flex: 1,
  },
  topHalf: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bottomHalf: {
    flex: 1,
  },
  heroContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.1,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  heroImage: {
    width: 220,
    height: 220,
  },
  iconContainer: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pond: {
    // height: 180,
    // width: 256,
  },
  iconsRowContainer: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  // Feeder container (gradient tròn)
  tankContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#0076F7',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tankImage: {
    width: '100%',
    height: '100%',
  },

  // Icon giữa (transform-data)
  transformIcon: {
    width: 60,
    height: 60,
  },

  // Phone bên phải
  appIcon: {
    width: 90,
    height: 110,
  },

  // Icon 24/7
  badge: {
    position: 'absolute',
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999, // pill

    // shadow iOS
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,

    // shadow Android
    elevation: 6,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFC94A',
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2933',
  },

  // php
  outer: {
    position: 'absolute',
    left: "10%",
    bottom: "15%",
    padding: 2,
    borderRadius: 18,
  },
  inner: {
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  icon: {
    width: 26,
    height: 26,
    marginBottom: 6,
  },
});

export default OnboardingBackgroundTwo;
