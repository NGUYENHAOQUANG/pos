import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';

import { Text } from '@/shared/components/typography/Text';
import { colors, typography } from '@/styles';
import { FarmData } from '@/features/farm/types/farm.types';
import { LeafletMap } from '@/shared/components/map/LeafletMap';
import { HeadingBar, HeadingBarItem } from '@/shared/components/layout/HeadingBar';
import { ZoomableImage } from '@/shared/components/image/ZoomableImage';

const Farm3DImage = require('@/assets/images/Farm5KG.png');
const farm3DAsset = Image.resolveAssetSource(Farm3DImage);

const TABS: HeadingBarItem[] = [
    { key: 'map', label: 'Bản đồ' },
    { key: '3d', label: 'Sơ đồ 3D' },
];

interface InfoFieldProps {
    label: string;
    value: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
        </View>
    );
};

interface FarmInfoCardProps {
    farm?: FarmData;
}

export const FarmInfoCard: React.FC<FarmInfoCardProps> = ({ farm }) => {
    const [activeTab, setActiveTab] = React.useState('map');
    const [mapMode, setMapMode] = React.useState<'map' | 'satellite'>('satellite');
    const { width: screenWidth } = useWindowDimensions();

    // Calculate 3D image height based on aspect ratio
    const containerWidth = screenWidth - 32; // minus marginHorizontal * 2
    const imageAspectRatio = farm3DAsset.width / farm3DAsset.height;
    const imageHeight = containerWidth / imageAspectRatio;

    const farmInfo = {
        name: farm?.name || '{ten trai nuoi tom}',
        code: farm?.code || '{mã trại}',
        area:
            typeof farm?.area === 'number'
                ? `${(farm.area as number).toLocaleString('vi-VN')} m²`
                : farm?.area
                ? `${Number(farm.area).toLocaleString('vi-VN')} m²`
                : '',
        address: farm?.address || '',
    };

    return (
        <View style={styles.wrapper}>
            {/* Tab bar */}
            <HeadingBar
                tabs={TABS}
                selectedTab={activeTab}
                onTabSelect={setActiveTab}
                spreadTabs
                containerStyle={styles.headingBar}
            />

            {/* Map / 3D diagram area */}
            <View style={[styles.imageContainer, activeTab === '3d' && { height: imageHeight }]}>
                {activeTab === 'map' ? (
                    <>
                        <LeafletMap
                            latitude={10.385187500580814}
                            longitude={104.53964816229778}
                            zoom={16}
                            mode={mapMode}
                        />
                        <View style={styles.mapControls}>
                            <TouchableOpacity
                                style={[
                                    styles.controlButton,
                                    mapMode === 'map' && styles.controlButtonActive,
                                ]}
                                onPress={() => setMapMode('map')}
                            >
                                <Text
                                    style={[
                                        styles.controlButtonText,
                                        mapMode === 'map' && styles.controlButtonTextActive,
                                    ]}
                                >
                                    Bản đồ
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.controlButton,
                                    mapMode === 'satellite' && styles.controlButtonActive,
                                ]}
                                onPress={() => setMapMode('satellite')}
                            >
                                <Text
                                    style={[
                                        styles.controlButtonText,
                                        mapMode === 'satellite' && styles.controlButtonTextActive,
                                    ]}
                                >
                                    Vệ tinh
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <ZoomableImage source={Farm3DImage} />
                )}
            </View>

            {/* Info Card */}
            <View style={styles.card}>
                <InfoField label="Tên trại:" value={farmInfo.name} />
                <InfoField label="Mã trại:" value={farmInfo.code} />
                <InfoField label="Diện tích:" value={farmInfo.area} />
                <InfoField label="Địa chỉ:" value={farmInfo.address} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    headingBar: {
        marginTop: 12,
    },
    card: {
        backgroundColor: colors.white,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: 16,
    },
    fieldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    fieldLabel: {
        fontSize: 14,
        lineHeight: 22,
        color: colors.textSecondary,
    },
    imageContainer: {
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 12,
        backgroundColor: colors.gray[100],
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    farm3dImage: {
        width: '100%',
        height: '100%',
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: typography.fontWeight.medium,
        lineHeight: 22,
        color: colors.text,
        flex: 1,
        marginLeft: 80,
        textAlign: 'right',
    },
    mapControls: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        backgroundColor: colors.gray[100],
        borderRadius: 100,
        padding: 2,
    },
    controlButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonActive: {
        backgroundColor: colors.white,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    controlButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    controlButtonTextActive: {
        color: colors.black,
        fontWeight: '700',
    },
});
