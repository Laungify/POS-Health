const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the goals schema
const GoalSchema = new Schema({
  description: { type: String },
  timeline: { type: String },
  currentReading: { type: String },
  status: { type: String },
});

// Define the current medications schema
const CurrentMedicationSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  productName: { type: String },
  genericName: { type: String },
  category: { type: String },
  dosage: { type: String },
  route: { type: String },
  frequency: { type: String },
  duration: { type: String },
  comment: { type: String },
  regardsToMeal: { type: String },
  reason: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  specialInstructions: { type: String },
  medicationStatus: { type: Boolean },
  type: { type: String, enum: ["order", "prescription", "medication"] },
  medicationEncounterId: { type: String },
  customId: { type: String },
  formulation: { type: String },
  quantity: { type: Number },
  strength: { type: String },
  packSize: { type: String },
  sellingPrice: { type: Number },
});

// Define the prescriptions schema
const PrescriptionSchema = new Schema({
  addToCart: { type: Boolean },
  complaint: { type: String },
  treatmentPlan: { type: String },
  products: [CurrentMedicationSchema], // Embedded products array
  patientId: { type: Schema.Types.ObjectId, ref: "User" },
  shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
});

// Define the medications schema
const MedicationSchema = new Schema({
  productName: { type: String },
  genericName: { type: String },
  category: { type: String },
  dosage: { type: String },
  route: { type: String },
  frequency: { type: String },
  duration: { type: String },
  comment: { type: String },
  regardsToMeal: { type: String },
  reason: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  instructions: { type: String },
});

// Define the intervention schema
const InterventionSchema = new Schema({
  details: { type: String },
  otherExplanations: { type: String },
});

// Define the medication encounter schema
const MedicationEncounterSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    reviewer: { type: Schema.Types.ObjectId, ref: "Staff" },
    medications: [MedicationSchema],
    prescriptions: [PrescriptionSchema],
    currentMedications: [CurrentMedicationSchema],
    medicationUnderstanding: { type: String },
    potentialDrugInteractions: { type: String },
    potentialSideEffects: { type: String },
    therapeuticAlternatives: { type: String },
    pharmacologicalInterventions: { type: String },
    nonPharmacologicalInterventions: { type: String },
    followUp: { type: String },
    intervention: InterventionSchema,
    recommendationToPatient: { type: String },
    recommendationToClinician: { type: String },
    goals: [GoalSchema],
    referral: {
      doctor: { type: Schema.Types.ObjectId, ref: "Staff" },
      comment: { type: String },
    },
  },
  { timestamps: true }
);

const MedicationEncounter = mongoose.model(
  "MedicationEncounter",
  MedicationEncounterSchema,
  "medication_encounters"
);

module.exports = MedicationEncounter;
