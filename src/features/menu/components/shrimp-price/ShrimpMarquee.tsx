import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet, LayoutChangeEvent, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ShrimpPrice } from '@/features/menu/types/shrimpPrice.types';
import { Colors } from '@/styles/colors';
import { formatPrice, getShrimpImage } from '@/features/menu/utils/shrimpPriceUtils';

interface ShrimpMarqueeProps {
    data: ShrimpPrice[];
    theme: Colors;
}

export const ShrimpMarquee: React.FC<ShrimpMarqueeProps> = ({ data, theme }) => {
    // Duplicate data to create a seamless infinite loop
    const marqueeData = [...data, ...data];
    const scrollX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);

    const handleLayout = (e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        setContentWidth(width);
    };

    useEffect(() => {
        let animation: Animated.CompositeAnimation | null = null;

        if (contentWidth > 0 && data.length > 0) {
            const halfWidth = contentWidth / 2;
            const duration = (halfWidth / 35) * 1000; // Speed: 35px per second

            scrollX.setValue(0);
            animation = Animated.loop(
                Animated.timing(scrollX, {
                    toValue: -halfWidth,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            animation.start();
        }

        return () => {
            if (animation) animation.stop();
        };
    }, [contentWidth, data, scrollX]);

    if (!data || data.length === 0) return null;

    return (
        <View
            style={[
                styles.wrapper,
                { backgroundColor: theme.backgroundTertiary, borderColor: theme.defaultBorder },
            ]}
        >
            <Animated.View
                style={[styles.animatedContainer, { transform: [{ translateX: scrollX }] }]}
            >
                <View style={styles.innerRow} onLayout={handleLayout}>
                    {marqueeData.map((item, index) => {
                        const isUp = item.trend === 'up';
                        const isDown = item.trend === 'down';
                        const trendColor = isUp
                            ? theme.status.activeText
                            : isDown
                            ? theme.status.warningText
                            : theme.textSecondary;
                        const icon = isUp ? 'caret-up' : isDown ? 'caret-down' : 'remove';
                        const imageSource = item.image
                            ? { uri: item.image }
                            : getShrimpImage(item.name);

                        return (
                            <View key={`marquee-${item.id}-${index}`} style={styles.item}>
                                <Image
                                    source={imageSource}
                                    style={[
                                        styles.image,
                                        { backgroundColor: theme.backgroundTertiary },
                                    ]}
                                />
                                <Text style={[styles.name, { color: theme.textSecondary }]}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.price, { color: theme.text }]}>
                                    {formatPrice(item.price)}đ
                                </Text>
                                <Ionicons
                                    name={icon}
                                    size={12}
                                    color={trendColor}
                                    style={styles.iconMargin}
                                />
                                <Text style={[styles.trend, { color: trendColor }]}>
                                    {item.trendValue || '0%'}
                                </Text>
                                <Text style={[styles.separator, { color: theme.defaultBorder }]}>
                                    |
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        height: 36,
        overflow: 'hidden',
        justifyContent: 'center',
        marginHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8,
    },
    animatedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
    },
    innerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    image: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    name: {
        fontSize: 13,
        fontWeight: '500',
        marginRight: 6,
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        marginRight: 4,
    },
    iconMargin: {
        marginRight: 2,
    },
    trend: {
        fontSize: 12,
        fontWeight: '700',
    },
    separator: {
        fontSize: 14,
        fontWeight: '300',
        marginHorizontal: 12,
    },
});
