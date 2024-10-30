const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderProductSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "Product" },
  productName: { type: String },
  genericName: { type: String },
  formulation: { type: String },
  customBrandName: { type: String },
  strength: { type: String },
  packSize: { type: String },
  unit: { type: String },
  category: [{ type: String }],
  sellingPrice: { type: Number },
  costPrice: { type: Number },
  quantity: { type: Number },
  reqQuantity: { type: Number },
  comment: { type: String },
  prescription: { type: String },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String },
  totalProductPrice: { type: Number },
  totalProductCost: { type: Number },
  vat: { type: Number },
  route: { type: String },
  discount: {
    type: { type: String },
    value: { type: Number },
  },
  shop: { type: Schema.Types.ObjectId, ref: "Shop" },
});

const BillSchema = new Schema({
  received: { type: String },
  totalCost: { type: Number },
  change: { type: String },
  paymentMethod: { type: String },
});

const OrderSchema = new Schema(
  {
    product: OrderProductSchema,
    bill: BillSchema,
    totalPrice: { type: Number },
    transactionId: { type: Schema.Types.ObjectId },
    paymentMethod: {
      type: String,
      enum: ["mpesa", "delivery", "pick"],
    },
    orderStatus: { type: String, default: "order sent" },
    diagnosis: { type: String },
    cancellationTime: { type: Date },
    endSaleTime: { type: Date },
    quoteTime: { type: Date },
    receiveTime: { type: Date },
    confirmTime: { type: Date },
    discount: {
      type: { type: String },
      value: { type: Number },
    },
    processed: { type: Boolean, default: false },
    patient: { type: Schema.Types.ObjectId, ref: "User" },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
    address: {
      county: { type: String },
      street: { type: String },
    },
    generalComment: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

OrderSchema.methods.updateOrderStatus = function (e) {
  this.orderStatus = e;
};

OrderSchema.methods.quote = function (
  bill,
  billCost,
  distype,
  disamnt,
  diagnosis,
  staff,
  products
) {
  this.totalPrice = billCost;
  this.diagnosis = diagnosis;
  this.discount.type = distype;
  this.discount.value = disamnt;
  this.bill = bill;
  this.staff = staff._id;
  this.product.dosage = products[0].dosage;
  this.product.frequency = products[0].frequency;
  this.product.duration = products[0].duration;
  this.product.quantity = products[0].quantity;
  this.product.route = products[0].route;
  this.product.totalProductPrice = products[0].totalProductPrice;
  this.product.totalProductCost = products[0].totalProductCost;
};

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
