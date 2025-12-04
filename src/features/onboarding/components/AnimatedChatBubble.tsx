import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type MetricRow = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  iconName: string;
  iconColor: string;
};

type ShrimpChatPreviewProps = {
  avatarSource: ImageSourcePropType;
  question: string;
  answer: string;
  metrics: MetricRow[];
};

type AnimatedChatBubbleProps = {
  children: React.ReactNode;
  style?: any;
  delay?: number; // ms
};

const AnimatedChatBubble: React.FC<AnimatedChatBubbleProps> = ({ children, style, delay = 0 }) => {
  const progress = useSharedValue(0); // 0 -> 1

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        {
          translateY: (1 - progress.value) * 10, // start 10, end 0
        },
      ],
    };
  });

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};

const ShrimpChatPreview: React.FC<ShrimpChatPreviewProps> = ({
  avatarSource,
  question,
  answer,
  metrics,
}) => {
  return (
    <View style={styles.container}>
      {/* Bubble 1: user hỏi */}
      <AnimatedChatBubble style={styles.row} delay={1000}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{question}</Text>
        </View>
      </AnimatedChatBubble>

      {/* Bubble 2: bot trả lời */}
      <AnimatedChatBubble style={[styles.row, styles.bubble2]} delay={1400}>
        <View style={styles.botBubble}>
          <Text style={styles.botBubbleText} numberOfLines={2}>
            {answer}
          </Text>
        </View>
        <View style={styles.botIconContainer}>
          <Image source={require('@/assets/backgrounds/icon-for-answer.png')} />
        </View>
      </AnimatedChatBubble>

      {/* Bubble 3: card báo cáo */}
      <AnimatedChatBubble style={[styles.row, styles.bubble3]} delay={1800}>
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Dưới đây là tóm tắt hằng ngày của bạn</Text>

          {metrics.map(item => (
            <View key={item.id} style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <MaterialCommunityIcons
                  name={item.iconName}
                  size={18}
                  color={item.iconColor}
                  style={styles.iconMargin}
                />
                <Text style={styles.metricLabel}>{item.label}</Text>
              </View>

              <View style={styles.metricRight}>
                <Text style={styles.metricValue}>{item.value}</Text>
                {item.unit ? <Text style={styles.metricUnit}>{item.unit}</Text> : null}
                <View style={styles.statusIndicator} />
              </View>
            </View>
          ))}
        </View>
      </AnimatedChatBubble>
    </View>
  );
};

export default ShrimpChatPreview;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 32,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2B7FFF',
  },
  avatarBot: {
    width: 38,
    height: 38,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: '#1D7CF2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  userBubbleText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  botBubble: {
    maxWidth: '82%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 'auto',
  },
  botIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    flexShrink: 0,
  },
  metricsCard: {
    maxWidth: '82%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginLeft: 'auto',
    marginRight: 38,
  },
  botBubbleText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  metricsTitle: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  metricRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  metricUnit: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  bubble2: {
    marginTop: 8,
    marginLeft: 56,
  },
  bubble3: {
    marginTop: 12,
    marginLeft: 56,
  },
  iconMargin: {
    marginRight: 6,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 32,
    backgroundColor: '#00ff00',
    marginLeft: 4,
  },
});
