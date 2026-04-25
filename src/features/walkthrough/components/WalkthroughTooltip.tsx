import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    StyleProp,
    ViewStyle,
} from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NOOP = () => {};
const ANDROID_TOP_ADJUSTMENT = Platform.OS === 'android' ? -(StatusBar.currentHeight || 0) : 0;

interface WalkthroughTooltipProps {
    isVisible: boolean;
    title: string;
    description: string;
    onSkip: () => void;
    onNext: () => void;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    isLastStep?: boolean;
    childrenWrapperStyle?: StyleProp<ViewStyle>;
    allowChildInteraction?: boolean;
}

export const WalkthroughTooltip: React.FC<WalkthroughTooltipProps> = ({
    isVisible,
    title,
    description,
    onSkip,
    onNext,
    children,
    placement = 'bottom',
    isLastStep = false,
    childrenWrapperStyle,
    allowChildInteraction = false,
}) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const insets = useSafeAreaInsets();
    const dynamicInsets = useMemo(
        () => ({
            top: Math.max(insets.top, 24) + 16,
            bottom: Math.max(insets.bottom, 24) + 16,
            left: Math.max(insets.left, 24) + 16,
            right: Math.max(insets.right, 24) + 16,
        }),
        [insets]
    );

    const content = useMemo(
        () => (
            <View style={styles.tooltipContent}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Bỏ qua</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onNext} style={styles.nextButton}>
                        <Text style={styles.nextText}>
                            {isLastStep ? 'Hoàn thành' : 'Tiếp tục'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        ),
        [styles, title, description, onSkip, onNext, isLastStep]
    );

    return (
        <Tooltip
            isVisible={isVisible}
            content={content}
            placement={placement}
            onClose={NOOP}
            backgroundColor={theme.overlay}
            contentStyle={styles.contentStyle}
            disableShadow={false}
            displayInsets={dynamicInsets}
            topAdjustment={ANDROID_TOP_ADJUSTMENT}
            childrenWrapperStyle={childrenWrapperStyle}
            allowChildInteraction={allowChildInteraction}
        >
            {children}
        </Tooltip>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        tooltipContent: {
            padding: 4,
            maxWidth: 260,
        },
        title: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.text,
            marginBottom: 8,
        },
        description: {
            fontSize: 14,
            color: theme.textSecondary || theme.text,
            marginBottom: 16,
            lineHeight: 20,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
        },
        skipButton: {
            paddingVertical: 8,
            paddingHorizontal: 12,
        },
        skipText: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        nextButton: {
            backgroundColor: theme.primary,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
        },
        nextText: {
            fontSize: 14,
            color: theme.textInverse,
            fontWeight: '600',
        },
        contentStyle: {
            borderRadius: 16,
            padding: 12,
        },
    });
