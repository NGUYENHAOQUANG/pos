import React from 'react';
import { View } from 'react-native';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

interface ZoneHeaderProps {
    dropdownData?: DropDownItem[];
    dropdownValue?: DropDownItem;
    onDropdownSelect?: (item: DropDownItem) => void;
    dropdownPlaceholder?: string;
    rightComponent?: React.ReactNode;
}

export const ZoneHeader: React.FC<ZoneHeaderProps> = ({
    dropdownData,
    dropdownValue,
    onDropdownSelect,
    dropdownPlaceholder,
    rightComponent,
}) => {
    return (
        <HeaderSection
            leftComponent={
                <View style={{ flexDirection: 'row', marginRight: 16, alignItems: 'center' }}>
                    <DropDownButtonBasic
                        data={dropdownData}
                        value={dropdownValue}
                        onSelect={onDropdownSelect}
                        placeholder={dropdownPlaceholder}
                    />
                </View>
            }
            rightComponent={rightComponent}
        />
    );
};
