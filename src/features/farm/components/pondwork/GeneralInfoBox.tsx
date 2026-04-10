import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { ActivitySection } from '@/features/farm/components/pondwork/ActivitySection';
import { ImageSection } from '@/features/farm/components/pondwork/ImageSection';

export enum GeneralInfoBoxType {
    DEFAULT = 'default',
    WITH_IMAGE = 'withImage',
    WATER_TREATMENT = 'waterTreatment',
    HARVEST = 'harvest',
}

export interface GeneralInfoBoxProps {
    type?: GeneralInfoBoxType;
    date?: Date;
    onDateChange?: (date: Date) => void;
    imageUris?: string[];
    onImagesChange?: (images: string[]) => void;
    activityLabel?: string;
    activityOptions?: string[];
    selectedActivity?: string;
    onSelectActivity?: (val: string) => void;
    disabledDate?: boolean;
}

export const GeneralInfoBox: React.FC<GeneralInfoBoxProps> = ({
    type = GeneralInfoBoxType.DEFAULT,
    date: externalDate,
    onDateChange,
    imageUris = [],
    onImagesChange,
    activityLabel = 'Chọn loại hoạt động',
    activityOptions,
    selectedActivity,
    onSelectActivity,
    disabledDate = false,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [selectedDate, setSelectedDate] = useState<Date>(externalDate || new Date());

    useEffect(() => {
        if (externalDate) {
            setSelectedDate(prev => {
                if (prev.getTime() !== externalDate.getTime()) {
                    return externalDate;
                }
                return prev;
            });
        }
    }, [externalDate]);

    const handleDateChangeInternal = (newDate: Date) => {
        setSelectedDate(newDate);
        onDateChange?.(newDate);
    };

    return (
        <SelectionInfoBox title="Thông tin chung">
            <DateInputButton
                date={selectedDate}
                onDateChange={handleDateChangeInternal}
                disabled={disabledDate}
            />

            {/* Chọn loại công việc - dùng cho xử lý nước */}
            {type === GeneralInfoBoxType.WATER_TREATMENT && activityOptions && onSelectActivity && (
                <ActivitySection
                    activityLabel={activityLabel}
                    activityOptions={activityOptions}
                    selectedActivity={selectedActivity}
                    onSelectActivity={onSelectActivity}
                    gap={0}
                    itemStyle={styles.radioItem}
                />
            )}

            {/* Chọn loại hoạt động - dùng cho thu hoạch */}
            {type === GeneralInfoBoxType.HARVEST && activityOptions && onSelectActivity && (
                <ActivitySection
                    activityLabel={activityLabel}
                    activityOptions={activityOptions}
                    selectedActivity={selectedActivity}
                    onSelectActivity={onSelectActivity}
                    gap={32}
                    itemStyle={styles.harvestRadioItem}
                />
            )}

            {/* Hình ảnh - chỉ dùng cho type withImage */}
            {type === GeneralInfoBoxType.WITH_IMAGE && (
                <ImageSection
                    imageUris={imageUris}
                    onImagesChange={uris => {
                        onImagesChange?.(uris);
                    }}
                />
            )}
        </SelectionInfoBox>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        inputGroup: {
            gap: spacing.sm,
        },
        labelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            lineHeight: 22,
        },
        required: {
            color: theme.error,
        },
        radioGroup: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: spacing.sm,
            rowGap: spacing.sm,
            marginTop: spacing.xs,
        },
        radioOuter: {
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: theme.borderSubtle,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
        },
        radioOuterSelected: {
            borderColor: theme.primaryOrange,
        },
        radioInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.primaryOrange,
        },
        radioLabelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        radioLabelTxt: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        radioLabelSelected: {
            color: theme.text,
            fontWeight: '500',
        },
        headerContainer: {
            marginTop: 0,
            paddingTop: 0,
        },
        radioItem: {
            minWidth: '45%',
            marginBottom: spacing.xs,
        },
        harvestRadioItem: {
            minWidth: '35%',
            marginBottom: 0,
        },
    });
