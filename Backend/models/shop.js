const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require('./user')

const ShopsSchema = new Schema(
  {
    name: { type: String },
    physicalAddress: { county: { type: String }, street: { type: String } },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    staff: [
      {
        _id: false, // This prevents the _id field from being added to individual elements in the array
        member: { type: Schema.Types.ObjectId, ref: "Staff" },
        roles: [
          {
            type: String,
            enum: ["admin", "pharmacy", "billing", "doctor"],
          },
        ],
        owner: { type: Boolean, default: false },
        showStaff: { type: Boolean, default: true },
      },
    ],
    patients: [{ type: Schema.Types.ObjectId, ref: "User" }],
    showShop: { type: Boolean, default: false },
    licenseStatus: { type: Boolean, default: true },
    description: { type: String },
    contact: { email: { type: String }, phoneNumber: { type: String } },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", ShopsSchema);

module.exports = Shop;
