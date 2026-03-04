import React, { useCallback, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useCountingShrimp } from '@/features/farm/hooks/useCountingShrimp';
import type { CountingResult } from '@/features/farm/hooks/useCountingShrimp';
import { CountingShrimpForm } from '@/features/farm/screens/ai-counting-shrimp/CountingShrimpForm';

type Props = NativeStackScreenProps<AppStackParamList, 'CountingShrimp'>;

const CountingShrimpScreen: React.FC<Props> = ({ navigation, route }) => {
    const { executeCounting, isPending } = useCountingShrimp();
    const [lastCountingResult, setLastCountingResult] = useState<CountingResult | null>(null);

    const { pondId, zoneId } = route.params ?? {};

    const handleStartCounting = useCallback(
        async (base64Content: string, imageUri: string) => {
            const result = await executeCounting(base64Content, imageUri);
            setLastCountingResult(result);
        },
        [executeCounting]
    );

    const handleSave = useCallback(
        (result: string) => {
            const aiCount = parseInt(result || '0', 10);
            navigation.navigate({
                name: 'CreateCycle',
                params: { pondId: pondId, zoneId: zoneId, aiCount },
                merge: true,
            });
        },
        [navigation, pondId, zoneId]
    );

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleImageChange = useCallback(() => {
        setLastCountingResult(null);
    }, []);

    return (
        <CountingShrimpForm
            isLoading={isPending}
            lastCountingResult={lastCountingResult}
            onRequestStartCounting={handleStartCounting}
            onImageChange={handleImageChange}
            onSave={handleSave}
            onBack={handleBack}
        />
    );
};

export default CountingShrimpScreen;
