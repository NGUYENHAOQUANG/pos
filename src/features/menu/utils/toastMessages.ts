export const ToastMessages = {
    Member: {
        ADD_SUCCESS: {
            type: 'success',
            text1: 'Đã thêm thành viên thành công',
        },
        NAME_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập tên thành viên',
        },
        CONTACT_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập thông tin liên hệ',
        },
        UNIT_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng chọn ít nhất một đơn vị công tác',
        },
        PERMISSION_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng chọn ít nhất một quyền thao tác',
        },
        UPDATE_SUCCESS: {
            type: 'success',
            text1: 'Đã cập nhật thành viên',
        },
        RESEND_INVITE_SUCCESS: {
            type: 'success',
            text1: 'Đã gửi lại lời mời thành công',
        },
        ACTIVATE_SUCCESS: {
            type: 'success',
            text1: 'Đã kích hoạt thành công',
        },
    },
    Environment: {
        UPDATE_SUCCESS: {
            type: 'success',
            text1: 'Đã lưu thành công',
        },
    },
    Device: {
        MAINTENANCE_ADD_SUCCESS: {
            type: 'success',
            text1: 'Đã thêm thông tin bảo trì',
            position: 'top',
            visibilityTime: 3000,
        },
        MAINTENANCE_DESC_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập mô tả công việc',
            position: 'top',
            visibilityTime: 3000,
        },
        MAINTENANCE_UPDATE_SUCCESS: {
            type: 'success',
            text1: 'Cập nhật thông tin thành công',
            position: 'top',
            visibilityTime: 3000,
        },
        MAINTENANCE_DELETE_SUCCESS: {
            type: 'success',
            text1: 'Đã xoá thông tin bảo trì',
            position: 'top',
            visibilityTime: 3000,
        },
        NOT_FOUND: {
            type: 'error',
            text1: 'Không tìm thấy thiết bị',
        },
        UPDATE_SUCCESS: {
            type: 'success',
            text1: 'Cập nhật thiết bị thành công',
        },
        ADD_SUCCESS: {
            type: 'success',
            text1: 'Thêm thiết bị thành công',
        },
        NAME_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập tên thiết bị',
        },
        TYPE_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng chọn loại thiết bị',
        },
        QUANTITY_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập số lượng',
        },
        IMPORT_DATE_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng chọn ngày nhập kho',
        },
        OPERATING_TIME_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập thời gian hoạt động',
        },
        USAGE_TIME_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập thời gian sử dụng từ ngày lắp',
        },
    },
    Aquaculture: {
        UPDATE_SUCCESS: {
            type: 'success',
            text1: 'Cập nhật vụ nuôi thành công',
            position: 'top',
            visibilityTime: 3000,
        },
        CREATE_SUCCESS: {
            type: 'success',
            text1: 'Đã tạo vụ nuôi thành công',
            position: 'top',
            visibilityTime: 3000,
        },
        FARM_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng chọn trại nuôi',
            position: 'top',
        },
        CYCLE_NAME_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập tên vụ nuôi',
            position: 'top',
        },
        CYCLE_CODE_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng nhập mã vụ nuôi',
            position: 'top',
        },
        START_DATE_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng chọn ngày bắt đầu',
            position: 'top',
        },
    },
    ShrimpMeasurement: {
        WEIGHT_REQUIRED: {
            type: 'error',
            text1: 'Khối lượng tôm phải lớn hơn 0',
        },
        IMAGE_REQUIRED: {
            type: 'error',
            text1: 'Vui lòng chọn hoặc chụp ảnh tôm',
        },
        NO_DATA: {
            type: 'error',
            text1: 'Vui lòng lấy kết quả đo trước khi xem chi tiết',
        },
    },
} as const;
