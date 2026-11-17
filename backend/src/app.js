import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";

import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin", (await import("./routes/admin.routes.js")).default);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ success: false, message: "Internal server error." });
});

export default app;