const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productName: { type: String },
    productTitle: { type: String },
    formulation: { type: String },
    strength: { type: String },
    packSize: { type: String },
    genericName: { type: String },
    costPrice: { type: Number },
    sellingPrice: { type: Number },
    supplier: { type: String },
    expiry: { type: Date },
    batchNumber: { type: String },
    unit: { type: String },
    category: [{ type: String }],
    tags: [{ type: String }],
    salesChannel: { type: String },
    searchField: { type: String },
    reorderLevel: { type: Number, default: 0 },
    showPrice: { type: Boolean, default: true },
    showProduct: { type: Boolean, default: true },
    score: { type: Number, default: 0 },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    storeQuantity: { type: Number, default: 0 },
    prescribed: { type: Boolean, default: true },
    type: { type: String, default: "pharmaceutical" },
    description: { type: String },
    //only take care of percentage calculation
    discount: {
      type: { type: String },
      value: { type: Number },
    },
    productImage: { type: String },
    vat: { type: Number },
  },
  { timestamps: true }
);

// Virtual for custom brand name
ProductSchema.virtual("customBrandName").get(function () {
  return `${this.productName} - ${this.formulation.replace("not applicable", "")} ${this.strength.replace("not applicable", "")} ${this.packSize}`;
});

ProductSchema.set("toJSON", {
  virtuals: true,
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
