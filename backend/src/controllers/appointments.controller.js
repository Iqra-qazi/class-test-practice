import mongoose from "mongoose";
import appointmentModel from "../models/appointments.model.js";
import userModel from "../models/users.model.js";

const appointmentStatuses = ["pending", "approved", "rejected", "cancelled"];

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseAppointmentDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }
  return date;
}

function isPastDate(date) {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return date.getTime() < today;
}

export async function bookAppointment(req, res, next) {
  try {
    const doctorId = typeof req.body?.doctor === "string" ? req.body.doctor.trim() : "";
    const appointmentDate = parseAppointmentDate(req.body?.appointmentDate);
    const appointmentTime = typeof req.body?.appointmentTime === "string"
      ? req.body.appointmentTime.trim()
      : "";
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";

    if (!doctorId || !req.body?.appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ success: false, message: "Doctor, date, time, and reason are required." });
    }
    if (!validId(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor id." });
    }
    if (!appointmentDate) {
      return res.status(400).json({ success: false, message: "Enter a valid appointment date in YYYY-MM-DD format." });
    }
    if (isPastDate(appointmentDate)) {
      return res.status(400).json({ success: false, message: "Appointment date cannot be in the past." });
    }
    if (reason.length > 1000) {
      return res.status(400).json({ success: false, message: "Reason must be 1000 characters or fewer." });
    }

    const doctor = await userModel.findOne({
      _id: doctorId,
      role: "doctor",
      isActive: true,
    }).select("_id");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found or is inactive." });
    }

    const activeAppointment = await appointmentModel.exists({
      doctor: doctor._id,
      appointmentDate,
      appointmentTime,
      status: { $in: ["pending", "approved"] },
    });
    if (activeAppointment) {
      return res.status(409).json({
        success: false,
        message: "This doctor already has an active appointment at that date and time.",
      });
    }

    const appointment = await appointmentModel.create({
      patient: req.user.id,
      doctor: doctor._id,
      appointmentDate,
      appointmentTime,
      reason,
    });
    await appointment.populate({ path: "doctor", select: "name specialization experience" });
    return res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This doctor already has an active appointment at that date and time.",
      });
    }
    return next(error);
  }
}

export async function listMyAppointments(req, res, next) {
  try {
    const appointments = await appointmentModel
      .find({ patient: req.user.id })
      .populate({ path: "doctor", select: "name specialization experience" })
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: appointments });
  } catch (error) {
    return next(error);
  }
}

export async function listDoctorAppointments(req, res, next) {
  try {
    const [appointments, statusCounts] = await Promise.all([
      appointmentModel
        .find({ doctor: req.user.id })
        .populate({ path: "patient", select: "name email" })
        .sort({ createdAt: -1 }),
      appointmentModel.aggregate([
        { $match: { doctor: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const countsByStatus = Object.fromEntries(appointmentStatuses.map((status) => [status, 0]));
    for (const { _id, count } of statusCounts) {
      countsByStatus[_id] = count;
    }

    return res.json({
      success: true,
      data: { appointments, countsByStatus },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id." });
    }
    if (!["approved", "rejected"].includes(req.body?.status)) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected." });
    }

    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }
    if (String(appointment.doctor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only update appointments assigned to you." });
    }
    if (appointment.status !== "pending") {
      return res.status(409).json({ success: false, message: "Only pending appointments can be updated." });
    }

    const updatedAppointment = await appointmentModel.findOneAndUpdate(
      { _id: appointment._id, doctor: req.user.id, status: "pending" },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true },
    );
    if (!updatedAppointment) {
      return res.status(409).json({ success: false, message: "Only pending appointments can be updated." });
    }

    return res.json({ success: true, data: updatedAppointment });
  } catch (error) {
    return next(error);
  }
}

export async function cancelAppointment(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id." });
    }

    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }
    if (String(appointment.patient) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only cancel your own appointments." });
    }
    if (appointment.status !== "pending") {
      return res.status(409).json({ success: false, message: "Only pending appointments can be cancelled." });
    }

    const updatedAppointment = await appointmentModel.findOneAndUpdate(
      { _id: appointment._id, patient: req.user.id, status: "pending" },
      { $set: { status: "cancelled" } },
      { new: true, runValidators: true },
    );
    if (!updatedAppointment) {
      return res.status(409).json({ success: false, message: "Only pending appointments can be cancelled." });
    }

    return res.json({ success: true, data: updatedAppointment });
  } catch (error) {
    return next(error);
  }
}
