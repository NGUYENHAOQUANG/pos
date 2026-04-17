import React from 'react';
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
import { useIsFocused } from '@react-navigation/native';

/** Stable no-op reference to prevent unnecessary re-renders */
const NOOP = () => {};

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
    const isFocused = useIsFocused();

    const content = (
        <View style={styles.tooltipContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Bỏ qua</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onNext} style={styles.nextButton}>
                    <Text style={styles.nextText}>{isLastStep ? 'Hoàn thành' : 'Tiếp tục'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Tooltip
            isVisible={isVisible && isFocused}
            content={content}
            placement={placement}
            onClose={NOOP}
            backgroundColor="rgba(0,0,0,0.5)"
            contentStyle={styles.contentStyle}
            disableShadow={false}
            displayInsets={{ top: 24, bottom: 24, left: 24, right: 24 }}
            topAdjustment={Platform.OS === 'android' ? -(StatusBar.currentHeight || 0) : 0}
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
