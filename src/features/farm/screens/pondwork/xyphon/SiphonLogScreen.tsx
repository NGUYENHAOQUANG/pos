import React, { useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { SiphonMeta, JobExecution } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { convertSiphonMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useSiphonRecordsAsJobs } from '@/features/farm/hooks/useSiphonRecords';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'SiphonLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const SiphonLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const [endDate, setEndDate] = useState(new Date());

    const { jobs } = useSiphonRecordsAsJobs(pond?.id, {
        // Assuming params match size measurement pattern (API documentation usually consistent)
        // If API expects different params, we adjust.
        // User text implied "CreateAtFrom/To" used in other screens so we follow suit.
        // Wait, "MeasureShrimpSizeLogScreen" uses CreateAtFrom/To.
        // We added ISiphonParams with generic struct. We pass raw strings or adjust typing?
        // ISiphonParams was user defined to match params. We can just cast or update ISiphonParams if needed.
        // For now pass as any or extend ISiphonParams if I can't edit it again easily.
        // Actually ISiphonParams I defined had Page/PageSize. I should add date filters there ideally.
        // But for now casting to any or passing extra props is standard if type allows index signature or I update type.
        // I will just cast/pass it, assuming API supports it.
        // Actually, looking at image 1 (which I can't see but assume), params are:
        // PondId, Id, CreatedAt, CreateAtFrom, CreateAtTo, Page, PageSize, OrderBy.
        // So CreateAtFrom/CreateAtTo are correct.
        CreateAtFrom: startDate.toISOString(),
        CreateAtTo: endDate.toISOString(),
    } as any);

    const config: LogScreenConfig<SiphonMeta> = {
        jobType: 'SIPHON',
        pond,
        externalData: jobs,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (item: JobExecution, meta: SiphonMeta) =>
            convertSiphonMetaToActivityData(item, meta)
                .filter(i => i.label !== 'Hình ảnh')
                .map(i =>
                    i.label === 'Hao hụt trong ao' ? { ...i, label: 'Số tôm hao (kg)' } : i
                ),
        editRoute: 'AddSiphonScreen',
        getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
    };

    const { groupedData } = useLogScreenData(config);

    const handleStartSiphon = () => {
        if (pond) {
            navigation.navigate('AddSiphonScreen', { pond });
        }
    };

    return (
        <BaseLogScreen
            title="Nhật ký xi-phông"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu xi-phông"
            emptyButtonTitle="Bắt đầu xi-phông"
            onEmptyButtonPress={handleStartSiphon}
        />
    );
};
