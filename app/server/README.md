# Smart Home Backend API

Đây là RESTful API phục vụ cho hệ thống Smart Home, chịu trách nhiệm quản lý người dùng, thiết bị, quy trình tự động hóa và giao tiếp trực tiếp với ThingsBoard thông qua REST API.

## Công nghệ sử dụng
- **Framework:** Express.js (Node.js)
- **Ngôn ngữ:** TypeScript
- **Database ORM:** Prisma ORM
- **Cơ sở dữ liệu:** Postgres (Neon)
- **Data Validation:** Zod
- **API Documentation:** Swagger UI (Zod to OpenAPI)

## Cấu trúc thư mục chi tiết

```text
server/
├── prisma/
│   └── schema.prisma                       # Định nghĩa cấu trúc Database cho Prisma
├── src/
│   ├── common/
│   │   ├── api-response.ts                 # Định dạng chuẩn cho kết quả trả về của API
│   │   └── app-error.ts                    # Custom Error Class & helper sendSuccess/sendError
│   ├── config/
│   │   ├── env.ts                          # Validate biến môi trường bằng Zod
│   │   ├── prisma.ts                       # Khởi tạo instance kết nối Prisma Client
│   │   └── tb-api.ts                       # Cấu hình giao tiếp REST API tới ThingsBoard
│   ├── docs/
│   │   └── openapi.ts                      # Tự động sinh tài liệu Swagger UI (zod-to-openapi)
│   ├── middlewares/
│   │   ├── auth.middleware.ts              # Xác thực JWT Token từ request
│   │   ├── error.middleware.ts             # Global Error Handler
│   │   └── role.middleware.ts              # Phân quyền truy cập API theo vai trò
│   ├── modules/                            # Các Domain Module chính
│   │   ├── analytics/                      # Thống kê, báo cáo và dữ liệu lịch sử cảm biến
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.dto.ts
│   │   │   ├── analytics.repository.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── analytics.service.ts
│   │   ├── automation/                     # Lập lịch điều khiển thiết bị chấp hành
│   │   │   ├── automation.controller.ts
│   │   │   ├── automation.dto.ts
│   │   │   ├── automation.repository.ts
│   │   │   ├── automation.routes.ts
│   │   │   └── automation.service.ts
│   │   ├── hardware/                       # Quản lý thiết bị IoT (Device, Sensor, Actuator)
│   │   │   ├── actuator.service.ts         # Điều khiển thiết bị chấp hành qua ThingsBoard RPC
│   │   │   ├── device.service.ts           # CRUD logic cho Device
│   │   │   ├── hardware.controller.ts
│   │   │   ├── hardware.dto.ts
│   │   │   ├── hardware.repository.ts
│   │   │   ├── hardware.routes.ts
│   │   │   └── sensor.service.ts           # Xử lý telemetry từ Sensor
│   │   ├── identity/                       # Đăng ký, đăng nhập, quản lý hồ sơ người dùng
│   │   │   ├── identity.controller.ts
│   │   │   ├── identity.dto.ts
│   │   │   ├── identity.repository.ts
│   │   │   ├── identity.routes.ts
│   │   │   └── identity.service.ts
│   │   ├── interaction/                    # Cảnh báo và thông báo người dùng
│   │   │   ├── interaction.controller.ts
│   │   │   ├── interaction.repository.ts
│   │   │   ├── interaction.routes.ts
│   │   │   └── interaction.service.ts
│   │   ├── location/                       # Quản lý vị trí/khu vực lắp đặt thiết bị
│   │   │   ├── location.controller.ts
│   │   │   ├── location.dto.ts
│   │   │   ├── location.repository.ts
│   │   │   ├── location.routes.ts
│   │   │   └── location.service.ts
│   │   └── request/                        # Yêu cầu quản trị thiết bị (chờ Admin duyệt)
│   │       ├── request.controller.ts
│   │       ├── request.dto.ts
│   │       ├── request.repository.ts
│   │       ├── request.routes.ts
│   │       └── request.service.ts
│   ├── utils/
│   │   └── hash.ts                         # Tiện ích băm mật khẩu
│   └── app.ts                              # Khởi tạo Express, gắn middlewares và routes
├── .env.example                            # File mẫu chứa các biến môi trường cần thiết
├── package.json                            # Danh sách thư viện của riêng Backend
└── tsconfig.json                           # Cấu hình biên dịch TypeScript
```
