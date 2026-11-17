import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient",
      required: true,
    },
    specialization: { type: String, trim: true, default: "" },
    experience: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
    picture: { type: String, default: null },
  },
  { timestamps: true },
);

const userModel = mongoose.model("user", userSchema);
export default userModel;
