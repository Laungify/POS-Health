const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

const CompanySchema = new Schema(
  {
    name: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "Staff" },
    contact: ContactSchema,
    shops: [{ type: Schema.Types.ObjectId, ref: "Shop" }],
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", CompanySchema);

module.exports = Company;
