import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../src/db/db.js";
import userModel from "../src/models/users.model.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 8) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters) before running this script.");
}

try {
  await connectDB();
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await userModel.findOneAndUpdate(
    { email },
    {
      $set: { name: "Clinic Administrator", role: "admin", isActive: true, password: passwordHash },
      $setOnInsert: { email },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  console.log(`Administrator ready: ${admin.email}`);
} finally {
  await mongoose.disconnect();
}
