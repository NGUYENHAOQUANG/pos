import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useShrimpPrice } from '@/features/menu/hooks/useShrimpPrice';
import { useNews } from '@/features/menu/hooks/useNews';
import { ShrimpPrice } from '@/features/menu/types/shrimpPrice.types';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { HeadingBar } from '@/shared/components/layout/HeadingBar';
import { Loading } from '@/shared/components/ui/Loading';
import { Button } from '@/shared/components/buttons/Button';
import { WebView } from 'react-native-webview';
import { generateHistoricalData } from '@/features/menu/utils/shrimpPriceUtils';
import { PriceChart } from '@/features/menu/components/shrimp-price/PriceChart';
import { SpeciesCardList } from '@/features/menu/components/shrimp-price/SpeciesCardList';
import { SizePriceSection } from '@/features/menu/components/shrimp-price/SizePriceSection';
import { NewsSection } from '@/features/menu/components/shrimp-price/NewsSection';
import { AllShrimpList } from '@/features/menu/components/shrimp-price/AllShrimpList';
import { ShrimpMarquee } from '@/features/menu/components/shrimp-price/ShrimpMarquee';

const TABS = ['Giá tôm thị trường', 'Tin tức nổi bật', 'Thức ăn và thuốc'];
const HEADING_TABS = TABS.map(tab => ({ key: tab, label: tab }));

export const ShrimpPriceScreen: React.FC = () => {
    const theme = useAppTheme();
    const { data: shrimpPrices, isLoading, error, refetch, isRefetching } = useShrimpPrice();
    const {
        data: newsData = [],
        isLoading: newsLoading,
        error: newsError,
    } = useNews('Tin tức nổi bật');

    // Group items by "Tôm thẻ", "Tôm sú", "Khác"
    const groupedShrimps = useMemo(() => {
        if (!shrimpPrices) return {};
        const groups: Record<string, ShrimpPrice[]> = {
            'Tôm thẻ chân trắng': [],
            'Tôm sú': [],
        };
        const others: ShrimpPrice[] = [];

        shrimpPrices.forEach(item => {
            const lowerName = item.name.toLowerCase();
            if (lowerName.includes('sú')) groups['Tôm sú'].push(item);
            else if (lowerName.includes('thẻ')) groups['Tôm thẻ chân trắng'].push(item);
            else others.push(item);
        });

        if (others.length > 0) {
            groups['Tôm khác'] = others;
        }

        return groups;
    }, [shrimpPrices]);

    const speciesNames = useMemo(
        () => Object.keys(groupedShrimps).filter(k => groupedShrimps[k].length > 0),
        [groupedShrimps]
    );

    const [activeTab, setActiveTab] = useState('Giá tôm thị trường');
    const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

    // Derived State: Compute active selections during render without useEffect syncs
    const activeSpecies =
        selectedSpecies && speciesNames.includes(selectedSpecies)
            ? selectedSpecies
            : speciesNames[0] || 'Tôm thẻ chân trắng';

    const activeSpeciesList = useMemo(
        () => groupedShrimps[activeSpecies] || [],
        [groupedShrimps, activeSpecies]
    );

    const activeSizeId =
        selectedSizeId && activeSpeciesList.some(s => s.id === selectedSizeId)
            ? selectedSizeId
            : activeSpeciesList[0]?.id || null;

    const selectedSizeShrimp = useMemo(() => {
        return activeSpeciesList.find(s => s.id === activeSizeId) || null;
    }, [activeSpeciesList, activeSizeId]);

    const chartData = useMemo(() => {
        if (!selectedSizeShrimp) return [];
        return generateHistoricalData(selectedSizeShrimp.price);
    }, [selectedSizeShrimp]);

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
            <HeaderSection title="Tin tức và Giá cả" />

            {/* TABS */}
            <View style={[styles.tabsContainer, { backgroundColor: theme.backgroundPrimary }]}>
                <HeadingBar
                    tabs={HEADING_TABS}
                    selectedTab={activeTab}
                    onTabSelect={setActiveTab}
                />
            </View>

            <ShrimpMarquee data={shrimpPrices ?? []} theme={theme} />

            {activeTab === 'Thức ăn và thuốc' ? (
                <View style={styles.webviewContainer}>
                    <WebView
                        source={{ uri: 'https://mebieco.vn/#thuc-an-va-thuoc' }}
                        style={[styles.webview, { backgroundColor: theme.backgroundPrimary }]}
                        showsVerticalScrollIndicator={false}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View
                                style={[
                                    styles.webviewLoading,
                                    { backgroundColor: theme.backgroundPrimary },
                                ]}
                            >
                                <Loading size="large" />
                            </View>
                        )}
                    />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {isLoading && !isRefetching ? (
                        <View style={styles.centerContainer}>
                            <Loading size="large" />
                            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                                Đang cập nhật thị trường...
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centerContainer}>
                            <Ionicons
                                name="cloud-offline-outline"
                                size={48}
                                color={theme.textSecondary}
                            />
                            <Text style={[styles.errorText, { color: theme.red[500] }]}>
                                Không thể lấy dữ liệu ngay lúc này.
                            </Text>
                            <Button title="Thử lại ngay" onPress={refetch} />
                        </View>
                    ) : (
                        <>
                            {activeTab === 'Giá tôm thị trường' && (
                                <View>
                                    {/* Species Cards */}
                                    <SpeciesCardList
                                        speciesNames={speciesNames}
                                        groupedShrimps={groupedShrimps}
                                        activeSpecies={activeSpecies}
                                        onSelectSpecies={setSelectedSpecies}
                                        theme={theme}
                                    />

                                    {/* Size Price Pills */}
                                    <SizePriceSection
                                        activeSpecies={activeSpecies}
                                        speciesList={activeSpeciesList}
                                        activeSizeId={activeSizeId}
                                        onSelectSize={setSelectedSizeId}
                                        theme={theme}
                                    />

                                    {/* Chart 7 days */}
                                    {selectedSizeShrimp && (
                                        <View
                                            style={[
                                                styles.sectionContainer,
                                                {
                                                    backgroundColor: theme.background,
                                                    borderColor: theme.defaultBorder,
                                                },
                                            ]}
                                        >
                                            <View style={styles.sectionHeader}>
                                                <Text
                                                    style={[
                                                        styles.sectionTitle,
                                                        { color: theme.text },
                                                    ]}
                                                >
                                                    Biến động 7 ngày qua
                                                </Text>
                                            </View>
                                            <View style={styles.chartWrapper}>
                                                <PriceChart data={chartData} theme={theme} />
                                            </View>
                                        </View>
                                    )}

                                    {/* All shrimp list */}
                                    <AllShrimpList
                                        shrimpPrices={shrimpPrices ?? []}
                                        theme={theme}
                                    />
                                </View>
                            )}

                            {activeTab === 'Tin tức nổi bật' && (
                                <NewsSection
                                    newsData={newsData}
                                    isLoading={newsLoading}
                                    error={newsError}
                                    theme={theme}
                                />
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabsContainer: {
        paddingBottom: 8,
    },
    webviewContainer: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    webviewLoading: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingTop: 16,
    },
    centerContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    sectionContainer: {
        marginBottom: 16,
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 16,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    chartWrapper: {
        alignItems: 'center',
        marginLeft: -12,
        marginTop: 4,
    },
});
