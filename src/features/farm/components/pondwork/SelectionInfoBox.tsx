import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

import { colors } from '@/styles';
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
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <View style={[styles.infoBox, style]}>
            <CollapseHead
                title={title}
                titleStyle={titleStyle}
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
                style={styles.collapseHead}
            />
            {isExpanded && <View style={styles.childrenContainer}>{children}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    infoBox: {
        backgroundColor: colors.white,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.border,
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
