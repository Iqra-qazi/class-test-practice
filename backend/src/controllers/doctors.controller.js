import mongoose from "mongoose";
import userModel from "../models/users.model.js";

function escapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const doctorFields = "name specialization experience picture";

export async function listDoctors(req, res, next) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = { role: "doctor", isActive: true };
    if (search) {
      const matcher = { $regex: escapedRegex(search), $options: "i" };
      filter.$or = [{ name: matcher }, { specialization: matcher }];
    }

    const doctors = await userModel.find(filter).select(doctorFields).sort({ name: 1 });
    return res.json({ success: true, data: doctors });
  } catch (error) {
    return next(error);
  }
}

export async function getDoctor(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid doctor id." });
    }

    const doctor = await userModel
      .findOne({ _id: req.params.id, role: "doctor", isActive: true })
      .select(doctorFields);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    return res.json({ success: true, data: doctor });
  } catch (error) {
    return next(error);
  }
}
