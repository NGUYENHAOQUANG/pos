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

/** Stable no-op reference to prevent unnecessary re-renders */
const NOOP = () => {};

/** Stable display insets — avoids new object reference every render */
const DISPLAY_INSETS = { top: 24, bottom: 24, left: 24, right: 24 };

/** Pre-calculated Android top adjustment */
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
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // Memoize tooltip content to prevent re-measure on every render
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
            backgroundColor="rgba(0,0,0,0.5)"
            contentStyle={styles.contentStyle}
            disableShadow={false}
            displayInsets={DISPLAY_INSETS}
            topAdjustment={ANDROID_TOP_ADJUSTMENT}
            childrenWrapperStyle={childrenWrapperStyle}
            allowChildInteraction={false}
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
            color: theme.textSecondary || '#666',
        },
        nextButton: {
            backgroundColor: theme.primary,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
        },
        nextText: {
            fontSize: 14,
            color: '#FFFFFF',
            fontWeight: '600',
        },
        contentStyle: {
            borderRadius: 16,
            padding: 12,
        },
    });
