const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { medicalHistorySchema } = require("./medical_history");

const VitalSchema = new Schema(
  {
    height: { type: Number },
    weight: { type: Number },
    systolic: { type: Number },
    diastolic: { type: Number },
    oxygen: { type: Number },
    pulse: { type: Number },
    randomBloodSugar: { type: Number },
    fastingBloodSugar: { type: Number },
    hbA1c: { type: Number },
    ldl: { type: Number },
    hdl: { type: Number },
    respiration: { type: Number },
    creatinine: { type: Number },
    eGFR: { type: Number },
    inr: { type: Number },
    comment: { type: String },
  },
  { timestamps: true }
);

const prescriptionProductSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "Product" },
  genericName: { type: String },
  productName: { type: String },
  formulation: { type: String },
  strength: { type: String },
  packSize: { type: String },
  sellingPrice: { type: Number },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String },
  quantity: { type: Number },
  comment: { type: String },
  route: { type: String },
  medicationStatus: { type: Boolean, default: true },
});

const medicationProductSchema = new Schema({
  shop: { type: Schema.Types.ObjectId, ref: "Shop" },
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
  medicationStatus: { type: Boolean, default: true },
  medicationEncounterId: {
    type: Schema.Types.ObjectId,
    ref: "MedicationEncounter",
  },
});

const nextOfKinSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  relationship: { type: String },
  physicalAddress: { county: { type: String }, street: { type: String } },
});

const UserSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    password: { type: String },
    gender: { type: String },
    dob: { type: Date },
    googleId: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    loggedInCount: { type: Number, default: 0 },
    physicalAddress: { county: { type: String }, street: { type: String } },
    occupation: {
      current: { type: String },
      previous: { type: String },
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    },
    nextOfKin: nextOfKinSchema,
    allergies: [{ type: String }],
    medications: [medicationProductSchema],
    prescriptions: [
      {
        shop: { type: Schema.Types.ObjectId, ref: "Shop" },
        products: [prescriptionProductSchema],
        complaint: { type: String },
        treatmentPlan: { type: String },
        medicationEncounterId: {
          type: Schema.Types.ObjectId,
          ref: "MedicationEncounter",
        },
      },
    ],
    medicalHistory: [medicalHistorySchema],
    vitals: [VitalSchema],
    //TODO: implement the below
    shops: [{ type: Schema.Types.ObjectId, ref: "Shop" }],
  },
  { timestamps: true }
);

// Virtual for user's full name
UserSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

// virtual field for bmi = {Weight(kgs) / Height(m)2}
VitalSchema.virtual("bmi").get(function () {
  if (this.weight && this.height) {
    const { height, weight } = this;

    const bmi = this.weight / (height * height);

    return Math.round(bmi * 100) / 100;
  } else {
    return null;
  }
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
