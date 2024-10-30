const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClinicalNotesSchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    reviewer: { type: Schema.Types.ObjectId, ref: "Staff" },
    triageNotes: {type: String},
    prescriptions: [
      {
        addToCart: { type: Boolean },
        complaint: { type: String },
        treatmentPlan: { type: String },
        products: [
          {
            _id: { type: Schema.Types.ObjectId },
            genericName: { type: String },
            productName: { type: String },
            dosage: { type: String },
            route: { type: String },
            frequency: { type: String },
            duration: { type: String },
            comment: { type: String },
            formulation: { type: String },
            quantity: { type: String },
            strength: { type: String },
            packSize: { type: String },
            sellingPrice: { type: Number }
          }
        ],
        patientId: { type: Schema.Types.ObjectId, ref: "User" },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop" }
      }
    ],
    intervention: {
      details: { type: String },
      otherExplanations: { type: String }
    },
    followUp: { type: String },
    recommendationToPatient: { type: String },
    recommendationToClinician: { type: String }
  },
  { timestamps: true }
);

const ClinicalNotes = mongoose.model("ClinicalNotes", ClinicalNotesSchema, "clinical_notes");

module.exports = ClinicalNotes;
