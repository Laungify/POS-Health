const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaleProductsSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "Product" },
  productName: { type: String },
  genericName: { type: String },
  formulation: { type: String },
  strength: { type: String },
  category: [{ type: String }],
  unit: { type: String },
  packSize: { type: String },
  sellingPrice: { type: Number },
  costPrice: { type: Number },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String },
  quantity: { type: Number },
  comment: { type: String },
  route: { type: String },
  totalProductPrice: { type: Number },
  totalProductCost: { type: Number },
  vat: { type: Number },
  discount: {
    type: { type: String },
    value: { type: Number },
  },
});

const BillSchema = new Schema({
  received: { type: String },
  totalCost: { type: Number },
  change: { type: String },
  paymentMethod: { type: String },
});

const SaleSchema = new Schema(
  {
    salesPrice: { type: Number },
    totalCostPrice: { type: Number },
    profit: { type: Number },
    products: [SaleProductsSchema],
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    patient: { type: Schema.Types.ObjectId, ref: "User" },
    bill: BillSchema,
    discount: {
      type: { type: String },
      value: { type: Number },
    },
    diagnosis: { type: String },
    saleType: { type: String },
    patientName: { type: String },
    source: { type: String },
    complaint: { type: String },
    treatmentPlan: { type: String },
    prescription: { type: String },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    prescription: { type: Schema.Types.ObjectId, ref: "Prescription" },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
    cancellationTime: { type: Date },
  },
  { timestamps: true }
);

// Virtual for user's full name
SaleSchema.virtual("discountPrice").get(function () {
  if (this?.discount?.type === "Percentage") {
    return this?.salesPrice - (this?.salesPrice * this?.discount.value) / 100;
  } else if (this?.discount?.type === "Amount") {
    return this?.salesPrice - this?.discount.value;
  } else if (this?.discount?.type === "Price Override") {
    return this?.discount.value;
  } else {
    return this?.salesPrice;
  }
});

SaleSchema.set("toJSON", {
  virtuals: true,
});

const Sale = mongoose.model("Sale", SaleSchema);

module.exports = Sale;
