import bcrypt from "bcryptjs";
import userModel from "../models/users.model.js";
import { signAuthToken } from "../utils/jwt.js";
import { serializeAuthUser } from "../utils/authUser.js";

export async function registerUser(req, res, next) {
  try {
    const name = String(req.body?.name ?? req.body?.username ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = req.body?.password;

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid name and email." });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }
    if (await userModel.exists({ email })) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await userModel.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "patient",
    });
    const token = signAuthToken(user);
    return res.status(201).json({
      success: true,
      token,
      user: serializeAuthUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      if (Object.prototype.hasOwnProperty.call(error.keyPattern ?? {}, "email")) {
        return res.status(409).json({ success: false, message: "An account with this email already exists." });
      }

      console.error("Unexpected duplicate key error while registering user:", error);
      return res.status(500).json({
        success: false,
        message: "Account could not be created because of a conflicting database index.",
      });
    }
    console.error("Error registering user:", error);
    return next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = req.body?.password;
    if (!email || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account is inactive." });
    }

    const token = signAuthToken(user);
    return res.json({
      success: true,
      token,
      user: serializeAuthUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    return res.json({
      success: true,
      token: req.authToken,
      user: serializeAuthUser(user),
    });
  } catch (error) {
    return next(error);
  }
}
