import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { 
    LoginRequestSchema, 
    RegisterRequestSchema, 
    RefreshTokenRequestSchema, 
    ChangePasswordRequestSchema, 
    UserResponseSchema, 
    AuthResponseSchema 
} from "@/modules/identity/identity.dto";

export function registerIdentityDocs(registry: OpenAPIRegistry) {
    // Register schemas
    registry.register("LoginRequest", LoginRequestSchema);
    registry.register("RegisterRequest", RegisterRequestSchema);
    registry.register("RefreshTokenRequest", RefreshTokenRequestSchema);
    registry.register("ChangePasswordRequest", ChangePasswordRequestSchema);

    // Register api endpoints
    // Post /api/identity/register
    registry.registerPath({
        method: "post",
        path: "/api/identity/register",
        tags: ["Identity"],
        summary: "Đăng ký",
        description: "Tạo tài khoản người dùng mới với email, tên người dùng, mật khẩu và thông tin cá nhân.",
        request: {
            body: {
                content: {
                "application/json": {
                    schema: RegisterRequestSchema
                }
            }
            }
        },
        responses: {
            201: {
                description: "Tài khoản được tạo thành công",
                content: {
                    "application/json": {
                        schema: AuthResponseSchema
                    }
                }
            },
            400: {
                description: "Yêu cầu không hợp lệ (ví dụ: email đã tồn tại, dữ liệu không hợp lệ)"
            }
        }
    })

    // Post /api/identity/login
    registry.registerPath({
        method: "post",
        path: "/api/identity/login",
        tags: ["Identity"],
        summary: "Đăng nhập",
        description: "Đăng nhập vào hệ thống với email hoặc username và mật khẩu.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: LoginRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: "Đăng nhập thành công",
                content: {
                    "application/json": {
                        schema: AuthResponseSchema
                    }
                }
            },
            400: {
                description: "Yêu cầu không hợp lệ (ví dụ: email hoặc mật khẩu không đúng)"
            }
        }
    });

    // Post /api/identity/logout
    registry.registerPath({
        method: "post",
        path: "/api/identity/logout",
        tags: ["Identity"],
        summary: "Đăng xuất",
        description: "Đăng xuất khỏi hệ thống, xóa refresh token khỏi Redis.",
        security: [{ bearerAuth: [], cookieAuth: [] }],
        responses: {
            200: {
                description: "Đăng xuất thành công"
            }
        }
    });

    // Post /api/identity/refresh-token
    registry.registerPath({
        method: "post",
        path: "/api/identity/refresh-token",
        tags: ["Identity"],
        summary: "Làm mới token",
        description: "Làm mới access token bằng refresh token.",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: RefreshTokenRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: "Làm mới token thành công",
                content: {
                    "application/json": {
                        schema: AuthResponseSchema
                    }
                }
            },
            400: {
                description: "Yêu cầu không hợp lệ (ví dụ: refresh token không hợp lệ)"
            }
        }
    });

    // Post /api/identity/change-password
    registry.registerPath({
        method: "post",
        path: "/api/identity/change-password",
        tags: ["Identity"],
        summary: "Đổi mật khẩu",
        description: "Đổi mật khẩu của người dùng.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: ChangePasswordRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: "Đổi mật khẩu thành công"
            },
            400: {
                description: "Yêu cầu không hợp lệ (ví dụ: mật khẩu cũ không đúng)"
            }
        }
    });

}