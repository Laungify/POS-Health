const User = require("../models/user");
const Product = require("../models/product");
const PurchaseOrder = require("../models/purchase_order");
const Shop = require("../models/shop");

exports.create = async (req, res, next) => {
  try {
    const { productId, storeQuantity, shopId, supplier, price } = req.body;

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

    const order = new PurchaseOrder({
      product: {
        _id: product._id,
        productName: product.productName,
        formulation: product.formulation,
        strength: product.strength,
        packSize: product.packSize,
        storeQuantity,
        price,
      },
      shop: shop._id,
      supplier,
    });

    await order.save();

    return res.status(201).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error creating purchase order",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const orderId = req.params.purchaseOrderId;

    const { productId, storeQuantity, supplier, price } = req.body;

    if (!productId || !storeQuantity || !price) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const order = await PurchaseOrder.findById(orderId).populate("shop");
    if (!order) {
      return res.status(400).json({
        code: 400,
        message: "Purchase order not found",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({
        code: 400,
        message: "Product not found",
      });
    }

    order.product = {
      _id: product._id,
      productName: product.productName,
      formulation: product.formulation,
      strength: product.strength,
      packSize: product.packSize,
      storeQuantity,
      price,
    };

    order.supplier = supplier;

    await order.save();

    return res.status(201).json(order);
  } catch (error) {
    console.log(
      "🚀 ~ file: order.js ~ line 111 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating order",
    });
  }
};

exports.delete = async (req, res, next) => {
  const orderId = req.params.purchaseOrderId;

  try {
    await PurchaseOrder.deleteOne({ _id: orderId });
    res
      .status(200)
      .json({ code: 200, message: "Purchase order deleted successfully." });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error deleting purchaseS order",
    });
  }
};
