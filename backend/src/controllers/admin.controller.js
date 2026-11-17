import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import appointmentModel from "../models/appointments.model.js";
import userModel from "../models/users.model.js";

function escapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function safeUser(user) {
  const value = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, ...safe } = value;
  return safe;
}

export async function listUsers(req, res, next) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = {};
    if (search) {
      const matcher = { $regex: escapedRegex(search), $options: "i" };
      filter.$or = [{ name: matcher }, { email: matcher }, { specialization: matcher }];
    }

    const users = await userModel.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: users.map(safeUser) });
  } catch (error) {
    return next(error);
  }
}

export async function createDoctor(req, res, next) {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const specialization = String(req.body?.specialization ?? "").trim();
    const experience = Number(req.body?.experience);
    const password = req.body?.password;

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !specialization) {
      return res.status(400).json({ success: false, message: "Enter the doctor's name, valid email, and specialization." });
    }
    if (!Number.isInteger(experience) || experience < 0 || experience > 80) {
      return res.status(400).json({ success: false, message: "Experience must be a whole number from 0 to 80." });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }
    if (await userModel.exists({ email })) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const doctor = await userModel.create({
      name,
      email,
      specialization,
      experience,
      password: await bcrypt.hash(password, 10),
      role: "doctor",
    });
    return res.status(201).json({ success: true, data: safeUser(doctor) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id." });
    }
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user.role === "admin") {
      const admins = await userModel.countDocuments({ role: "admin", isActive: true });
      if (user.isActive && admins <= 1) {
        return res.status(409).json({ success: false, message: "Cannot delete the last active admin." });
      }
    }

    await appointmentModel.deleteMany({ $or: [{ patient: user._id }, { doctor: user._id }] });
    await user.deleteOne();
    return res.json({ success: true, message: "User deleted." });
  } catch (error) {
    return next(error);
  }
}

export async function toggleUserActive(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id." });
    }
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(409).json({ success: false, message: "You cannot deactivate your own account." });
    }
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user.role === "admin" && user.isActive) {
      const activeAdmins = await userModel.countDocuments({ role: "admin", isActive: true });
      if (activeAdmins <= 1) {
        return res.status(409).json({ success: false, message: "Cannot deactivate the last active admin." });
      }
    }
    user.isActive = !user.isActive;
    await user.save();
    return res.json({ success: true, data: safeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id." });
    }
    if (typeof req.body?.isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be a boolean." });
    }
    if (String(req.params.id) === String(req.user.id) && req.body.isActive === false) {
      return res.status(400).json({ success: false, message: "You cannot deactivate your own account." });
    }

    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user.role === "admin" && user.isActive && req.body.isActive === false) {
      const activeAdmins = await userModel.countDocuments({ role: "admin", isActive: true });
      if (activeAdmins <= 1) {
        return res.status(409).json({ success: false, message: "Cannot deactivate the last active admin." });
      }
    }

    user.isActive = req.body.isActive;
    await user.save();
    return res.json({ success: true, data: safeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function listAppointments(req, res, next) {
  try {
    const appointments = await appointmentModel
      .find()
      .populate({ path: "patient", select: "name email" })
      .populate({ path: "doctor", select: "name email specialization" })
      .sort({ appointmentDate: -1, appointmentTime: -1 });
    return res.json({ success: true, data: appointments });
  } catch (error) {
    return next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const [patients, doctors, appointments] = await Promise.all([
      userModel.countDocuments({ role: "patient" }),
      userModel.countDocuments({ role: "doctor" }),
      appointmentModel.countDocuments(),
    ]);
    return res.json({ success: true, data: { patients, doctors, appointments } });
  } catch (error) {
    return next(error);
  }
}
