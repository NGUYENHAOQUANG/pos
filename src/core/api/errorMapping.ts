export const getMessageFromStatus = (
    status: number,
    defaultMessage: string = 'Đã có lỗi xảy ra.'
): string => {
    switch (status) {
        case 401:
            return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        case 403:
            return 'Bạn không có quyền thực hiện thao tác này.';
        case 404:
            return 'Không tìm thấy dữ liệu yêu cầu.';
        case 408:
            return 'Quá thời gian chờ phản hồi từ máy chủ.';
        case 429:
            return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.';
        case 500:
        case 502:
        case 503:
            return 'Lỗi hệ thống máy chủ. Vui lòng thử lại sau.';
        default:
            return defaultMessage;
    }
};
