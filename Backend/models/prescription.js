const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PrescriptionProductSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "product" },
  productName: { type: String },
  genericName: { type: String },
  formulation: { type: String },
  strength: { type: String },
  packSize: { type: String },
  unit: { type: String },
  category: [{ type: String }],
  sellingPrice: { type: Number },
  costPrice: { type: Number },
  dosage: { type: Number },
  frequency: { type: Number },
  duration: { type: Number },
  quantity: { type: Number },
  totalProductPrice: { type: Number },
  totalProductCost: { type: Number },
  vat: { type: Number },
  comment: { type: String },
  route: { type: String },
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

//TODO: should PrescriptionProductSchema be an object??
const PrescriptionSchema = new Schema(
  {
    product: [PrescriptionProductSchema],
    bill: BillSchema,
    patient: { type: Schema.Types.ObjectId, ref: "User" },
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    url: { type: String, required: true },
    diagnosis: { type: String },
    processed: { type: Boolean, default: false },
    orderStatus: { type: String, default: "prescription sent" },
    cancellationTime: { type: Date },
    endSaleTime: { type: Date },
    quoteTime: { type: Date },
    receiveTime: { type: Date },
    confirmTime: { type: Date },
    discount: {
      type: { type: String },
      value: { type: Number },
    },
    totalPrice: { type: Number },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

PrescriptionSchema.methods.updateOrderStatus = function (e) {
  this.orderStatus = e;
};

PrescriptionSchema.methods.quote = function (
  bill,
  billCost,
  distype,
  disamnt,
  diagnosis,
  staff
) {
  this.totalPrice = billCost;
  this.diagnosis = diagnosis;
  this.discount.type = distype;
  this.discount.value = disamnt;
  this.bill = bill;
  this.staff = staff._id;
};

PrescriptionSchema.methods.getProducts = function (products) {
  this.product = products;
};

const Prescription = mongoose.model("Prescription", PrescriptionSchema);

module.exports = Prescription;
