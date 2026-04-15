import { POND_TYPES } from '@/features/farm/types/farm.types';
import type { PondData } from '@/features/farm/types/pond.types';
import type { PondCategory } from '@/features/farm/types/pond-category.types';
import type { CycleData } from '@/features/farm/types/cycle.types';
import type { CreateStockTransferRequest } from '@/features/farm/types/stockTransfer.types';
import type { ReceivingPondItem } from '@/features/farm/components/pondwork/transfer/TransferInfoBox';
import type { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

export const stockTransferService = {
    /**
     * Filter ao nhận: chỉ lấy Ao nuôi và Ao sẵn sàng, loại trừ ao hiện tại
     */
    getReceivingPondOptions: (
        allPonds: PondData[],
        currentPondId: string,
        categories?: PondCategory[]
    ): DropDownItem[] => {
        if (allPonds.length === 0) return [];

        const categoryMap = new Map<string, string>();
        categories?.forEach(c => {
            categoryMap.set(c.id, c.name);
        });

        const getPondTypeName = (p: PondData): string | undefined => {
            return p.type?.name ?? categoryMap.get(p.pondCategoryId ?? '');
        };

        const allowedTypes: string[] = [POND_TYPES.CULTIVATION, POND_TYPES.READY];

        return allPonds
            .filter(p => {
                if (p.id === currentPondId) return false;

                // Exclude ponds that already have an active cycle
                if (p.cyclePond != null) return false;

                if (typeof p.canStockTransfer === 'boolean') {
                    return p.canStockTransfer;
                }

                const typeName = getPondTypeName(p);
                return typeName ? allowedTypes.includes(typeName) : false;
            })
            .map(p => ({
                id: p.id,
                value: p.id,
                label: p.name,
            }));
    },

    /**
     * Tìm active cycle ID từ danh sách cycles
     */
    findActiveCycleId: (cycles: CycleData[] | undefined): string | undefined => {
        if (!cycles || cycles.length === 0) return undefined;
        const activeCycle =
            cycles.find(c => c.status === 'InProgress' || c.status === 'Active') || cycles[0];
        return activeCycle?.id;
    },

    /**
     * Map form data sang API request
     */
    buildCreateRequest: (
        receivingPonds: ReceivingPondItem[],
        totalStocking: number,
        shrimpSize: string,
        notes?: string
    ): CreateStockTransferRequest => {
        const toPonds = receivingPonds
            .filter(p => p.quantity.trim() !== '')
            .map(p => ({
                toPondId: p.receivingPond || '',
                quantity: parseInt(p.quantity, 10) || 0,
            }));

        return {
            toPonds,
            totalStocking,
            shrimpSizePcsPerKg: Number(shrimpSize) || 0,
            notes: notes || undefined,
        };
    },

    /**
     * Lấy cỡ tôm mới nhất từ size measurement detail
     */
    getLatestShrimpSizeFromMeasurement: (measurementDetail: any): string | undefined => {
        return measurementDetail?.shrimpSizePcsPerKg?.toString();
    },
};
