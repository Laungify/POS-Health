const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataAccessSchema = new Schema({
  firstName: { type: Boolean, default: true },
  lastName: { type: Boolean, default: true },
  email: { type: Boolean, default: true },
  phoneNumber: { type: Boolean, default: true },
  gender: { type: Boolean, default: true },
  dob: { type: Boolean, default: true },
  physicalAddress: { type: Boolean, default: true },
  bloodGroup: { type: Boolean, default: false },
  nextOfKin: { type: Boolean, default: false },
  allergies: { type: Boolean, default: false },
  medications: { type: Boolean, default: false },
  prescriptions: { type: Boolean, default: false },
  medicalHistory: { type: Boolean, default: false },
});

const ShopsSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    location: { type: String },
    streetLocation: { type: String },
    company: {
      _id: { type: Schema.Types.ObjectId, ref: "Company" },
      name: { type: String },
    },
    staff: [{}],
    patients: [{}],
    showShop: { type: Boolean, default: false },
    licenseStatus: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true },
  { validateBeforeSave: false }
);

const Shop_Copy = mongoose.model("Shop_Copy", ShopsSchema, "shop_copy");

module.exports = Shop_Copy;
