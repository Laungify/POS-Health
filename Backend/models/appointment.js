const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema(
  {
    staff: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
    date: { type: Date },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
    type: {
      type: String,
      enum: ["online", "home", "office"],
    },
    cancellation: {
      reason: { type: String },
      user: { type: Schema.Types.ObjectId, ref: "User" },
      doctor: { type: Schema.Types.ObjectId, ref: "Staff" },
    },
    medicalHistory: { type: Schema.Types.ObjectId, ref: "MedicalHistory" },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);

module.exports = Appointment;
