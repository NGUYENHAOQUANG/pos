import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArrowLeftIcon from '@/assets/Icon/ArrowLeft.svg';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useNavigation } from '@react-navigation/native';
import PlusIcon from '@/assets/Icon/PlusBlack.svg';

export interface HeaderSectionProps {
    // Config
    includeSafeArea?: boolean;
    containerStyle?: StyleProp<ViewStyle>;

    // Content
    title?: string;
    titleAlign?: 'center' | 'left';
    titleStyle?: StyleProp<TextStyle>;

    // Slots
    // If provided, these override the default renders
    leftComponent?: React.ReactNode;
    centerComponent?: React.ReactNode;
    rightComponent?: React.ReactNode;

    // Back specific (used if leftComponent is not provided)
    onBack?: () => void;
    showBackButton?: boolean;

    // Right Action specific
    rightIcon?: React.ReactNode;
    onRightPress?: () => void;
    rightButtonStyle?: StyleProp<ViewStyle>;
    titleNumberOfLines?: number;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
    includeSafeArea = true,
    containerStyle,
    title,
    titleAlign = 'center',
    titleStyle,
    leftComponent,
    centerComponent,
    rightComponent,
    onBack,
    showBackButton = true,
    rightIcon,
    onRightPress,
    rightButtonStyle,
    titleNumberOfLines = 1,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const renderLeft = () => {
        if (leftComponent) return leftComponent;
        if (showBackButton) {
            return (
                <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
                    {/* Use ArrowLeft SVG icon for back navigation */}
                    <ArrowLeftIcon width={20} height={20} color={theme.text} />
                </TouchableOpacity>
            );
        }
        // Return placeholder to balance layout only if we rely on space-between for centering
        // But since we use flex layout, we might not need invisible placeholder if center is flex: 1
        // However, if we want true centering of title, we often need balanced interactions.
        // Let's return null if not showing back button, but allow center to flex.
        return null;
    };

    const renderCenter = () => {
        if (centerComponent) return centerComponent;
        if (title) {
            return (
                <Text
                    style={[
                        styles.title,
                        titleAlign === 'left' ? styles.titleLeft : styles.titleCenter,
                        titleStyle,
                    ]}
                    numberOfLines={titleNumberOfLines}
                >
                    {title}
                </Text>
            );
        }
        return null;
    };

    const renderRight = () => {
        if (rightComponent) return rightComponent;

        if (onRightPress) {
            return (
                <TouchableOpacity
                    style={[styles.iconButton, rightButtonStyle]}
                    onPress={onRightPress}
                >
                    {rightIcon ? rightIcon : <PlusIcon width={20} height={20} color={theme.text} />}
                </TouchableOpacity>
            );
        }

        // Auto-balance invalid right side if left has a button and title is centered
        // This maintains perfect centering
        if (showBackButton && !leftComponent && title && titleAlign === 'center') {
            return <View style={styles.placeholderButton} />;
        }

        return null;
    };

    return (
        <View
            style={[
                styles.container,
                includeSafeArea && { paddingTop: insets.top + 12 },
                containerStyle,
            ]}
        >
            <View style={styles.leftContainer}>{renderLeft()}</View>

            <View
                style={[
                    styles.centerContainer,
                    titleAlign === 'left' && { alignItems: 'flex-start' },
                ]}
            >
                {renderCenter()}
            </View>

            <View style={styles.rightContainer}>{renderRight()}</View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
            paddingTop: 12,
            paddingHorizontal: 16,
            backgroundColor: theme.backgroundPrimary,
            zIndex: 1000,
            overflow: 'visible',
        },
        leftContainer: {
            minWidth: 40,
            alignItems: 'flex-start',
            justifyContent: 'center',
            // margin right handled by padding/centering
        },
        centerContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 8,
        },
        rightContainer: {
            minWidth: 40,
            alignItems: 'flex-end',
            justifyContent: 'center',
            overflow: 'visible',
            zIndex: 1000,
        },
        iconButton: {
            width: 40,
            height: 40,
            borderRadius: borderRadius.full,
            backgroundColor: theme.backgroundButton,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        placeholderButton: {
            width: 40,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.text,
        },
        titleCenter: {
            textAlign: 'center',
        },
        titleLeft: {
            textAlign: 'left',
            alignSelf: 'flex-start',
        },
    });
