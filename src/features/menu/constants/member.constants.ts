export const PERMISSION_COLUMNS = [
    { key: 'view', label: 'Xem' },
    { key: 'add', label: 'Thêm' },
    { key: 'edit', label: 'Sửa' },
    { key: 'delete', label: 'Xóa' },
    { key: 'approve', label: 'Duyệt' },
    { key: 'export', label: 'Xuất' },
];

export const PERMISSION_GROUPS = [
    {
        id: 'quan_ly_trai_nuoi',
        name: 'Quản lý trại nuôi',
        items: [
            { id: 'chu_ky_nuoi', name: 'Chu kỳ nuôi' },
            { id: 'do_thong_so_mt', name: 'Đo thông số môi trường' },
            { id: 'xi_phong', name: 'Xi phông' },
            { id: 'xu_ly_nuoc', name: 'Xử lý nước' },
            { id: 'thay_cap_nuoc', name: 'Thay/Cấp nước' },
            { id: 'rua_ao', name: 'Rửa ao' },
            { id: 'kiem_tra_tom', name: 'Kiểm tra tôm (canh nhá)' },
            { id: 'cho_an', name: 'Cho ăn' },
            { id: 'do_kt_tom', name: 'Đo kích thước tôm' },
            { id: 'xu_ly_su_co', name: 'Xử lý sự cố' },
        ],
    },
    {
        id: 'quan_ly_vat_tu',
        name: 'Quản lý vật tư',
        items: [
            { id: 'nhap_kho', name: 'Nhập kho' },
            { id: 'xuat_kho', name: 'Xuất kho' },
            { id: 'kiem_ke_kho_vt', name: 'Kiểm kê kho' },
            { id: 'ton_kho', name: 'Tồn kho' },
            { id: 'vat_tu', name: 'Vật tư' },
        ],
    },
    {
        id: 'quan_ly_thiet_bi',
        name: 'Quản lý thiết bị',
        items: [
            { id: 'thiet_bi', name: 'Thiết bị' },
            { id: 'dieu_khien_tb', name: 'Điều khiển thiết bị' },
            { id: 'kiem_ke_kho_tb', name: 'Kiểm kê kho' },
            { id: 'camera', name: 'Camera in app' },
            { id: 'chuong', name: 'Chuông' },
        ],
    },
    {
        id: 'bao_cao_thong_ke',
        name: 'Báo cáo thống kê',
        items: [{ id: 'danh_sach_bieu_do', name: 'Danh sách biểu đồ' }],
    },
    {
        id: 'cai_dat_quan_ly',
        name: 'Cài đặt và quản lý người dùng',
        items: [
            { id: 'quan_ly_thanh_vien', name: 'Quản lý thành viên' },
            { id: 'quan_ly_vu_nuoi', name: 'Quản lý vụ nuôi' },
            { id: 'bao_tri_tb', name: 'Bảo trì thiết bị' },
            { id: 'thiet_lap_ts_mt', name: 'Thiết lập thông số môi trường' },
        ],
    },
];
