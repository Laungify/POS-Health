const Product = require("../models/product");
const Receipt = require("../models/receipt");
const Shop = require("../models/shop");
const Staff = require("../models/staff");

exports.create = async (req, res, next) => {

  try {
    const { productId, storeQuantity, shopId, supplier, price, comment, staffId, expiry, batchNumber } = req.body;

    if (!productId || !storeQuantity || !shopId || !price) {
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

    const receipt = new Receipt({
      product: {
        _id: product._id,
        productName: product.productName,
        formulation: product.formulation,
        strength: product.strength,
        packSize: product.packSize,
        unit: product.unit,
        storeQuantity,
        price,
        expiry: new Date(expiry),
        batchNumber,
      },
      shop: shop._id,
      staff: staff._id,
      supplier,
      comment,
    });

    await receipt.save();
    if (product.storeQuantity) {
      product.storeQuantity = product.storeQuantity + storeQuantity;
    } else {
      product.storeQuantity = storeQuantity;
    }
    product.save();

    return res.status(201).json(receipt);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error creating receipt",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const receiptId = req.params.receiptId;

    const { productId, storeQuantity, supplier, price, comment, expiry, batchNumber } = req.body;

    if (!productId || !storeQuantity || !price) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const receipt = await Receipt.findById(receiptId).populate("shop");
    if (!receipt) {
      return res.status(400).json({
        code: 400,
        message: "Receipt not found",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({
        code: 400,
        message: "Product not found",
      });
    }

    //updated product
    if (receipt.product._id != productId) {
      const originalProduct = await Product.findById(receipt.product._id);

      //reset original product`s quantity
      originalProduct.storeQuantity =
        originalProduct.storeQuantity - receipt.product.storeQuantity > -1
          ? originalProduct.storeQuantity - receipt.product.storeQuantity
          : 0;

      await originalProduct.save();

      //increment new product`s storeQuantity
      product.storeQuantity = product.storeQuantity + storeQuantity;
    }

    //updated storeQuantity
    if (
      receipt.product._id == productId &&
      receipt.product.storeQuantity != storeQuantity
    ) {
      //subtract old storeQuantity
      product.storeQuantity =
        product.storeQuantity - receipt.product.storeQuantity > -1
          ? product.storeQuantity - receipt.product.storeQuantity
          : 0;

      //add new storeQuantity
      product.storeQuantity = product.storeQuantity + storeQuantity;
    }

    receipt.product = {
      _id: product._id,
      productName: product.productName,
      formulation: product.formulation,
      strength: product.strength,
      packSize: product.packSize,
      unit: product.unit,
      storeQuantity,
      price,
      expiry: new Date(expiry),
      batchNumber,
    };
    receipt.supplier = supplier;
    receipt.comment = comment;
    receipt.staff = staff._id;

    await product.save();
    await receipt.save();

    //TODO:
    /* if (process.env.NODE_ENV == "production") {
      axios({
        method: "post",
        url: process.env.NETLIFY_BUILD_CMD,
      });
    } */

    return res.status(201).json(receipt);
  } catch (error) {
    console.log(
      "🚀 ~ file: receipt.js ~ line 111 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating receipt",
    });
  }
};

exports.delete = async (req, res, next) => {
  const receiptId = req.params.receiptId;

  try {
    await Receipt.deleteOne({ _id: receiptId });
    res
      .status(200)
      .json({ code: 200, message: "Receipt deleted successfully." });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error deleting receipt",
    });
  }
};
