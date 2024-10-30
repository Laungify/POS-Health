const Product = require("../models/product");
const StockAdjustment = require("../models/stockAdjustment");
const Shop = require("../models/shop");
const Staff = require("../models/staff");

exports.create = async (req, res, next) => {
    try {
        const { productId, storeQuantity, shopId, reason, staffId } = req.body;


        if (!productId || !storeQuantity || !shopId || !staffId) {
            return res.status(400).json({
                code: 400,
                message: "Missing required fields",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({
                code: 400,
                message: "Product not found",
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

        const stockAdjustment = new StockAdjustment({
            product: {
                _id: product._id,
                productName: product.productName,
                formulation: product.formulation,
                strength: product.strength,
                packSize: product.packSize,
                storeQuantity,

            },
            shop: shop._id,
            staff: staff._id,
            reason
        });

        await stockAdjustment.save();

        product.storeQuantity = storeQuantity;

        product.save();

        return res.status(201).json(stockAdjustment);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: 500,
            message: "Error creating stockAdjustment",
        });
    }
};

exports.update = async (req, res, next) => {
    try {
        const stockAdjustmentId = req.params.stockAdjustmentId;

        const { productId, storeQuantity, shopId, reason, staffId } = req.body;

        if (!productId || !storeQuantity || !shopId || !staffId) {
            return res.status(400).json({
                code: 400,
                message: "Missing required fields",
            });
        }

        const stockAdjustment = await StockAdjustment.findById(stockAdjustmentId).populate("shop");
        if (!stockAdjustment) {
            return res.status(400).json({
                code: 400,
                message: "stockAdjustment entry not found",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({
                code: 400,
                message: "Product not found",
            });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(400).json({
                code: 400,
                message: "Staff not found",
            });
        }

        // //updated products
        // if (stockAdjustment.product._id != productId) {
        //   const originalProduct = await Product.findById(stockAdjustment.product._id);

        //   //reset original product`s storeQuantity
        //   originalProduct.storeQuantity =
        //     originalProduct.storeQuantity > -1
        //       ? originalProduct.storeQuantity
        //       : 0;

        //   await originalProduct.save();

        //   //increment new product`s storeQuantity
        //   product.storeQuantity = storeQuantity;
        // }

        // //updated storeQuantity
        // if (
        //     stockAdjustment.product._id == productId &&
        //     stockAdjustment.product.storeQuantity != storeQuantity
        // ) {
        //   //subtract old storeQuantity
        //   product.storeQuantity =
        //     product.storeQuantity - receipt.product.storeQuantity > -1
        //       ? product.storeQuantity - receipt.product.storeQuantity
        //       : 0;

        //   //add new storeQuantity
        //   product.storeQuantity = storeQuantity;
        // }

        stockAdjustment.product = {
            _id: product._id,
            productName: product.productName,
            formulation: product.formulation,
            strength: product.strength,
            packSize: product.packSize,
            storeQuantity,

        };
        stockAdjustment.staff = staff._id;
        stockAdjustment.reason = reason;

        if (product.storeQuantity) {
            product.storeQuantity = storeQuantity;
        }

        await product.save();
        await stockAdjustment.save();

        //TODO:
        /* if (process.env.NODE_ENV == "production") {
          axios({
            method: "post",
            url: process.env.NETLIFY_BUILD_CMD,
          });
        } */

        return res.status(201).json(stockAdjustment);
    } catch (error) {
        console.log(
            "🚀 ~ file: stockAdjustment.js ~ line 111 ~ exports.update= ~ error",
            error
        );
        res.status(500).json({
            code: 500,
            message: "Error updating stockAdjustment",
        });
    }
};

exports.delete = async (req, res, next) => {
    const stockAdjustmentId = req.params.stockAdjustmentId;

    try {
        await StockAdjustment.deleteOne({ _id: stockAdjustmentId });
        res
            .status(200)
            .json({ code: 200, message: "StockAdjustment deleted successfully." });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error deleting stockAdjustment",
        });
    }
};
