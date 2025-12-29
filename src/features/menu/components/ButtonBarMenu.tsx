import React from 'react';
import { ViewStyle, StyleProp, TextStyle } from 'react-native';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { colors } from '@/styles';

interface ButtonBarMenuProps {
    primaryTitle?: string;
    secondaryTitle?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
    primaryDisabled?: boolean;
    // secondaryType: 'default' (gray border) | 'primary' (blue border)
    secondaryType?: 'default' | 'primary';
    style?: StyleProp<ViewStyle>;
}

export const ButtonBarMenu: React.FC<ButtonBarMenuProps> = ({
    primaryTitle,
    secondaryTitle,
    onPrimaryPress,
    onSecondaryPress,
    primaryDisabled = false,
    secondaryType = 'default',
    style,
}) => {
    const hasSecondary = !!secondaryTitle;
    const mode = hasSecondary ? 'double' : 'single';

    // Map secondaryType to styles
    const secondaryButtonStyle: ViewStyle = {};
    const secondaryButtonTextStyle: TextStyle = {};

    if (secondaryType === 'primary') {
        secondaryButtonStyle.borderColor = colors.primary;
        secondaryButtonTextStyle.color = colors.primary;
    } else {
        // default styling is already handled in shared ButtonBar (gray border, black text)
        secondaryButtonStyle.borderColor = colors.defaultBorder || colors.border;
        secondaryButtonTextStyle.color = colors.text;
    }

    return (
        <ButtonBar
            mode={mode}
            primaryTitle={primaryTitle}
            secondaryTitle={secondaryTitle}
            onPrimaryPress={onPrimaryPress}
            onSecondaryPress={onSecondaryPress}
            primaryButtonDisabled={primaryDisabled}
            secondaryButtonStyle={secondaryButtonStyle}
            secondaryButtonTextStyle={secondaryButtonTextStyle}
            containerStyle={style as ViewStyle}
        />
    );
};
