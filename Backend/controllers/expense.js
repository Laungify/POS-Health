const Expense = require("../models/expense");
const Shop = require("../models/shop");
const Staff = require("../models/staff");
const uploadToCloudinary = require("../api/middleware/uploadToCloudinary");
const uploadFile = require("../api/middleware/uploadFile");

exports.create = async (req, res, next) => {
    //console.log("req.body", req.body)
    try {
        await uploadFile(req, res);

        let receiptImage = "";
        if (req.file) {
            const cloudinaryImage = await uploadToCloudinary(
                req.file.path,
                "receipts"
            );
            receiptImage = cloudinaryImage.secure_url;
        }

        const { accountTo, description, shopId, amount, paidTo, paymentMode, staffId, transactionDate } = req.body;

        if (!description || !amount || !shopId || !paidTo || !staffId) {
            return res.status(400).json({
                code: 400,
                message: "Missing required fields",
            });
        }

        if (description.length < 2) {
            return res.status(400).json({
                code: 400,
                message: "Description has to be at least 2 characters long",
            });
        }

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(400).json({
                code: 400,
                message: "Shop not found",
            });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(400).json({
                code: 400,
                message: "Staff not found",
            });
        }

        const expense = new Expense({
            accountTo,
            description,
            amount,
            paidTo,
            paymentMode,
            transactionDate,
            receiptImage,
            staff: staff._id,
            shop
        });

        await expense.save();


        return res.status(201).json(expense);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: 500,
            message: "Error creating expense",
        });
    }
};

exports.update = async (req, res, next) => {
    try {
        await uploadFile(req, res);

        const expenseId = req.params.expenseId;

        const { accountTo, description, shopId, amount, paidTo, paymentMode, staffId, transactionDate } = req.body;

        if (!description || !amount || !shopId || !paidTo || !staffId) {
            return res.status(400).json({
                code: 400,
                message: "Missing required fields",
            });
        }

        const expense = await Expense.findById(expenseId).populate(["shop", "staff"]);
        if (!expense) {
            return res.status(400).json({
                code: 400,
                message: "Expense not found",
            });
        }

        if (description.length < 2) {
            return res.status(400).json({
                code: 400,
                message: "Description has to be at least 2 characters long",
            });
        }

        const shop = await Shop.findById(shopId).populate("staff");
        if (!shop) {
            return res.status(400).json({
                code: 400,
                message: "Shop not found",
            });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(400).json({
                code: 400,
                message: "Staff not found",
            });
        }

        expense.accountTo = accountTo;
        expense.description = description;
        expense.amount = amount;
        expense.paidTo = paidTo;
        expense.paymentMode = paymentMode;
        expense.transactionDate = transactionDate;
        expense.staff = staff;

        if (req.file) {
            const cloudinaryImage = await uploadToCloudinary(
                req.file.path,
                "expenses"
            );
            expense.receiptImage = cloudinaryImage.secure_url;
        }

        await expense.save();

        return res.status(201).json(expense);
    } catch (error) {
        console.log(
            "🚀 ~ file: expense.js ~ line 111 ~ exports.update= ~ error",
            error
        );
        res.status(500).json({
            code: 500,
            message: "Error updating expense",
        });
    }
};

exports.delete = async (req, res, next) => {
    const expenseId = req.params.expenseId;

    try {
        await Expense.deleteOne({ _id: expenseId });
        res
            .status(200)
            .json({ code: 200, message: "Expense deleted successfully." });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error deleting expense",
        });
    }
};
