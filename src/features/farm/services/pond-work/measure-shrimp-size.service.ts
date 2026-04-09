import { MeasureShrimpSizeFormValues } from '@/features/farm/schemas/measureShrimpSizeSchema';
import {
    ICreateSizeMeasurementReq,
    ISizeMeasurement,
} from '@/features/farm/types/sizeMeasurement.types';

export const measureShrimpSizeService = {
    createDefaultFormValues: (): MeasureShrimpSizeFormValues => ({
        executionDate: new Date(),
        shrimpSizePcsPerKg: '',
        estimatedRemainingStockKg: '',
        averageShrimpSize: '',
        notes: '',
        documentIds: [],
        imageUris: [],
    }),

    mapDetailToForm: (
        detail: ISizeMeasurement,
        imageUris: string[]
    ): MeasureShrimpSizeFormValues => {
        const sizeDetail = detail.sizeMeasurementDetail || detail.sizeMeasurement;

        return {
            executionDate: detail.createdAt ? new Date(detail.createdAt) : new Date(),
            shrimpSizePcsPerKg: sizeDetail?.shrimpSizePcsPerKg?.toString() || '',
            estimatedRemainingStockKg: sizeDetail?.estimatedRemainingStockKg?.toString() || '',
            averageShrimpSize: sizeDetail?.averageShrimpSize?.toString() || '',
            notes: sizeDetail?.notes || '',
            documentIds: detail.documentIds || [],
            imageUris,
        };
    },

    createSnapshot: (data: MeasureShrimpSizeFormValues): string => {
        return JSON.stringify({
            ...data,
            executionDate: data.executionDate.toISOString(),
        });
    },

    hasChanges: (current: MeasureShrimpSizeFormValues, snapshot: string | null): boolean => {
        if (!snapshot) {
            // New record (create context) check if anything is populated yet
            return !!(
                current.shrimpSizePcsPerKg ||
                current.estimatedRemainingStockKg ||
                current.averageShrimpSize ||
                current.notes ||
                current.documentIds.length > 0
            );
        }

        const currentSnapshot = measureShrimpSizeService.createSnapshot(current);
        return currentSnapshot !== snapshot;
    },

    mapFormToPayload: (
        data: MeasureShrimpSizeFormValues,
        uploadedDocumentIds: string[]
    ): ICreateSizeMeasurementReq => {
        const parseFloatSafe = (val: string) => {
            const normalized = val.replace(/,/g, '.');
            return parseFloat(normalized);
        };

        return {
            documentIds: uploadedDocumentIds,
            sizeMeasurementDetail: {
                shrimpSizePcsPerKg: parseFloatSafe(data.shrimpSizePcsPerKg),
                estimatedRemainingStockKg: parseFloatSafe(data.estimatedRemainingStockKg),
                averageShrimpSize: data.averageShrimpSize
                    ? parseFloatSafe(data.averageShrimpSize)
                    : undefined,
                notes: data.notes || undefined,
            },
        };
    },
};
