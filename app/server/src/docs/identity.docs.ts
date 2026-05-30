import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { 
    LoginRequestSchema, 
    RegisterRequestSchema, 
    ChangePasswordRequestSchema, 
    UserResponseSchema, 
    AuthResponseSchema ,
    UpdateProfileRequestSchema,
    UserDetailResponseSchema
} from "@/modules/identity/identity.dto";

export function registerIdentityDocs(registry: OpenAPIRegistry) {
    // Register schemas
    registry.register("LoginRequest", LoginRequestSchema);
    registry.register("RegisterRequest", RegisterRequestSchema);
    registry.register("ChangePasswordRequest", ChangePasswordRequestSchema);
    registry.register("UserResponse", UserResponseSchema);
    registry.register("AuthResponse", AuthResponseSchema);
    registry.register("UpdateProfileRequest", UpdateProfileRequestSchema);
    registry.register("UserDetailResponse", UserDetailResponseSchema);

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
                        schema: z.object({
                            accessToken: z.string(),
                            user: UserResponseSchema,
                        })
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

    // GET /api/profile
    registry.registerPath({
        method: "get",
        path: "/api/profile",
        tags: ["Identity"],
        summary: "Lấy thông tin hồ sơ cá nhân",
        description: "Người dùng đang đăng nhập lấy thông tin chi tiết của chính mình.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Thành công",
                content: {
                    "application/json": {
                        schema: z.object({
                            message: z.string(),
                            data: UserDetailResponseSchema
                        })
                    }
                }
            },
            404: { description: "Không tìm thấy người dùng" }
        }
    });

    // PATCH /api/profile
    registry.registerPath({
        method: "patch",
        path: "/api/profile",
        tags: ["Identity"],
        summary: "Cập nhật hồ sơ cá nhân",
        description: "Cho phép người dùng tự sửa họ và tên của mình.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UpdateProfileRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: "Cập nhật thành công",
                content: {
                    "application/json": {
                        schema: z.object({
                            message: z.string(),
                            data: UserResponseSchema
                        })
                    }
                }
            },
            400: { description: "Dữ liệu gửi lên không hợp lệ" }
        }
    });

    // GET /api/users
    registry.registerPath({
        method: "get",
        path: "/api/users",
        tags: ["Identity"],
        summary: "[ADMIN] Lấy danh sách tất cả người dùng",
        description: "Lấy danh sách tất cả người dùng trong hệ thống (Yêu cầu quyền ADMIN).",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Thành công",
                content: {
                    "application/json": {
                        schema: z.object({
                            message: z.string(),
                            data: z.array(UserDetailResponseSchema)
                        })
                    }
                }
            },
            403: { description: "Không có quyền truy cập (Không phải Admin)" }
        }
    });

    // GET /api/users/{userId}
    registry.registerPath({
        method: "get",
        path: "/api/users/{userId}",
        tags: ["Identity"],
        summary: "[ADMIN] Xem chi tiết một người dùng",
        description: "Admin xem thông tin chi tiết của một người dùng bất kỳ qua ID.",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                userId: z.string().openapi({ description: "ID của người dùng cần xem" })
            })
        },
        responses: {
            200: {
                description: "Thành công",
                content: {
                    "application/json": {
                        schema: z.object({
                            message: z.string(),
                            data: UserDetailResponseSchema
                        })
                    }
                }
            },
            404: { description: "Không tìm thấy người dùng" }
        }
    });

    // DELETE /api/users/{userId}
    registry.registerPath({
        method: "delete",
        path: "/api/users/{userId}",
        tags: ["Identity"],
        summary: "[ADMIN] Xóa người dùng",
        description: "Admin xóa vĩnh viễn một người dùng khỏi hệ thống.",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                userId: z.string().openapi({ description: "ID của người dùng cần xóa" })
            })
        },
        responses: {
            200: {
                description: "Xóa thành công",
                content: {
                    "application/json": {
                        schema: z.object({
                            message: z.string()
                        })
                    }
                }
            }
        }
    });
}