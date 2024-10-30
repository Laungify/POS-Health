const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderProductSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "Product" },
  productName: { type: String },
  formulation: { type: String },
  strength: { type: String },
  packSize: { type: String },
  storeQuantity: { type: Number },
  price: { type: Number },
});

const PurchaseOrderSchema = new Schema(
  {
    product: OrderProductSchema,
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    supplier: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String },
      email: { type: String },
    },
  },
  { timestamps: true }
);

// Virtual for custom brand name
OrderProductSchema.virtual("customBrandName").get(function () {
  return `${this.productName} ${this.formulation} ${this.strength} ${this.packSize}`;
});

OrderProductSchema.set("toJSON", {
  virtuals: true,
});

const PurchaseOrder = mongoose.model(
  "PurchaseOrder",
  PurchaseOrderSchema,
  "purchaser_orders"
);

module.exports = PurchaseOrder;
