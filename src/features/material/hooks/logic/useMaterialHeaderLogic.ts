import { useState, useMemo, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { useZones } from '@/features/farm/hooks';
import { useFarmStore } from '@/features/farm/store/farmStore';

export const useMaterialHeaderLogic = () => {
    // Global State
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);
    const { data: zonesData = [] } = useZones();

    // Dropdown Data
    const dropdownData: DropDownItem[] = useMemo(() => {
        return zonesData.map((z: any) => ({
            id: z.id.toString(),
            label: z.name,
            value: z,
        }));
    }, [zonesData]);

    const selectedDropdownItem = useMemo(() => {
        if (!selectedZoneId) return dropdownData[0];
        return dropdownData.find(d => d.id === selectedZoneId.toString()) || dropdownData[0];
    }, [dropdownData, selectedZoneId]);

    const handleDropdownSelect = useCallback(
        (item: DropDownItem) => {
            setSelectedZoneId(item.id.toString());
        },
        [setSelectedZoneId]
    );

    useEffect(() => {
        if (!selectedZoneId && dropdownData.length > 0) {
            setSelectedZoneId(dropdownData[0].id.toString());
        }
    }, [dropdownData, selectedZoneId, setSelectedZoneId]);

    // Menu State
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

    useFocusEffect(
        useCallback(() => {
            return () => {
                setMenuOpen(false);
            };
        }, [])
    );

    const handleShowMenu = useCallback(
        (position: { x: number; y: number; width: number; height: number }) => {
            setMenuPosition(position);
            setMenuOpen(true);
        },
        []
    );

    const handleCloseMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    return {
        dropdownData,
        selectedDropdownItem,
        handleDropdownSelect,
        menuOpen,
        menuPosition,
        handleShowMenu,
        handleCloseMenu,
    };
};
