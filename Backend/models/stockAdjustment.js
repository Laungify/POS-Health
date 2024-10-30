const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockAdjustmentProductSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String },
    genericName: { type: String },
    formulation: { type: String },
    strength: { type: String },
    packSize: { type: String },
    storeQuantity: { type: Number },
    price: { type: Number },
});

const StockAdjustmentSchema = new Schema(
    {
        product: StockAdjustmentProductSchema,
        shop: { type: Schema.Types.ObjectId, ref: "Shop" },
        staff: { type: Schema.Types.ObjectId, ref: "Staff" },
        reason: { type: String },
        storeQuantity: { type: Number },

    },
    { timestamps: true }
);

// Virtual for custom brand name
StockAdjustmentProductSchema.virtual("customBrandName").get(function () {
    return `${this.productName}- ${this.formulation?.replace("not applicable", "")} ${this.strength?.replace("not applicable", "")} ${this.packSize}`;
});

StockAdjustmentProductSchema.set("toJSON", {
    virtuals: true,
});

const StockAdjustment = mongoose.model("StockAdjustment", StockAdjustmentSchema);

module.exports = StockAdjustment;
