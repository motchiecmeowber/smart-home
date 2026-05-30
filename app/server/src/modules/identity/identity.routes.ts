import { Router } from "express";
import { IdentityController } from "./identity.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const identityController = new IdentityController();
export const identityRouter = Router();

identityRouter.post("/register", identityController.register);
identityRouter.post("/login", identityController.login);
identityRouter.post("/refresh-token", identityController.refreshToken);
identityRouter.post("/logout", authMiddleware, identityController.logout);
identityRouter.post("/change-password", authMiddleware, identityController.changePassword);
// identityRouter.post("/forgot-password", identityController.forgotPassword); // TBD

export const userRouter = Router();
userRouter.patch("/profile", authMiddleware, identityController.updateProfile);
userRouter.get("/profile", authMiddleware, identityController.getProfile);

// ADMIN
userRouter.get("/users", authMiddleware, roleMiddleware("ADMIN"), identityController.getUsers);
userRouter.get("/users/:userId", authMiddleware, roleMiddleware("ADMIN"), identityController.getUserById);
userRouter.delete("/users/:userId", authMiddleware, roleMiddleware("ADMIN"), identityController.deleteUser);

export default identityRouter;
