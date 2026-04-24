/**
 * Maps API policy type to Vietnamese column label
 */
export const POLICY_TYPE_LABELS: Record<string, string> = {
    read: 'Xem',
    create: 'Thêm',
    update: 'Sửa',
    delete: 'Xóa',
    approval: 'Duyệt',
    export: 'Xuất',
    invoke: 'Thực thi',
    close: 'Đóng',
    download: 'Tải xuống',
};

/** Display order for policy type columns */
export const POLICY_TYPE_ORDER = ['read', 'create', 'update', 'delete', 'approval', 'export'];

/**
 * Maps API module code (lowercase) to Vietnamese display name.
 * Used as fallback when API moduleName is in English.
 */
export const MODULE_NAME_MAP: Record<string, string> = {
    // Quản lý trại nuôi
    pond: 'Ao nuôi',
    pondoperation: 'Vận hành ao',
    pond_operation: 'Vận hành ao',
    pondcategory: 'Loại ao',
    pond_category: 'Loại ao',
    pondtransfer: 'Sang ao',
    pond_transfer: 'Sang ao',
    cycle: 'Chu kỳ nuôi',
    cycles: 'Chu kỳ nuôi',
    feeding: 'Cho ăn',
    feedingoperations: 'Cho ăn',
    siphon: 'Xi phông',
    siphonoperations: 'Xi phông',
    waterchange: 'Thay/Cấp nước',
    water_change: 'Thay/Cấp nước',
    waterchangeoperations: 'Thay/Cấp nước',
    watertreatment: 'Xử lý nước',
    water_treatment: 'Xử lý nước',
    watertreatmentoperations: 'Xử lý nước',
    cleaning: 'Rửa ao',
    cleanrenovation: 'Rửa ao',
    cleaningoperations: 'Rửa ao',
    shrimpcheck: 'Kiểm tra tôm',
    shrimp_check: 'Kiểm tra tôm',
    shrimpcheckoperations: 'Kiểm tra tôm',
    sizemeasurement: 'Đo kích thước tôm',
    size_measurement: 'Đo kích thước tôm',
    sizemeasurementoperations: 'Đo kích thước tôm',
    envmeasurement: 'Đo thông số môi trường',
    env_measurement: 'Đo thông số môi trường',
    envmeasurementoperations: 'Đo thông số môi trường',
    incident: 'Xử lý sự cố',
    incidentoperations: 'Xử lý sự cố',
    harvesting: 'Thu hoạch',
    harvestingoperations: 'Thu hoạch',
    dryrenovation: 'Cải tạo khô',
    dry_renovation: 'Cải tạo khô',
    dryrenovationoperations: 'Cải tạo khô',
    pondtransferoperations: 'Sang ao',
    stocktransfer: 'Sang ao',
    metric: 'Thông số',
    seasons: 'Vụ nuôi',
    record: 'Nhật ký',
    recordoperations: 'Nhật ký',
    surveys: 'Khảo sát',
    scalerecord: 'Cân tôm',
    scalerecordoperations: 'Cân tôm',

    // Quản lý vật tư
    warehouse: 'Kho',
    warehouseitem: 'Tồn kho',
    warehouse_item: 'Tồn kho',
    importreceipt: 'Nhập kho',
    import_receipt: 'Nhập kho',
    exportreceipt: 'Xuất kho',
    export_receipt: 'Xuất kho',
    inventorycheck: 'Kiểm kê kho',
    inventory_check: 'Kiểm kê kho',
    material: 'Vật tư',
    materialtype: 'Loại vật tư',
    materialgroup: 'Nhóm vật tư',
    supplier: 'Nhà cung cấp',
    suppliers: 'Nhà cung cấp',

    // Quản lý thiết bị
    device: 'Thiết bị',
    devicehub: 'Hub thiết bị',
    sensordevice: 'Cảm biến',
    cameradevice: 'Camera',
    warningdevice: 'Thiết bị cảnh báo',
    warningdevicehub: 'Hub cảnh báo',
    scale: 'Cân',

    // Cài đặt & quản lý
    zone: 'Khu vực/Trại',
    zonesetting: 'Cài đặt khu vực',
    zone_setting: 'Cài đặt khu vực',
    roles: 'Vai trò',
    rolepolicy: 'Phân quyền',
    user: 'Người dùng',
    usersmanage: 'Quản lý thành viên',
    users_manage: 'Quản lý thành viên',

    // Báo cáo
    reports: 'Báo cáo',
    exportdatatracking: 'Xuất dữ liệu',

    // Khác
    notification: 'Thông báo',
    aiinference: 'AI',
    unit: 'Đơn vị',
    units: 'Đơn vị',
    operationtype: 'Loại thao tác',
};

/**
 * Maps API module code (lowercase) to a Vietnamese group name.
 * Modules not listed will be placed in "Khác".
 */
export const MODULE_GROUP_MAP: Record<string, string> = {
    // Quản lý trại nuôi
    pond: 'Quản lý trại nuôi',
    pondoperation: 'Quản lý trại nuôi',
    pond_operation: 'Quản lý trại nuôi',
    pondcategory: 'Quản lý trại nuôi',
    pond_category: 'Quản lý trại nuôi',
    pondtransfer: 'Quản lý trại nuôi',
    pond_transfer: 'Quản lý trại nuôi',
    cycle: 'Quản lý trại nuôi',
    cycles: 'Quản lý trại nuôi',
    feeding: 'Quản lý trại nuôi',
    feedingoperations: 'Quản lý trại nuôi',
    siphon: 'Quản lý trại nuôi',
    siphonoperations: 'Quản lý trại nuôi',
    waterchange: 'Quản lý trại nuôi',
    water_change: 'Quản lý trại nuôi',
    waterchangeoperations: 'Quản lý trại nuôi',
    watertreatment: 'Quản lý trại nuôi',
    water_treatment: 'Quản lý trại nuôi',
    watertreatmentoperations: 'Quản lý trại nuôi',
    cleaning: 'Quản lý trại nuôi',
    cleanrenovation: 'Quản lý trại nuôi',
    cleaningoperations: 'Quản lý trại nuôi',
    shrimpcheck: 'Quản lý trại nuôi',
    shrimp_check: 'Quản lý trại nuôi',
    shrimpcheckoperations: 'Quản lý trại nuôi',
    sizemeasurement: 'Quản lý trại nuôi',
    size_measurement: 'Quản lý trại nuôi',
    sizemeasurementoperations: 'Quản lý trại nuôi',
    envmeasurement: 'Quản lý trại nuôi',
    env_measurement: 'Quản lý trại nuôi',
    envmeasurementoperations: 'Quản lý trại nuôi',
    incident: 'Quản lý trại nuôi',
    incidentoperations: 'Quản lý trại nuôi',
    harvesting: 'Quản lý trại nuôi',
    harvestingoperations: 'Quản lý trại nuôi',
    dryrenovation: 'Quản lý trại nuôi',
    dry_renovation: 'Quản lý trại nuôi',
    dryrenovationoperations: 'Quản lý trại nuôi',
    pondtransferoperations: 'Quản lý trại nuôi',
    stocktransfer: 'Quản lý trại nuôi',
    metric: 'Quản lý trại nuôi',
    seasons: 'Quản lý trại nuôi',
    record: 'Quản lý trại nuôi',
    recordoperations: 'Quản lý trại nuôi',
    surveys: 'Quản lý trại nuôi',
    scalerecord: 'Quản lý trại nuôi',
    scalerecordoperations: 'Quản lý trại nuôi',

    // Quản lý vật tư
    warehouse: 'Quản lý vật tư',
    warehouseitem: 'Quản lý vật tư',
    warehouse_item: 'Quản lý vật tư',
    importreceipt: 'Quản lý vật tư',
    import_receipt: 'Quản lý vật tư',
    exportreceipt: 'Quản lý vật tư',
    export_receipt: 'Quản lý vật tư',
    inventorycheck: 'Quản lý vật tư',
    inventory_check: 'Quản lý vật tư',
    material: 'Quản lý vật tư',
    materialtype: 'Quản lý vật tư',
    materialgroup: 'Quản lý vật tư',
    supplier: 'Quản lý vật tư',
    suppliers: 'Quản lý vật tư',

    // Quản lý thiết bị
    device: 'Quản lý thiết bị',
    devicehub: 'Quản lý thiết bị',
    sensordevice: 'Quản lý thiết bị',
    cameradevice: 'Quản lý thiết bị',
    warningdevice: 'Quản lý thiết bị',
    warningdevicehub: 'Quản lý thiết bị',
    scale: 'Quản lý thiết bị',

    // Báo cáo thống kê
    reports: 'Báo cáo thống kê',
    exportdatatracking: 'Báo cáo thống kê',

    // Cài đặt & quản lý người dùng
    zone: 'Cài đặt và quản lý',
    zonesetting: 'Cài đặt và quản lý',
    zone_setting: 'Cài đặt và quản lý',
    roles: 'Cài đặt và quản lý',
    rolepolicy: 'Cài đặt và quản lý',
    user: 'Cài đặt và quản lý',
    usersmanage: 'Cài đặt và quản lý',
    users_manage: 'Cài đặt và quản lý',
    operationtype: 'Cài đặt và quản lý',
};

/** Display order for groups */
export const GROUP_ORDER = [
    'Quản lý trại nuôi',
    'Quản lý vật tư',
    'Quản lý thiết bị',
    'Báo cáo thống kê',
    'Cài đặt và quản lý',
    'Khác',
];
