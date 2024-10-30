const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DrugsSchema = new Schema({
  productTradeName: { type: String },
  dosageFormName: { type: String },
  apiStrengthPerDosage: { type: String },
});

DrugsSchema.index({
  productTradeName: "text",
  dosageFormName: "text",
  apiStrengthPerDosage: "text",
});

// Virtual for custom brand name
DrugsSchema.virtual("customBrandName").get(function () {
  return `${this.productTradeName} ${this.apiStrengthPerDosage} ${this.dosageFormName}`;
});

DrugsSchema.set("toJSON", {
  virtuals: true,
});

const Drug = mongoose.model("Drug", DrugsSchema);

module.exports = Drug;
