import React from 'react';
import { View } from 'react-native';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import {
    DropdownHeaderButton,
    DropDownHeaderItem,
} from '@/shared/components/forms/DropdownHeaderButton';

interface ZoneHeaderProps {
    dropdownData?: DropDownHeaderItem[];
    dropdownValue?: DropDownHeaderItem;
    onDropdownSelect?: (item: DropDownHeaderItem) => void;
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <DropdownHeaderButton
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
