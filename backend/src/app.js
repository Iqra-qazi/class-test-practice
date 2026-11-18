import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";

import cookieParser from "cookie-parser";

const app = express();

const configuredFrontendOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS ?? "").split(","),
]
  .map((origin) => origin?.trim().replace(/\/+$/, ""))
  .filter(Boolean);
const allowedFrontendOrigins = new Set(["http://localhost:5173", ...configuredFrontendOrigins]);
const vercelFrontendOriginPattern =
  /^https:\/\/class-test-practice(?:-[a-z0-9-]+-iqra-team1)?\.vercel\.app$/i;
const corsOptions = {
  origin(origin, callback) {
    if (
      !origin
      || allowedFrontendOrigins.has(origin)
      || vercelFrontendOriginPattern.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const corsMiddleware = cors(corsOptions);
app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Clinic API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", (await import("./routes/admin.routes.js")).default);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found. API routes are prefixed with /api.",
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ success: false, message: "Internal server error." });
});

export default app;