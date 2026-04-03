# 🌤️ Tính Năng Dự Báo Thời Tiết — Nghiệp Vụ

## 1. Tổng Quan

Tính năng **Dự Báo Thời Tiết** cung cấp thông tin thời tiết realtime và dự báo cho các vùng nuôi tôm, giúp người dùng **chủ động ứng phó** thay vì bị động trước các điều kiện thời tiết bất lợi.

> **Nguồn dữ liệu:** [Open-Meteo API](https://open-meteo.com/) (miễn phí, không cần API key)
> **Tần suất cập nhật:** Mỗi 15 phút (tự động)
> **Hỗ trợ vùng:** 21 tỉnh/thành Việt Nam (trọng tâm các vùng nuôi tôm)

---

## 2. Đối Tượng Sử Dụng

| Vai trò           | Mục đích sử dụng                                                       |
| ----------------- | ---------------------------------------------------------------------- |
| **Chủ trại**      | Ra quyết định vận hành (cho ăn, xử lý nước, gia cố ao) dựa trên dự báo |
| **Kỹ thuật viên** | Theo dõi thời tiết để điều chỉnh thông số môi trường ao                |
| **Quản lý vùng**  | Giám sát thời tiết tại nhiều trại ở các tỉnh khác nhau                 |

---

## 3. Luồng Nghiệp Vụ

### 3.1 Truy Cập Tính Năng

```
Tài khoản (Menu) → Vận hành trại nuôi → Dự báo thời tiết
```

### 3.2 Flow Chính

```
┌─────────────────────────────────────────────────────┐
│                  MỞ MÀN HÌNH                       │
│                                                     │
│  1. Lấy vùng đã lưu (Zustand store)                │
│  2. Gọi API Open-Meteo với tọa độ vùng             │
│  3. Hiển thị dữ liệu                               │
│     ├── Thời tiết hiện tại (Hero Card)              │
│     ├── Chỉ số chi tiết (nhiệt, ẩm, gió, mưa)     │
│     ├── Cảnh báo nuôi tôm (phân tích tự động)      │
│     ├── Dự báo theo giờ (24h)                       │
│     └── Dự báo 7 ngày                               │
│                                                     │
│  4. Auto-refresh mỗi 15 phút                       │
│  5. Pull-to-refresh thủ công                        │
└─────────────────────────────────────────────────────┘
```

### 3.3 Flow Chọn Vùng

```
Nhấn tên vùng trên header (có mũi tên ▼)
    │
    ▼
┌─────────────────────────────┐
│     Bottom Sheet Modal      │
│  ┌───────────────────────┐  │
│  │ 🔍 Tìm tỉnh/thành    │  │
│  └───────────────────────┘  │
│  ✅ Bạc Liêu               │
│     Cà Mau                  │
│     Sóc Trăng               │
│     Cần Thơ                 │
│     Kiên Giang              │
│     ...                     │
└─────────────────────────────┘
    │
    ▼ Chọn vùng mới
    │
    ▼ Dữ liệu thời tiết cập nhật tự động
```

---

## 4. Dữ Liệu Hiển Thị

### 4.1 Thời Tiết Hiện Tại

| Trường        | Đơn vị | Mô tả                               |
| ------------- | ------ | ----------------------------------- |
| Nhiệt độ      | °C     | Nhiệt độ không khí tại 2m           |
| Cảm giác thực | °C     | Nhiệt độ tính cả gió & độ ẩm        |
| Độ ẩm         | %      | Độ ẩm tương đối                     |
| Tốc độ gió    | km/h   | Gió tại 10m                         |
| Lượng mưa     | mm     | Mưa hiện tại                        |
| Áp suất       | hPa    | Áp suất khí quyển                   |
| Mã thời tiết  | WMO    | Mã chuẩn quốc tế → label tiếng Việt |

### 4.2 Dự Báo Theo Giờ (24h)

| Trường         | Mô tả             |
| -------------- | ----------------- |
| Giờ            | HH:mm             |
| Nhiệt độ       | °C                |
| Icon thời tiết | Đổi theo WMO code |
| Lượng mưa      | mm (hiện khi > 0) |

### 4.3 Dự Báo 7 Ngày

| Trường              | Mô tả                        |
| ------------------- | ---------------------------- |
| Ngày                | Hôm nay / T2 / T3... + dd/mm |
| Nhiệt cao nhất (C)  | °C                           |
| Nhiệt thấp nhất (T) | °C                           |
| Tổng mưa            | mm                           |
| Icon thời tiết      | WMO code                     |

---

## 5. Hệ Thống Cảnh Báo Nuôi Tôm

### 5.1 Ngưỡng Cảnh Báo

Hệ thống **tự động phân tích** dữ liệu thời tiết theo các ngưỡng an toàn cho nuôi tôm:

| Yếu tố         | Ngưỡng an toàn | Cảnh báo vàng ⚠️   | Cảnh báo đỏ 🔴     |
| -------------- | -------------- | ------------------ | ------------------ |
| **Nhiệt độ**   | 25°C – 32°C    | < 25°C hoặc > 32°C | < 22°C hoặc > 34°C |
| **Lượng mưa**  | < 10mm/ngày    | 10 – 30mm/ngày     | > 30mm/ngày        |
| **Tốc độ gió** | < 20 km/h      | 20 – 40 km/h       | > 40 km/h          |
| **Độ ẩm**      | 60% – 90%      | > 90%              | > 95%              |
| **Giông bão**  | WMO code < 80  | code 80 – 94       | code ≥ 95          |

### 5.2 Loại Cảnh Báo & Khuyến Nghị

| Mức              | Màu     | Ý nghĩa            | Ví dụ hành động                        |
| ---------------- | ------- | ------------------ | -------------------------------------- |
| 🔴 **Nguy hiểm** | Đỏ      | Cần hành động ngay | Tắt thiết bị, gia cố ao, tăng quạt sục |
| ⚠️ **Cảnh báo**  | Vàng    | Cần chuẩn bị trước | Rải vôi trước mưa, giảm cho ăn         |
| ℹ️ **Thông tin** | Xanh lá | Lưu ý theo dõi     | Tăng sục khí, bổ sung oxy              |
| ✅ **An toàn**   | Xanh lá | Thuận lợi          | Tiếp tục chế độ bình thường            |

### 5.3 Chi Tiết Từng Cảnh Báo

#### Nhiệt độ cao (> 34°C)

-   **Ảnh hưởng:** Tôm sốc nhiệt, DO giảm mạnh, tôm bỏ ăn
-   **Hành động:**
    -   Tăng quạt nước / sục khí
    -   Bổ sung nước mới vào ao
    -   Giảm mật độ thả (nếu có thể)
    -   Che chắn một phần ao

#### Nhiệt độ thấp (< 22°C)

-   **Ảnh hưởng:** Tôm chậm lớn, giảm ăn, suy giảm miễn dịch
-   **Hành động:**
    -   Giảm lượng thức ăn 30–50%
    -   Bổ sung Vitamin C, khoáng chất
    -   Tránh thay nước trong thời gian lạnh

#### Mưa lớn (> 30mm/ngày)

-   **Ảnh hưởng:** pH giảm đột ngột, độ mặn giảm, nước bị pha loãng
-   **Hành động:**
    -   Rải vôi CaCO₃ trước khi mưa
    -   Kiểm tra pH sau mưa (mục tiêu 7.5–8.5)
    -   Giảm hoặc ngừng cho ăn trong lúc mưa
    -   Bật quạt nước để trộn đều nước

#### Gió mạnh (> 40 km/h)

-   **Ảnh hưởng:** Sóng lớn xói bờ, bạt phủ bị tốc, thiết bị hư hỏng
-   **Hành động:**
    -   Kiểm tra dây neo bạt
    -   Gia cố bờ ao
    -   Tắt quạt nước nếu gió quá lớn

#### Giông bão (WMO code ≥ 95)

-   **Ảnh hưởng:** Nguy hiểm tính mạng, mất điện, thiết bị hư
-   **Hành động:**
    -   **Tắt toàn bộ thiết bị điện**
    -   Gia cố ao nuôi
    -   Chuẩn bị máy phát điện
    -   Không ra ao khi có giông

---

## 6. Danh Sách Vùng Hỗ Trợ

### Miền Nam (trọng tâm nuôi tôm)

| Tỉnh       | Tọa độ            |
| ---------- | ----------------- |
| Bạc Liêu   | 9.29°N, 105.72°E  |
| Cà Mau     | 9.15°N, 105.15°E  |
| Sóc Trăng  | 9.78°N, 105.47°E  |
| Trà Vinh   | 9.93°N, 105.35°E  |
| Cần Thơ    | 10.05°N, 105.75°E |
| Bến Tre    | 10.25°N, 106.38°E |
| Kiên Giang | 10.01°N, 105.08°E |

### Miền Trung & Bắc

| Tỉnh      | Tọa độ            |
| --------- | ----------------- |
| Khánh Hòa | 12.24°N, 109.20°E |
| Phú Yên   | 13.08°N, 109.28°E |
| Đà Nẵng   | 16.05°N, 108.20°E |
| Nghệ An   | 18.68°N, 105.68°E |
| Hải Phòng | 20.84°N, 106.69°E |
| Thái Bình | 20.94°N, 106.31°E |
| Nam Định  | 20.44°N, 106.16°E |

---

## 7. Kết Nối Với Nghiệp Vụ Khác

| Tính năng liên quan        | Cách kết nối                                        |
| -------------------------- | --------------------------------------------------- |
| **Đo thông số môi trường** | So sánh dự báo với đo thực tế (pH, DO, nhiệt độ)    |
| **Quản lý cho ăn**         | Gợi ý giảm ăn khi mưa/lạnh/nóng                     |
| **Xử lý sự cố**            | Tạo record xử lý từ cảnh báo thời tiết              |
| **Thiết bị điều khiển**    | Gợi ý bật/tắt quạt nước, sục khí theo thời tiết     |
| **Quản lý vụ nuôi**        | Đánh giá thời điểm thả giống dựa trên dự báo 7 ngày |

---

## 8. Cấu Trúc Kỹ Thuật

```
src/features/weather/
├── api/
│   └── weatherApi.ts              # API layer (Open-Meteo, axios riêng)
├── components/
│   ├── CurrentWeatherCard.tsx      # Card thời tiết hiện tại
│   ├── HourlyForecastList.tsx      # Dự báo giờ (scroll ngang)
│   ├── DailyForecastList.tsx       # Dự báo 7 ngày
│   ├── FarmingWeatherAlert.tsx     # Cảnh báo nuôi tôm
│   ├── LocationPickerModal.tsx     # Modal chọn vùng nuôi
│   └── WeatherWidget.tsx           # Widget nhỏ cho header/dashboard
├── hooks/
│   └── useWeatherForecast.ts       # React Query hook (auto-refresh 15p)
├── screens/
│   └── WeatherScreen.tsx           # Màn hình chính (iOS Weather style)
├── store/
│   └── weatherStore.ts             # Zustand store (lưu vùng đã chọn)
├── types/
│   └── weather.types.ts            # TypeScript interfaces (strict)
├── utils/
│   ├── weatherCodes.ts             # WMO code → label + icon tiếng Việt
│   └── weatherLocations.ts         # Danh sách 21 tỉnh + tọa độ GPS
└── README.md                       # File nghiệp vụ này
```

### Nguyên tắc kiến trúc

| Quy tắc                       | Triển khai                                 |
| ----------------------------- | ------------------------------------------ |
| 1 API = 1 Hook                | `weatherApi.ts` → `useWeatherForecast.ts`  |
| Không gọi API trong component | API chỉ trong `weatherApi.ts`              |
| React Query cho GET           | `useQuery` với `refetchInterval: 15 phút`  |
| Strict TypeScript             | Tất cả interface, không dùng `any`         |
| DLS compliance                | Colors, spacing, typography từ `@/styles`  |
| Feature-first                 | Toàn bộ code trong `src/features/weather/` |

---

## 9. Mã Thời Tiết WMO

| Code           | Tiếng Việt       | Icon    |
| -------------- | ---------------- | ------- |
| 0              | Trời quang       | ☀️ / 🌙 |
| 1              | Gần quang        | 🌤️      |
| 2              | Có mây vài nơi   | ⛅      |
| 3              | Nhiều mây        | ☁️      |
| 45, 48         | Sương mù         | 🌫️      |
| 51, 53, 55     | Mưa phùn         | 🌦️      |
| 61, 63, 65     | Mưa              | 🌧️      |
| 66, 67         | Mưa đá           | 🌨️      |
| 71, 73, 75, 77 | Tuyết            | ❄️      |
| 80, 81, 82     | Mưa rào          | 🌧️      |
| 85, 86         | Mưa tuyết        | 🌨️      |
| 95             | Giông            | ⛈️      |
| 96, 99         | Giông kèm mưa đá | ⛈️      |

---

## 10. Hướng Phát Triển

| Ưu tiên       | Tính năng             | Mô tả                                              |
| ------------- | --------------------- | -------------------------------------------------- |
| 🔴 Cao        | **Push notification** | Gửi thông báo khi dự báo vượt ngưỡng nguy hiểm     |
| 🟡 Trung bình | **Dashboard widget**  | Nhúng WeatherWidget vào trang chính Trại nuôi      |
| 🟡 Trung bình | **Tọa độ từ profile** | Lấy tọa độ trang trại từ thông tin vùng nuôi (API) |
| 🟢 Thấp       | **Lịch sử thời tiết** | Xem lại thời tiết quá khứ, so sánh với sự cố       |
| 🟢 Thấp       | **Tích hợp cho ăn**   | Tự động gợi ý lượng thức ăn theo thời tiết         |
| 🟢 Thấp       | **Bản đồ radar mưa**  | Hiển thị radar mưa realtime trên bản đồ            |
