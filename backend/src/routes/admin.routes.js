import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.js";
import {
  createDoctor,
  deleteUser,
  getStats,
  listAppointments,
  listUsers,
  toggleUserActive,
  updateUserStatus,
} from "../controllers/admin.controller.js";

const router = express.Router();
router.use(protect, authorize("admin"));
router.get("/users", listUsers);
router.post("/doctors", createDoctor);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle", toggleUserActive);
router.patch("/users/:id/status", updateUserStatus);
router.get("/appointments", listAppointments);
router.get("/stats", getStats);

export default router;
