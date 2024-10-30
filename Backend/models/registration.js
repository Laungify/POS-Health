const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RegistrationSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

RegistrationSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

const Registration = mongoose.model("Registration", RegistrationSchema);

module.exports = Registration;
