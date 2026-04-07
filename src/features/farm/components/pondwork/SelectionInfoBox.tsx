import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';

interface SelectionInfoBoxProps {
    title: string | React.ReactNode;
    children: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
}

export const SelectionInfoBox: React.FC<SelectionInfoBoxProps> = ({
    title,
    children,
    style,
    titleStyle,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={[styles.infoBox, style]}>
            <CollapseHead
                title={title}
                titleStyle={titleStyle}
                isExpanded={true}
                // onToggle={() => setIsExpanded(!isExpanded)}
                // showIcon={true}
                // style={[styles.collapseHead, !isExpanded && { borderBottomWidth: 0 }]}
            />
            <View style={styles.childrenContainer}>{children}</View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        infoBox: {
            backgroundColor: theme.background,
            marginHorizontal: 16,
            marginTop: 8,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: 12,
        },
        collapseHead: {
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 4,
        },
        childrenContainer: {
            padding: 16,
            paddingTop: 8,
            gap: 16,
        },
    });
