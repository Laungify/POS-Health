const Supplier = require("../models/supplier");
const Shop = require("../models/shop");
const Staff = require("../models/staff");

exports.create = async (req, res, next) => {
    try {

        const { name, shopId, contact, staffId, email } = req.body;

        if (!name || !contact || !shopId || !staffId) {
            return res.status(400).json({
                code: 400,
                message: "Missing required fields",
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

        const supplier = new Supplier({
            name,
            email,
            contact,
            staff: staff._id,
            shop
        });
        console.log("supplier", supplier)
        await supplier.save();


        return res.status(201).json(supplier);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: 500,
            message: "Error creating supplier",
        });
    }
};

exports.update = async (req, res, next) => {
    try {
        const supplierId = req.params.supplierId;

        const { name, email, shopId, contact, staffId } = req.body;

        if (!name || !contact || !shopId || !staffId) {
            return res.status(400).json({
                code: 400,
                message: "Missing required fields",
            });
        }

        const supplier = await Supplier.findById(supplierId).populate(["shop", "staff"]);
        if (!supplier) {
            return res.status(400).json({
                code: 400,
                message: "Supplier not found",
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

        supplier.name = name;
        supplier.email = email;
        supplier.contact = contact;
        supplier.staff = staff;

        await supplier.save();

        return res.status(201).json(supplier);
    } catch (error) {
        console.log(
            "🚀 ~ file: supplier.js ~ line 111 ~ exports.update= ~ error",
            error
        );
        res.status(500).json({
            code: 500,
            message: "Error updating supplier",
        });
    }
};

exports.delete = async (req, res, next) => {
    const supplierId = req.params.supplierId;

    try {
        await Supplier.deleteOne({ _id: supplierId });
        res
            .status(200)
            .json({ code: 200, message: "Supplier deleted successfully." });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error deleting supplier",
        });
    }
};
