const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "Product" },
  productName: { type: String },
  genericName: { type: String },
  formulation: { type: String },
  strength: { type: String },
  packSize: { type: String },
  storeQuantity: { type: Number },
});

const TransferSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "Shop" },
    to: { type: Schema.Types.ObjectId, ref: "Shop" },
    product: ProductSchema,
  },
  { timestamps: true }
);

// Virtual for custom brand name
ProductSchema.virtual("customBrandName").get(function () {
  return `${this.productName} ${this.formulation} ${this.strength} ${this.packSize}`;
});

ProductSchema.set("toJSON", {
  virtuals: true,
});

const Transfer = mongoose.model("Transfer", TransferSchema);

module.exports = Transfer;
