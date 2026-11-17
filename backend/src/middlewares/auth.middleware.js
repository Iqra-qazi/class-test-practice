import jwt from "jsonwebtoken";
import userModel from "../models/users.model.js";
import { getJwtSecret } from "../utils/jwt.js";

export async function protect(req, res, next) {
  const authorization = req.get("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = bearer;
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }

  if (!payload || typeof payload !== "object" || typeof payload.id !== "string") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }

  try {
    const user = await userModel.findById(payload.id).select("_id name email role isActive");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Account is inactive." });
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    req.authToken = token;
    return next();
  } catch (error) {
    return next(error);
  }
}

export const authenticateToken = protect;
