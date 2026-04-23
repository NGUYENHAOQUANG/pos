import { POND_TYPES } from '@/features/farm/types/farm.types';
import type { PondData } from '@/features/farm/types/pond.types';
import type { PondCategory } from '@/features/farm/types/pond-category.types';
import type { CycleData } from '@/features/farm/types/cycle.types';
import type { CreateStockTransferRequest } from '@/features/farm/types/stockTransfer.types';
import type { ReceivingPondItem } from '@/features/farm/components/pondwork/transfer/TransferInfoBox';
import type { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

export const stockTransferService = {
    /**
     * Filter ao nhận dựa trên loại ao nguồn:
     * - Ao nuôi → chỉ Ao nuôi
     * - Ao vèo → Ao vèo + Ao nuôi
     * - Khác → Ao nuôi + Ao sẵn sàng
     */
    getReceivingPondOptions: (
        allPonds: PondData[],
        currentPondId: string,
        categories?: PondCategory[],
        sourcePondTypeName?: string
    ): DropDownItem[] => {
        if (allPonds.length === 0) return [];

        const categoryMap = new Map<string, string>();
        categories?.forEach(c => {
            categoryMap.set(c.id, c.name);
        });

        const getPondTypeName = (p: PondData): string | undefined => {
            return p.type?.name ?? categoryMap.get(p.pondCategoryId ?? '');
        };

        // Determine allowed receiving pond types based on source pond type
        const allowedTypes: string[] =
            sourcePondTypeName === POND_TYPES.CULTIVATION
                ? [POND_TYPES.CULTIVATION]
                : sourcePondTypeName === POND_TYPES.NURSERY
                ? [POND_TYPES.NURSERY, POND_TYPES.CULTIVATION]
                : [POND_TYPES.CULTIVATION, POND_TYPES.READY];

        return allPonds
            .filter(p => {
                if (p.id === currentPondId) return false;

                // Exclude ponds that already have an active cycle
                if (p.cyclePond != null) return false;

                // When source is 'Ao nuôi' or 'Ao vèo', always enforce type filter
                if (
                    sourcePondTypeName === POND_TYPES.CULTIVATION ||
                    sourcePondTypeName === POND_TYPES.NURSERY
                ) {
                    const typeName = getPondTypeName(p);
                    return typeName ? allowedTypes.includes(typeName) : false;
                }

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

    /**
     * Phân loại lỗi từ BE để quyết định cách hiển thị trên UI.
     * - 'modal': Hiện ConfirmationModalUI (ví dụ: cần đo kích thước tôm)
     * - 'warning': Hiện warning box màu vàng trong form (ví dụ: chưa đủ ngày)
     * - 'silent': Không hiển thị gì (FE đã xử lý realtime, ví dụ: số lượng không khớp)
     * - 'toast': Hiện toast đỏ mặc định
     */
    classifyError: (message: string): StockTransferErrorType => {
        const msg = message.toLowerCase();

        for (const rule of STOCK_TRANSFER_ERROR_RULES) {
            if (rule.keywords.some(kw => msg.includes(kw))) {
                return rule.type;
            }
        }

        return 'toast';
    },
};

// ─── Error Classification ───────────────────────────────
export type StockTransferErrorType = 'modal' | 'warning' | 'silent' | 'toast';

interface ErrorRule {
    type: StockTransferErrorType;
    keywords: string[];
}

/**
 * Bảng ánh xạ lỗi BE → loại UI hiển thị.
 * Thứ tự quan trọng: rule đầu tiên khớp sẽ được sử dụng.
 * Khi BE thêm lỗi mới, chỉ cần thêm 1 dòng vào đây.
 */
const STOCK_TRANSFER_ERROR_RULES: ErrorRule[] = [
    // Modal: cần đi đo kích thước tôm
    { type: 'modal', keywords: ['không tìm thấy record', 'đo kích thước', '24 giờ', '24h'] },
    // Warning box: chưa đủ ngày nuôi
    { type: 'warning', keywords: ['15 ngày', 'chưa đủ điều kiện'] },
    // Silent: FE đã hiển thị realtime error
    { type: 'silent', keywords: ['tổng số lượng chuyển không khớp'] },
];
