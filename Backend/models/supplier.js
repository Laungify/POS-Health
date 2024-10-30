const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SupplierSchema = new Schema(
    {
        name: { type: String },
        email: { type: String },
        contact: { type: String },
        staff: { type: Schema.Types.ObjectId, ref: "Staff" },
        shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    },
    { timestamps: true }
);

SupplierSchema.set("toJSON", {
    virtuals: true,
});

const Supplier = mongoose.model("Supplier", SupplierSchema);

module.exports = Supplier;
