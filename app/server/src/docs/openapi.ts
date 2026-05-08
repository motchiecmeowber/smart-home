import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { env } from "../config/env";

import { registerIdentityDocs } from "./identity.docs";
import { registerAutomationDocs } from "./automation.docs";
import { registerHardwareDocs } from "./hardware.docs";
import { registerInteractionDocs } from "./interaction.docs";
import { registerRequestDocs } from "./request.docs";
import { registerLocationDocs } from "./location.docs";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Access token trong Authorization header để xác thực người dùng"
});

registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "refreshToken",
    description: "Refresh token được lưu trong cookie để làm mới access token"
});

registerIdentityDocs(registry);
registerAutomationDocs(registry);
registerHardwareDocs(registry);
registerInteractionDocs(registry);
registerRequestDocs(registry);
registerLocationDocs(registry);

export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: {
        title: "Smart Home Backend API",
        version: "1.0.0",
        description: "API quản lý hệ thống nhà thông minh sử dụng Express, Prisma ORM và Zod"
    },
    servers: [{ url: `http://localhost:${env.PORT || 3000}` }],
    security: [{ bearerAuth: [] }]
});