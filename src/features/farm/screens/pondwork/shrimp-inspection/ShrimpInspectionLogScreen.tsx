import { useRoute, RouteProp } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ShrimpInspectionMeta } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { convertShrimpInspectionMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useShrimpHealthCheckData } from '@/features/farm/hooks/useShrimpHealthCheckData';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '@/styles';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'PondworkLogScreen'>;

export const PondworkLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};

    // Fetch shrimp health check data from API using React Query
    const { isLoading } = useShrimpHealthCheckData(pond?.id);

    const config: LogScreenConfig<ShrimpInspectionMeta> = {
        jobType: 'SHRIMP_INSPECTION',
        pond,
        metaConverter: (_item: JobExecution, meta: ShrimpInspectionMeta) =>
            convertShrimpInspectionMetaToActivityData(meta).filter(i => i.label !== 'Hình ảnh:'),
        editRoute: 'ShrimpInspectionScreen',
        getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
    };

    const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

    const handleStartInspection = () => {
        if (pond) {
            navigation.navigate('ShrimpInspectionScreen', { pond });
        }
    };

    // Show loading indicator while fetching initial data
    if (isLoading && groupedData.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <BaseLogScreen
            title="Nhật ký kiểm tra tôm"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu kiểm tra tôm"
            emptyButtonTitle="Bắt đầu kiểm tra tôm"
            onEmptyButtonPress={handleStartInspection}
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundPrimary,
    },
});
