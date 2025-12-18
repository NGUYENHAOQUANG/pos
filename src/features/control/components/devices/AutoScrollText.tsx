import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  ScrollView,
} from 'react-native';

interface AutoScrollTextProps {
  text: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  speed?: number; // pixels per second
  spacing?: number; // gap between duplicated texts
}

export const AutoScrollText: React.FC<AutoScrollTextProps> = ({
  text,
  style,
  containerStyle,
  speed = 30,
  spacing = 40, // consistent gap
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // We only scroll if text is wider than container
  const shouldScroll = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    if (!shouldScroll) {
      scrollX.setValue(0);
      return;
    }

    // Distance to animate: One full text width + spacing
    // This creates the seamless loop effect because at the end of the animation,
    // the second text copy is exactly where the first one started.
    const distance = textWidth + spacing;
    const duration = (distance / speed) * 1000;

    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -distance,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      scrollX.setValue(0);
    };
  }, [shouldScroll, textWidth, containerWidth, speed, spacing, scrollX]);

  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.row, { transform: [{ translateX: scrollX }] }]}>
          {/* First Copy */}
          <Text
            style={[style]}
            numberOfLines={1}
            onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
          >
            {text}
          </Text>

          {/* Second Copy for Infinite Loop (only if scrolling) */}
          {shouldScroll && (
            <Text style={[style, { paddingLeft: spacing }]} numberOfLines={1}>
              {text}
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 0,
  },
});
