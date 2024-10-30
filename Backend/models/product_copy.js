const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaleStaffSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  role: { type: String },
});

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
    salesChannel: { type: String },
    searchField: { type: String },
    reorderLevel: { type: Number, default: 0 },
    showPrice: { type: Boolean, default: true },
    showProduct: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    staff: SaleStaffSchema,
    shop: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String },
      company: { _id: { type: Schema.Types.ObjectId }, name: { type: String } },
      location: { county: { type: String }, street: { type: String } },
    },
    quantity: { type: Number, default: 0 },
    prescribed: { type: Boolean, default: true },
    type: { type: String, default: "pharmaceutical" },
    description: { type: String },
    discount: {
      type: { type: String },
      value: { type: Number },
    },
    image: { type: String },
  },
  { timestamps: true }
);

// Virtual for custom brand name
ProductSchema.virtual("customBrandName").get(function () {
  return `${this.productName}- ${this.formulation} ${this.strength} ${this.packSize}`;
});

ProductSchema.set("toJSON", {
  virtuals: true,
});

const Product_Copy = mongoose.model(
  "Product_Copy",
  ProductSchema,
  "products_copy"
);

module.exports = Product_Copy;
