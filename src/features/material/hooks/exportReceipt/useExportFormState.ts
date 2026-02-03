import { useState, useEffect, useRef } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { ScrollView } from 'react-native';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useExportReceipt } from '@/features/material/hooks/exportReceipt/useExportReceipt';
import { useExportReceiptItems } from '@/features/material/hooks/exportReceipt/useExportReceiptItems';
import { FileUploaderRef } from '@/shared/components/forms/FileUploader';

/**
 * Hook to manage export warehouse form state (header info, files, modals)
 */
export const useExportFormState = () => {
    const route = useRoute<RouteProp<AppStackParamList, 'AddExportWarehouse'>>();
    const params = route.params;
    const exportReceiptId = params?.exportReceiptId;
    const isEditMode = !!exportReceiptId;

    // Get selected zone from farmStore (for initial value only)
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // Data State - for UI (selectedZone is controlled by dropdown)
    const [date, setDate] = useState(new Date());
    const [selectedZone, setSelectedZone] = useState(selectedZoneId || '');
    const [selectedPond, setSelectedPond] = useState('');
    const [note, setNote] = useState('');
    const [creatorName, setCreatorName] = useState<string>('');

    // Files State
    const [files, setFiles] = useState<DocumentPickerResponse[]>([]);

    // Modal States
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Refs
    const fileUploaderRef = useRef<FileUploaderRef>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const isDataLoaded = useRef(false);

    // Sync selectedZone when farmStore changes (initial load or external change)
    useEffect(() => {
        if (selectedZoneId && !selectedZone) {
            setSelectedZone(selectedZoneId);
        }
    }, [selectedZoneId, selectedZone]);

    // API Hooks for loading detail
    const { data: exportReceiptDetail, isLoading: isLoadingDetail } = useExportReceipt(
        exportReceiptId || ''
    );
    const { data: exportReceiptItems } = useExportReceiptItems(
        isEditMode ? exportReceiptId : undefined
    );

    // Initial Load for Edit Mode - Header info
    useEffect(() => {
        if (isEditMode && exportReceiptDetail && !isDataLoaded.current) {
            if (exportReceiptDetail.createdAt) {
                setDate(new Date(exportReceiptDetail.createdAt));
            }
            if (exportReceiptDetail.note) {
                setNote(exportReceiptDetail.note);
            }
            if (exportReceiptDetail.creator) {
                setCreatorName(exportReceiptDetail.creator.fullname || '');
            }
            if (exportReceiptDetail.pondId) {
                setSelectedPond(exportReceiptDetail.pondId);
            }
            isDataLoaded.current = true;
        }
    }, [isEditMode, exportReceiptDetail]);

    return {
        // Route info
        exportReceiptId,
        isEditMode,

        // Form State
        date,
        setDate,
        selectedZone,
        setSelectedZone,
        selectedPond,
        setSelectedPond,
        note,
        setNote,
        creatorName,

        // Files
        files,
        setFiles,
        fileUploaderRef,

        // Modals
        isConfirmModalVisible,
        setIsConfirmModalVisible,
        deleteModalVisible,
        setDeleteModalVisible,

        // Refs
        scrollViewRef,

        // Loading
        isLoadingDetail,

        // Data for materials hook
        exportReceiptItems,
    };
};
