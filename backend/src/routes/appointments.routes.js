import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  listDoctorAppointments,
  listMyAppointments,
  updateAppointmentStatus,
} from "../controllers/appointments.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();
router.use(protect);
router.post("/", authorize("patient"), bookAppointment);
router.get("/my", authorize("patient"), listMyAppointments);
router.get("/doctor", authorize("doctor"), listDoctorAppointments);
router.patch("/:id/status", authorize("doctor"), updateAppointmentStatus);
router.patch("/:id/cancel", authorize("patient"), cancelAppointment);

export default router;
