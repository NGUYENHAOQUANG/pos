export enum NotificationScreen {
    ImportReceiptList = 'ImportReceiptList',
    ExportWarehouseList = 'ExportWarehouseList',
    InventoryList = 'InventoryList',
    ExportApprove = 'ExportApprove',
    ImportApprove = 'ImportApprove',
    InventoryApprove = 'InventoryApprove',
}

export enum NotificationType {
    INFO = 'INFO',
    WARNING = 'WARNING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

export enum NotificationActionType {
    Outbound = 'outbound',
    Inbound = 'inbound',
    Counting = 'counting',
    InventoryList = 'InventoryList',
    ExportWarehouseList = 'ExportWarehouseList',
}

export enum NotificationMode {
    Approve = 'approve',
    View = 'view',
}
