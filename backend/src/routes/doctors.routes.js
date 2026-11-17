import express from "express";
import { getDoctor, listDoctors } from "../controllers/doctors.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();
router.use(protect, authorize("admin", "doctor", "patient"));
router.get("/", listDoctors);
router.get("/:id", getDoctor);

export default router;
