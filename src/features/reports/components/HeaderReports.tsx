import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { ButtonHeader } from '@/features/farm/components/ButtonHeader';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface HeaderReportsProps {
    data?: DropDownItem[];
    value?: DropDownItem;
    onSelect?: (item: DropDownItem) => void;
    onRightPress?: () => void;
}

export const HeaderReports = ({ data, value, onSelect, onRightPress }: HeaderReportsProps) => {
    const leftNode = onSelect ? (
        <View style={styles.leftWrapper}>
            <DropDownButtonBasic data={data} value={value} onSelect={onSelect} height={40} />
        </View>
    ) : undefined;

    return (
        <HeaderSection
            leftComponent={leftNode}
            rightComponent={<ButtonHeader onPress={onRightPress} />}
            showBackButton={false}
        />
    );
};

const styles = StyleSheet.create({
    leftWrapper: {
        flexDirection: 'row',
        marginRight: 16,
    },
});
