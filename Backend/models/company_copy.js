const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
});

const ContactSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

const CompanySchema = new Schema(
  {
    name: { type: String },
    admin: AdminSchema,
    contact: ContactSchema,
    shops: [{}],
  },
  { timestamps: true },
  { validateBeforeSave: false }
);

/* AdminSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
  },
}); */

const Company_Copy = mongoose.model(
  "Company_Copy",
  CompanySchema,
  "company_copy"
);

module.exports = Company_Copy;
