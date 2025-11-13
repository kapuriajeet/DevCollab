import express from "express";
import { deleteController, loginController, logoutController, registerController, refreshTokenController } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshTokenController);
router.delete('/users/:id', isAuthenticated, deleteController);
router.post('/logout', isAuthenticated, logoutController);

export default router;
