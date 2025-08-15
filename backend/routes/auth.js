import express from "express";
import { deleteController, loginController, logoutController, registerController } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.delete('/delete/:id', isAuthenticated, deleteController)
router.get('/logout', logoutController)
export default router;
