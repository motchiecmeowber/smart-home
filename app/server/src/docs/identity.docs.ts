import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { 
    LoginRequestSchema, 
    RegisterRequestSchema, 
    ChangePasswordRequestSchema, 
    UserResponseSchema, 
    AuthResponseSchema 
} from "@/modules/identity/identity.dto";

export function registerIdentityDocs(registry: OpenAPIRegistry) {
    // Register schemas
    registry.register("LoginRequest", LoginRequestSchema);
    registry.register("RegisterRequest", RegisterRequestSchema);
    registry.register("ChangePasswordRequest", ChangePasswordRequestSchema);
    registry.register("UserResponse", UserResponseSchema);
    registry.register("AuthResponse", AuthResponseSchema);

    // Register api endpoints
    // Post /api/auth/register
    registry.registerPath({
        method: "post",
        path: "/api/auth/register",
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
                        schema: z.object({
                            message: z.string(),
                            data: UserResponseSchema,
                        })
                    }
                }
            },
            400: {
                description: "Yêu cầu không hợp lệ (ví dụ: email đã tồn tại, dữ liệu không hợp lệ)"
            }
        }
    })

    // Post /api/auth/login
    registry.registerPath({
        method: "post",
        path: "/api/auth/login",
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
                        schema: z.object({
                            message: z.string(),
                            data: z.object({
                                accessToken: z.string(),
                                user: UserResponseSchema,
                            })
                        })
                    }
                }
            },
            400: {
                description: "Yêu cầu không hợp lệ (ví dụ: email hoặc mật khẩu không đúng)"
            }
        }
    });

    // Post /api/auth/logout
    registry.registerPath({
        method: "post",
        path: "/api/auth/logout",
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

    // Post /api/auth/refresh-token
    registry.registerPath({
        method: "post",
        path: "/api/auth/refresh-token",
        tags: ["Identity"],
        summary: "Làm mới token",
        description: "Làm mới access token bằng refresh token.",
        security: [{ cookieAuth: [] }],
        request: {
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

    // Post /api/auth/change-password
    registry.registerPath({
        method: "post",
        path: "/api/auth/change-password",
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