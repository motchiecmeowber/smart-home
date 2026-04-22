import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { env } from "../config/env";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Nhập JWT token để truy cập các API được bảo vệ"
});



export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: {
        title: "Smart Home Backend API",
        version: "1.0.0",
        description: "API quản lý hệ thống nhà thông minh sử dụng Express, Drizzle ORM và Zod"
    },
    servers: [{ url: `http://localhost:${env.PORT || 3000}` }],
});