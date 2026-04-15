import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import { ScaleCard, ScaleStatus } from '@/features/farm/components/pondwork/harvest/ScaleCard';
import { AddScaleBottomSheet } from '@/features/farm/components/pondwork/harvest/AddScaleBottomSheet';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import { ScaleActionBottomSheet } from '@/features/farm/components/pondwork/harvest/ScaleActionBottomSheet';
import { EmergencyRevokeSuccessBottomSheet } from '@/features/farm/components/pondwork/harvest/EmergencyRevokeSuccessBottomSheet';

export const ScaleListScreen: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const insets = useSafeAreaInsets();

    const [isAddScaleModalVisible, setIsAddScaleModalVisible] = useState(false);

    // Scale action modal state
    const [selectedScale, setSelectedScale] = useState<{
        id: string;
        title: string;
        status: ScaleStatus;
    } | null>(null);
    const [isActionModalVisible, setIsActionModalVisible] = useState(false);
    const [isEmergencySuccessVisible, setIsEmergencySuccessVisible] = useState(false);

    const handlePressChevron = (scale: { id: string; title: string; status: ScaleStatus }) => {
        setSelectedScale(scale);
        setIsActionModalVisible(true);
    };

    const mockScales = [
        { id: '1', title: 'Cân 01 — Sân A', status: ScaleStatus.EMPTY, weight: 0 },
        { id: '2', title: 'Cân 02 — Sân B', status: ScaleStatus.READY, weight: 18.4 },
        { id: '3', title: 'Cân 03 — Sân C', status: ScaleStatus.WAITING, weight: 18.4 },
        { id: '4', title: 'Cân 04 — Sân D', status: ScaleStatus.DISCONNECTED, weight: null },
    ];

    return (
        <View style={styles.container}>
            <HeaderMeterial title="Tất cả cân" showBackButton />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.listContainer}>
                    {mockScales.map(scale => (
                        <ScaleCard
                            key={scale.id}
                            title={scale.title}
                            status={scale.status}
                            weight={scale.weight}
                            onConfirmPress={() => {}}
                            onPress={() => handlePressChevron(scale)}
                        />
                    ))}
                </View>
            </ScrollView>

            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <Button
                    title="Thêm cân"
                    variant="outline"
                    fullWidth
                    onPress={() => setIsAddScaleModalVisible(true)}
                />
            </View>

            <AddScaleBottomSheet
                visible={isAddScaleModalVisible}
                onClose={() => setIsAddScaleModalVisible(false)}
                onAddScale={_scaleId => {
                    // Logic handle add scale
                    setIsAddScaleModalVisible(false);
                    setTimeout(() => AppToast(TOAST_MESSAGES_CONFIG.SCALE.ADD_SUCCESS), 300);
                }}
            />

            <ScaleActionBottomSheet
                visible={isActionModalVisible}
                onClose={() => setIsActionModalVisible(false)}
                scaleStatus={selectedScale?.status!}
                scaleName={selectedScale?.title}
                onRevokeEmergency={() => {
                    setIsActionModalVisible(false);
                    setTimeout(() => setIsEmergencySuccessVisible(true), 500);
                }}
            />

            <EmergencyRevokeSuccessBottomSheet
                visible={isEmergencySuccessVisible}
                onClose={() => setIsEmergencySuccessVisible(false)}
                scaleName={selectedScale?.title || ''}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            padding: spacing.md,
            paddingBottom: 40,
        },
        listContainer: {
            gap: 6,
        },
        bottomContainer: {
            backgroundColor: theme.background,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
            gap: spacing.md,
        },
    });
