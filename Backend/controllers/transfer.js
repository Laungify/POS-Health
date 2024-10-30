const Product = require("../models/product");
const Shop = require("../models/shop");
const Transfer = require("../models/transfer");
const axios = require("axios");
const mongoose = require("mongoose");

exports.create = async (req, res, next) => {
  try {
    const { productId, storeQuantity, from, to } = req.body;

    if (!productId || !storeQuantity || !from || !to) {
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

    /* if (product.storeQuantity - parseInt(storeQuantity) < 0) {
        return res.status(400).json({
          code: 400,
          message: "Invalid quantity",
        });
      } */

    const shopFrom = await Shop.findById(from);
    if (!shopFrom) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const shopTo = await Shop.findById(to);
    if (!shopTo) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const transferProductId = mongoose.Types.ObjectId();

    const transferredProduct = new Product({
      _id: transferProductId,
      productName: product.productName,
      formulation: product.formulation,
      strength: product.strength,
      packSize: product.packSize,
      genericName: product.genericName,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      supplier: product.supplier,
      expiry: new Date(product.expiry),
      batchNumber: product.batchNumber,
      unit: product.unit,
      category: product.category,
      salesChannel: product.salesChannel,
      reorderLevel: product.reorderLevel,
      storeQuantity,
      shop: shopTo,
    });

    await transferredProduct.save();

    const transfer = new Transfer({
      from: shopFrom,
      to: shopTo,
      product: {
        _id: product._id,
        transferProductId,
        productName: product.productName,
        formulation: product.formulation,
        strength: product.strength,
        packSize: product.packSize,
        storeQuantity: storeQuantity,
      },
    });

    await transfer.save();

    product.storeQuantity =
      product.storeQuantity - storeQuantity > -1 ? product.storeQuantity - storeQuantity : 0;

    await product.save();

    // if (process.env.NODE_ENV == "production") {
    //   axios({
    //     method: "post",
    //     url: process.env.NETLIFY_BUILD_CMD,
    //   });
    // }

    return res.status(200).json(transfer);
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 103 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating product",
    });
  }
};

exports.undo = async (req, res, next) => {
  try {
    const transferId = req.params.transferId;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(400).json({
        code: 400,
        message: "Transfer not found",
      });
    }

    const transferredProductId = transfer.product.transferProductId;
    const originalProductId = transfer.product._id;

    const product = await Product.findById(originalProductId);

    product.storeQuantity = product.storeQuantity + transfer.product.storeQuantity;
    product.save();

    await Product.deleteOne({ _id: transferredProductId });

    await Transfer.deleteOne({ _id: transferId });

    // if (process.env.NODE_ENV == "production") {
    //   axios({
    //     method: "post",
    //     url: process.env.NETLIFY_BUILD_CMD,
    //   });
    // }

    res
      .status(200)
      .json({ code: 200, message: "Transfer undone successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error undoing transfer",
    });
  }
};
