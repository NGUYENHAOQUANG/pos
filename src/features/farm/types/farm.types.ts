export type PondType =
    | 'Ao nuôi'
    | 'Ao vèo'
    | 'Ao sẵn sàng'
    | 'Ao lắng'
    | 'Ao thải'
    | 'Ao xử lý'
    | 'Ao chứa nước';

export interface PondData {
    id: string;
    name: string;
    area: string;
    type: PondType;
    lastUpdate?: string;
    lastActivity?: string;
    size?: string; // Kích thước (m) - ví dụ: "50×28"
    zone?: string; // Khu vực - ví dụ: "KV-A"
    status?: string; // Trạng thái - ví dụ: "Đang hoạt động", "Chuẩn bị"
    farmCode?: string; // Mã trại - ví dụ: "KG-01"
    shape?: string; // Hình dáng ao - ví dụ: "Hình chữ nhật", "Vuông", "Bất định"
    depth?: string | number; // Độ sâu (m) - ví dụ: "1.5" hoặc 1.5
}

export interface CycleData {
    id: string; // Mã chu kỳ - ví dụ: "VH2025-A-VEO1"
    breedSource: string; // Chọn tôm giống - ví dụ: "A" (SIS PL12)
    season: string; // Chọn vụ nuôi - ví dụ: "VH2025-A"
    cycleName: string;
    stockingDate: string; // Ngày bắt đầu - ví dụ: "12/1/2025"
    endDate?: string; // Ngày kết thúc - ví dụ: "12/22/2025"
    stockingQuantity: number; // Tổng số lượng thả (PLs) - ví dụ: 870000
    age: number; // Ngày tuổi (PLS) - ví dụ: 12
    density: number; // Mật độ (con/m²) - ví dụ: 1109.693878
    estimatedCost: number; // Chi phí giống (VNĐ) - ví dụ: 130500000
    notes?: string; // Ghi chú
    pondId?: string; // Ao chính (deprecated, dùng sourcePonds/receivingPonds)
    sourcePonds?: string[]; // Ao nguồn - ví dụ: ["V01", "V02"]
    receivingPonds?: string[]; // Ao nhận - ví dụ: ["N01", "N02"]
    status?: 'Hoàn thành' | 'Chưa hoàn thành'; // Trạng thái
    doc?: number; // DOC (ngày) - ví dụ: 21
    // Thông tin sang ao (chỉ có khi chu kỳ này được tạo từ việc sang ao)
    transferInfo?: TransferInfo;
}

// Thông tin sang ao - lưu dữ liệu từ ao vèo khi chuyển sang ao nuôi
export interface TransferInfo {
    transferDate: string; // Ngày sang ao
    shrimpSize: string; // Cỡ tôm (con/kg)
    totalEstimatedShrimp: number; // Tổng số tôm dự kiến (con)
    sourcePondId: string; // Ao nguồn (ao vèo)
    sourcePondName: string; // Tên ao nguồn
    quantity: number; // Số lượng tôm nhận được
    // Thông tin chu kỳ gốc từ ao vèo
    originalCycle: {
        cycleName: string;
        season: string;
        breedSource: string;
        stockingDate: string;
        stockingQuantity: number;
        doc: number; // Số ngày nuôi (DOC) tại ao vèo
    };
}

export interface FarmData {
    id: string;
    name: string;
    code: string;
    area?: string;
    address?: string;
}

export interface SeasonData {
    id: string; // Mã vụ nuôi - ví dụ: "VH2025-A"
    name: string; // Tên vụ nuôi - ví dụ: "Vụ Hè 2025 – Khu A"
    farmCode: string; // Mã trại - ví dụ: "KG-01"
    startDate: string; // Ngày khởi tạo - ví dụ: "1/12/2025"
    endDate: string; // Ngày kết thúc - ví dụ: "04/30/2025"
    status: 'Đang hoạt động' | 'Đã kết thúc'; // Trạng thái
}

export interface DropdownItem {
    label: string;
    value: string;
}

export interface BreedOption extends DropdownItem {
    materialCode?: string;
    price?: number;
    supplier?: string;
}

export interface ShrimpInspectionMeta {
    foodAmount?: string;
    leftoverFood?: string;
    intestine?: string;
    intestineColor?: string;
    stoolColor?: string;
    liver?: string;
    images?: string[];
}

export interface EnvironmentMeta {
    pH?: string;
    pHWarning?: boolean;
    do?: string;
    doWarning?: boolean;
    temperature?: string;
    temperatureWarning?: boolean;
    salinity?: string;
    salinityWarning?: boolean;
    alkalinity?: string;
    alkalinityWarning?: boolean;
    transparency?: string;
    transparencyWarning?: boolean;
    kali?: string;
    tan?: string;
    magie?: string;
    no3?: string;
}

export interface SiphonMeta {
    lossAmount?: string;
    images?: string[];
}

export interface TransferMeta {
    shrimpSize?: string;
    transferMethod?: string;
    receivingPonds?: Array<{
        id: string;
        receivingPond?: string;
        quantity: string;
    }>;
}

export interface HarvestMeta {
    harvestType?: string;
    yieldAmount?: string;
    shrimpSize?: string;
    referencePrice?: string;
    revenue?: number;
}

export interface WaterSupplyMeta {
    targetLevel?: string | number;
    supplyLevel?: string | number;
    drainLevel?: string | number;
    volumeAfterDrain?: string | number;
    volumeSupply?: string | number;
    volumeAfterSupply?: string | number;
}

export interface MeasureSizeMeta {
    date?: string;
    shrimpSize?: string;
    remainingWeight?: string;
    totalShrimpCount?: number | null;
    survivalRate?: number | null;
    notes?: string;
    images?: string[];
}

export type JobMeta =
    | ShrimpInspectionMeta
    | EnvironmentMeta
    | SiphonMeta
    | TransferMeta
    | HarvestMeta
    | WaterSupplyMeta
    | MeasureSizeMeta;

export interface JobExecution {
    id: string;
    label: string;
    time: string;
    date?: string;
    note?: string;
    pondId?: string;
    materials?: {
        material: any;
        quantity: number;
        unit: string;
    }[];
    images?: string[];
    waterTreatmentType?: string;
    meta?: JobMeta;
}

export interface ShrimpInspectionData {
    id: string;
    pondId: string;
    pondName?: string;
    date?: string;
    time?: string;
    notes?: string;
}
