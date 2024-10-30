const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReceiptProductSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "Product" },
  productName: { type: String },
  genericName: { type: String },
  formulation: { type: String },
  strength: { type: String },
  packSize: { type: String },
  unit: { type: String },
  storeQuantity: { type: Number },
  price: { type: Number },
  batchNumber: { type: String },
  expiry: { type: Date },
});

const ReceiptSchema = new Schema(
  {
    product: ReceiptProductSchema,
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    supplier: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String },
      email: { type: String },
    },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
    comment: { type: String },
  },
  { timestamps: true }
);

// Virtual for custom brand name
ReceiptProductSchema.virtual("customBrandName").get(function () {
  return `${this.productName}- ${this.formulation?.replace("not applicable", "")} ${this.strength?.replace("not applicable", "")} ${this.packSize}`;
});

ReceiptProductSchema.set("toJSON", {
  virtuals: true,
});

const Receipt = mongoose.model("Receipt", ReceiptSchema);

module.exports = Receipt;
