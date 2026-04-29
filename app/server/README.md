# Smart Home Backend API

Đây là RESTful API phục vụ cho hệ thống Smart Home, chịu trách nhiệm quản lý người dùng, thiết bị, quy trình tự động hóa và giao tiếp trực tiếp với ThingsBoard thông qua giao thức MQTT.

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
│   │   └── app-error.ts                    # Custom Error Class dùng để quăng lỗi toàn hệ thống
│   ├── config/
│   │   ├── env.ts                          # Validate biến môi trường bằng Zod
│   │   ├── prisma.ts                       # Khởi tạo instance kết nối Prisma Client
│   │   └── thingsboard.ts                  # Cấu hình kết nối MQTT tới broker ThingsBoard
│   ├── docs/
│   │   └── openapi.ts                      # Cấu hình tự động sinh tài liệu API (Swagger UI)
│   ├── middlewares/
│   │   ├── auth.middleware.ts              # Xác thực JWT Token từ request
│   │   ├── error.middleware.ts             # Global Error Handler 
│   │   └── role.middleware.ts              # Phân quyền truy cập API theo vai trò 
│   ├── modules/                            # Các Domain Module chính (Tính năng cốt lõi)
│   │   ├── analytics/                      # Thống kê và dữ liệu lịch sử
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.repository.ts
│   │   │   ├── analytics.dto.ts
│   │   │   └── analytics.route.ts
│   │   ├── automation/                     # Xử lý logic lập lịch
│   │   │   ├── automation.controller.ts
│   │   │   ├── automation.service.ts
│   │   │   ├── automation.repository.ts
│   │   │   ├── automation.dto.ts
│   │   │   └── automation.route.ts
│   │   ├── hardware/                       # Quản lý danh sách, trạng thái thiết bị
│   │   │   ├── hardware.controller.ts
│   │   │   ├── hardware.service.ts
│   │   │   ├── hardware.repository.ts
│   │   │   ├── hardware.dto.ts
│   │   │   └── hardware.route.ts
│   │   ├── identity/                       # Xác thực, đăng nhập, quản lý hồ sơ người dùng
│   │   │   ├── interaction.controller.ts
│   │   │   ├── interaction.service.ts
│   │   │   ├── interaction.repository.ts
│   │   │   ├── interaction.dto.ts
│   │   │   └── interaction.route.ts
│   │   └── interaction/                    # Cảnh báo/thông báo hoạt động
│   │       ├── interaction.controller.ts
│   │       ├── interaction.service.ts
│   │       ├── interaction.repository.ts
│   │       ├── interaction.dto.ts
│   │       └── interaction.route.ts
│   ├── utils/
│   └── app.ts                              # File khởi tạo, gắn middlewares/routes cho Express
├── .env.example                            # File mẫu chứa các biến môi trường cần thiết
├── package.json                            # Danh sách thư viện của riêng Backend
└── tsconfig.json                           # Cấu hình biên dịch TypeScript
```
