# Smart Home
Dự án **Smart Home** là một hệ thống giám sát và điều khiển thiết bị thông minh trong nhà, tích hợp công nghệ **IoT** để quản lý dữ liệu cảm biến và điều khiển thiết bị theo thời gian thực thông qua giao diện Web.

## Kiến trúc hệ thống
```
┌──────────────┐      HTTP/WS      ┌──────────────┐      MQTT      ┌──────────────────┐
│  Front-end   │ ◄──────────────►  │   Back-end   │ ◄────────────► │   ThingsBoard    │
│ Application  │                   │     App      │                │  (MQTT Broker)   │
└──────────────┘                   └──────┬───────┘                └────────┬─────────┘
                                          │                                 |
                                          ▼                                 ▼
                                   ┌──────────────┐                ┌─────────────────────┐
                                   │              │                │     Thiết bị IoT    │
                                   │   Database   │                │ (Actuators/Sensors) │
                                   └──────────────┘                └─────────────────────┘
```

## Tính năng chính
| Tính năng | Mô tả |
| --------- | ----- |
| **Theo dõi môi trường** | Xem trực tiếp các thông số nhiệt độ, độ ẩm và nồng độ gas trên giao diện Web và màn hình LCD |
| **Điều khiển thiết bị** | Bật/tắt thiết bị trong nhà từ bất kỳ đâu thông qua ứng dụng |
| **Lập lịch tự động** | Lập lịch trình để các thiết bị tự động bật/tắt vào các thời điểm đã định |
| **Cảnh báo khẩn cấp** | Hệ thống tự động hú còi tại chỗ và gửi thông báo đến ứng dụng ngay khi phát hiện nồng độ gas vượt ngưỡng |
| **Lịch sử dữ liệu** | Xem biểu đồ thống kê sự thay đổi của dữ liệu môi trường theo từng giờ, ngày hoặc tuần |
| **Quản lý hồ sơ** | Người dùng có thể cập nhật thông tin cá nhân và cài đặt tùy chỉnh ứng dụng |

## ThingsBoard
Hệ thống sử dụng **ThingsBoard Cloud** làm trung tâm điều phối dữ liệu giữa Server và Thiết bị.
- **Host:** `demo.thingsboard.io`
- **Giao thức:** MQTT (PORT 1883)
- **Dữ liệu cảm biến (Telemetry):** `temperature`, `humidity`, `gas_value`
- **Lệnh điều khiển (RPC):** `setTempLed`, `setHumiLed`, `getTempLed`, `getHumiLed`

## Cài đặt

### Yêu cầu
- **Node.js** >= 18.x
- **pnpm** (Trình quản lý gói chính của dự án)
- **Database:**

### 1. Clone repository
```
git clone <url-cua-repo>
cd smart-home
```

### 2. Cài đặt pnpm (nếu chưa có)
```
npm install -g pnpm
```

### 3. Cài đặt dependencies
```
pnpm install
```

### 4. Thiết lập Database

### 5. Cấu hình biến môi trường
- Tại `app/client/`: tạo file `.env` từ `.env.example` và kiểm tra `REACT_APP_API_URL`
- Tại `api/server/`: tạo file `.env` từ `.env.example` và điền thông số Database, JWT Secret và ThingsBoard Token

### 6. Chạy ứng dụng
Khởi động đồng thời cả client và server:
```
pnpm dev
```

Khởi động riêng lẻ:
```
pnpm dev:client    # http://localhost:3000
pnpm dev:server    # http://localhost:5000
```

## Cấu trúc thư mục
```
smart-home/
├── app/
│   ├── client/                  # Frontend 
│   │   ├── public/
│   │   └── src/
│   └── server/                  # Backend 
│       └── src/
│           ├── config/          # Quản lý kết nối ThingsBoard & Database
│           ├── controllers/     # Giao tiếp HTTP (nhận Request, gọi Service, trả Response)
│           ├── dtos/            # Data Transfer Objects (Kiểm duyệt dữ liệu đầu vào API) 
│           ├── middlewares/     # Bảo mật (Auth JWT), kiểm tra quyền truy cập
│           ├── models/          # Định nghĩa Class/Schema của thực thể Database
│           ├── repositories/    # Truy xuất Cơ sở dữ liệu
│           ├── routes/          # Danh sách và điều hướng các đường dẫn API
│           ├── services/        # Logic kết nối MQTT với ThingsBoard
│           └── utils/           # Hàm hỗ trợ mã hóa, định dạng dữ liệu
├── hardware/                    
├── packages/                    # Các gói chia sẻ dùng chung cho toàn dự án
│   ├── config/                  # Quy chuẩn code (ESLint, Prettier shared configs)
│   ├── database/                # Scripts khởi tạo Database, SQL Schemas, Migrations
│   └── shared/                  # Type/Interfaces và Constants dùng chung cho cả Client & Server
├── package.json                 # Scripts quản lý tổng
├── pnpm-lock.yaml               # Khóa phiên bản thư viện
└── pnpm-workspace.yaml          # Cấu hình Monorepo
```

## Tech Stack
| Layer | Công nghệ |
| ----- | --------- |
| **Frontend** |  React, TypeScript, Vite |
| **Backend** |  Node.js, Express, TypeScript |
| **Database**|  |
| **IoT**| ThingsBoard (MQTT protocol) |