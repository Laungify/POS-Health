const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicalHistorySchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "User" },
  shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  reviewer: { type: Schema.Types.ObjectId, ref: "Staff" },
  encounter: {
    testsPrescribed: { type: String },
    date: { type: Date },
    treatmentAbout: { type: String },
    medicationsGiven: [{ type: String }],
    medicationEffective: { type: Boolean },
    adverseReaction: { type: String },
    chiefComplaint: { type: String },
    testsPerformed: [{ type: String }],
    facilitiesVisited: [{ type: String }],
    interventions: { type: String },
    prevMedicalRecordsAvailable: { type: Boolean },
    diagnosis: { type: String },
  },
});

const MedicalHistory = mongoose.model(
  "MedicalHistory",
  medicalHistorySchema,
  "medical_history"
);

module.exports = { MedicalHistory, medicalHistorySchema };
