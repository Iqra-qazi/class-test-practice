import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../src/db/db.js";
import userModel from "../src/models/users.model.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@clinic.com";
const password = process.env.ADMIN_PASSWORD || "admin123";

try {
  await connectDB();
  const admin = await userModel.findOne({ email });
  if (admin) {
    admin.name = "Clinic Administrator";
    admin.role = "admin";
    admin.isActive = true;
    admin.password = await bcrypt.hash(password, 10);
    await admin.save();
  } else {
    await userModel.create({
      name: "Clinic Administrator",
      email,
      password: await bcrypt.hash(password, 10),
      role: "admin",
      isActive: true,
    });
  }
  console.log(`Seed admin ready: ${email}`);
} finally {
  await mongoose.disconnect();
}
