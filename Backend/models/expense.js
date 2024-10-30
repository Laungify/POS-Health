const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema(
    {
        accountTo: { type: String },
        description: { type: String },
        amount: { type: Number },
        paidTo: { type: String },
        paymentMode: [
            {
                type: String,
                enum: ['mpesa', 'cash', 'cheque', 'credit', 'bank transfer'],
            },
        ],
        staff: { type: Schema.Types.ObjectId, ref: "Staff" },
        shop: { type: Schema.Types.ObjectId, ref: "Shop" },
        receiptImage: { type: String },
        transactionDate: { type: Date },
    },
    { timestamps: true }
);

ExpenseSchema.set("toJSON", {
    virtuals: true,
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
