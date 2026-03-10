import { useState, useMemo, useEffect } from 'react';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useZones, usePondsByZone } from '@/features/farm/hooks';
import { useSeasonsByZone } from '@/features/menu/hooks/useSeasons';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

export const useReportsScreen = () => {
    // Global Farm State
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);

    // React Query Hooks (replacing farmStore fetchers)
    const { data: zonesData = [] } = useZones();
    // Fallback to empty array if undefined
    const zones = useMemo(() => zonesData || [], [zonesData]);

    // Map zones to DropDownItem format
    const farmOptions: DropDownItem[] = useMemo(() => {
        return zones.map(z => ({
            id: z.id.toString(),
            label: z.name,
            value: z.code || z.id.toString(),
        }));
    }, [zones]);

    // Derived selectedFarm from global ID
    const selectedFarm = useMemo(() => {
        const found = farmOptions.find(f => f.id === selectedZoneId?.toString());
        return found || farmOptions[0] || { id: '1', label: 'Trại Kiên Giang' };
    }, [farmOptions, selectedZoneId]);

    const handleSelectFarm = (item: DropDownItem) => {
        setSelectedZoneId(String(item.id));
    };

    const { data: rawPonds } = usePondsByZone(selectedZoneId?.toString() || null);

    const pondData: DropDownItem[] = useMemo(() => {
        const defaultOption = { id: '1', label: 'Chọn ao' };
        if (!rawPonds || rawPonds.length === 0) return [defaultOption];

        const mapped = rawPonds.map(p => ({
            id: p.id.toString(),
            label: p.name,
            value: p.code || p.id.toString(),
        }));
        return [defaultOption, ...mapped];
    }, [rawPonds]);

    const [selectedPond, setSelectedPond] = useState<DropDownItem>(
        pondData[0] || { id: '1', label: 'Chọn ao' }
    );

    // Update selected pond when data changes
    useEffect(() => {
        if (pondData.length > 0) {
            // Check if current selected pond still exists in new data
            const exists = pondData.find(p => p.id === selectedPond.id);
            if (!exists) {
                setSelectedPond(pondData[0]);
            }
        }
    }, [pondData, selectedPond.id]);

    const { data: rawSeasons } = useSeasonsByZone(selectedZoneId?.toString() || null);

    const seasonData: DropDownItem[] = useMemo(() => {
        const defaultOption = { id: '1', label: 'Chọn mùa vụ' };
        if (!rawSeasons || rawSeasons.length === 0) return [defaultOption];

        const mapped = rawSeasons.map(s => ({
            id: s.id.toString(),
            label: s.name || s.seasonName || `Mùa vụ ${s.id}`,
            value: s.seasonCode || s.id.toString(),
        }));
        return [defaultOption, ...mapped];
    }, [rawSeasons]);

    const [selectedSeason, setSelectedSeason] = useState<DropDownItem>(
        seasonData[0] || { id: '1', label: 'Chọn mùa vụ' }
    );

    // Update selected season when data changes
    useEffect(() => {
        if (seasonData.length > 0) {
            // Check if current selected season still exists in new data
            const exists = seasonData.find(s => s.id === selectedSeason.id);
            if (!exists) {
                setSelectedSeason(seasonData[0]);
            }
        }
    }, [seasonData, selectedSeason.id]);

    const [isSeasonDisabled, setIsSeasonDisabled] = useState(false);

    const pondTypeData: DropDownItem[] = [
        { id: '1', label: 'Ao nuôi' },
        { id: '2', label: 'Ao vèo' },
        { id: '3', label: 'Ao lắng' },
        { id: '4', label: 'Ao xử lý' },
    ];
    const [selectedPondType, setSelectedPondType] = useState<DropDownItem>(pondTypeData[0]);

    const handleSelectPondType = (item: DropDownItem) => {
        setSelectedPondType(item);
        if (item.label === 'Ao vèo') {
            const autoSelectPond =
                pondData.find(p => p.label.toLowerCase().includes('vèo')) || pondData[0];
            setSelectedPond(autoSelectPond);
            setIsSeasonDisabled(true);
        } else {
            setIsSeasonDisabled(false);
            if (selectedPond.label.toLowerCase().includes('vèo')) {
                setSelectedPond(pondData[0]); // Reset to "Chọn ao"
            }
        }
    };

    return {
        selectedZoneId,
        farmOptions,
        selectedFarm,
        handleSelectFarm,
        pondData,
        selectedPond,
        setSelectedPond,
        seasonData,
        selectedSeason,
        setSelectedSeason,
        isSeasonDisabled,
        pondTypeData,
        selectedPondType,
        handleSelectPondType,
    };
};
