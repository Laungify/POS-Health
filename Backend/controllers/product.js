const Product = require("../models/product");
const Shop = require("../models/shop");
const Transfer = require("../models/transfer");
const Staff = require("../models/staff");
const Searchcopy = require("../models/searchcopy");
const axios = require("axios");
const uploadToCloudinary = require("../api/middleware/uploadToCloudinary");
const uploadFile = require("../api/middleware/uploadFile");

exports.create = async (req, res, next) => {
  try {
    await uploadFile(req, res);

    let productImage = "";
    if (req.file) {
      const cloudinaryImage = await uploadToCloudinary(
        req.file.path,
        "products"
      );
      productImage = cloudinaryImage.secure_url;
    }

    const {
      productName,
      formulation,
      strength,
      packSize,
      genericName,
      costPrice,
      sellingPrice,
      supplier,
      expiry,
      batchNumber,
      unit,
      type,
      prescribed,
      category,
      tags,
      salesChannel,
      reorderLevel,
      shopId,
      storeQuantity,
      staffId,
      description,
      vat = "",
    } = req.body;

    if (
      !productName ||
      !formulation ||
      !strength ||
      !packSize ||
      !genericName ||
      !costPrice ||
      !sellingPrice ||
      !expiry ||
      !unit ||
      !salesChannel ||
      !storeQuantity ||
      !shopId
    ) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (productName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Product name has to be at least 2 characters long",
      });
    }

    if (formulation.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Formulation has to be at least 2 characters long",
      });
    }

    if (genericName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Generic name has to be at least 2 characters long",
      });
    }

    if (costPrice < 0) {
      return res.status(400).json({
        code: 400,
        message: "Cost price cannot be less than 0 ksh",
      });
    }

    if (sellingPrice < 0) {
      return res.status(400).json({
        code: 400,
        message: "Selling price cannot be less than 0 ksh",
      });
    }

    if (new Date(expiry) < new Date()) {
      return res.status(400).json({
        code: 400,
        message: "Expiry cannot be less than current date and time",
      });
    }

    const shop = await Shop.findById(shopId).populate("staff");
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const shopStaff = shop.staff.find(
      (item) => item.member.toString() === staffId.toString()
    );
    if (!shopStaff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    const productFound = await Product.findOne({
      productName: productName,
      formulation: formulation,
      strength: strength,
      packSize: packSize,
      shopId: shopId,
    });
    if (productFound) {
      return res.status(409).json({
        code: 409,
        message: "You are already selling this product",
      });
    }
    const isPrescribed = req.body?.prescribed || false;

    const product = new Product({
      productName: productName.toLowerCase(),
      productTitle: productName.toLowerCase(),
      formulation: formulation.toLowerCase(),
      strength: strength.toLowerCase(),
      packSize: packSize.toLowerCase(),
      genericName: genericName.toLowerCase(),
      prescribed,
      costPrice,
      sellingPrice,
      supplier,
      expiry: new Date(expiry),
      batchNumber,
      searchField: productName.toLowerCase() + "-" + genericName?.replace("not applicable", "").toLowerCase(),
      unit,
      category,
      tags,
      salesChannel,
      staff: staff._id,
      type,
      shop,
      //prescribed: isPrescribed,
      storeQuantity: storeQuantity || 0,
      reorderLevel: reorderLevel || 0,
      description,
      productImage,
      vat,
    });

    // console.log("product", product)

    await product.save();

    // if (process.env.NODE_ENV == "production") {
    //   axios({
    //     method: "post",
    //     url: process.env.NETLIFY_BUILD_CMD,
    //   });
    // }

    return res.status(201).json(product);
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 42 ~ exports.create= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error creating product",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    await uploadFile(req, res);

    const productId = req.params.productId;

    const {
      productName,
      formulation,
      strength,
      packSize,
      genericName,
      costPrice,
      sellingPrice,
      supplier,
      expiry,
      type,
      prescribed,
      batchNumber,
      unit,
      category,
      tags,
      salesChannel,
      reorderLevel,
      shopId,
      staffId,
      description,
      vat = "",
    } = req.body;

    if (
      !productName ||
      !formulation ||
      !strength ||
      !packSize ||
      !genericName ||
      !costPrice ||
      !sellingPrice ||
      !expiry ||
      !unit ||
      !salesChannel ||
      !reorderLevel ||
      !shopId
    ) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const product = await Product.findById(productId).populate([
      {
        path: "shop",
        populate: {
          path: "company", // Populate the "company" field within the "shop" field
        },
      },
      "staff",
    ]);
    if (!product) {
      return res.status(400).json({
        code: 400,
        message: "Product not found",
      });
    }

    if (productName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Product name has to be at least 2 characters long",
      });
    }

    if (formulation.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Formulation has to be at least 2 characters long",
      });
    }

    if (genericName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Generic name has to be at least 2 characters long",
      });
    }

    if (costPrice < 0) {
      return res.status(400).json({
        code: 400,
        message: "Cost price cannot be less than 0 ksh",
      });
    }

    if (sellingPrice < 0) {
      return res.status(400).json({
        code: 400,
        message: "Selling price cannot be less than 0 ksh",
      });
    }

    //TODO: check for expired products and throw error
    /* if (new Date(expiry) < new Date()) {
      return res.status(400).json({
        code: 400,
        message: "Expiry cannot be less than current date and time",
      });
    } */

    const shop = await Shop.findById(shopId).populate("staff");
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const shopStaff = shop.staff.find(
      (item) => item.member.toString() === staffId.toString()
    );
    if (!shopStaff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }
    const productFound = await Product.findOne({
      productName: productName,
      formulation: formulation,
      strength: strength,
      packSize: packSize,
      shopId: product.shop._id,
      _id: { $ne: productId },
    });
    if (productFound) {
      return res.status(409).json({
        code: 409,
        message: "You are already selling this product",
      });
    }

    //const prescribed = req.body?.prescribed || false;

    product.productName = productName.toLowerCase();
    product.productTitle = productName.toLowerCase();
    product.formulation = formulation.toLowerCase();
    product.searchField = productName.toLowerCase() + "-" + genericName.replace("not applicable", "").toLowerCase(),
      product.strength = strength.toLowerCase();
    product.packSize = packSize.toLowerCase();
    product.genericName = genericName.toLowerCase();
    product.costPrice = costPrice;
    product.sellingPrice = sellingPrice;
    product.supplier = supplier;
    product.expiry = new Date(expiry);
    product.batchNumber = batchNumber;
    product.unit = unit;
    product.category = category;
    product.tags = tags;
    product.salesChannel = salesChannel;
    product.reorderLevel = reorderLevel;
    product.prescribed = prescribed;
    product.staff = staff._id;
    product.type = type;
    product.description = description;
    product.vat = vat;

    if (req.file) {
      const cloudinaryImage = await uploadToCloudinary(
        req.file.path,
        "products"
      );
      product.productImage = cloudinaryImage.secure_url;
    }

    await product.save();

    // if (process.env.NODE_ENV == "production") {
    //   axios({
    //     method: "post",
    //     url: process.env.NETLIFY_BUILD_CMD,
    //   });
    // }

    return res.status(200).json(product);
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

exports.getById = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId).populate([
      {
        path: "shop",
        populate: {
          path: "company", // Populate the "company" field within the "shop" field
        },
      },
      "staff",
    ]);

    if (!product) {
      return res.status(400).json({
        code: 400,
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 139 ~ exports.getById= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching product",
    });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    if (!req.query.search) {
      const products = await Product.find({}).populate([
        {
          path: "shop",
          populate: {
            path: "company", // Populate the "company" field within the "shop" field
          },
        },
        "staff",
      ]);

      res.status(200).json(products);
    } else {
      const products = await Product.find({
        searchField: { $regex: new RegExp(req.query.search, "i") },
      }).populate([
        {
          path: "shop",
          populate: {
            path: "company", // Populate the "company" field within the "shop" field 
          },
        },
        "staff",
      ]);
      /*      const products1 = await Product.aggregate([
        {
          $search: {
            index: "productsearch",
            autocomplete: {
              path: "searchField",
              query: `${req.query.search}`,
              // "fuzzy": {
              //   "maxEdits": 2,
              // }
            },
          },
        },
        {
          $limit: 30,
        },
        {
          $project: {
            _id: 0,
            productName: 1,
            showProduct: 1,
            genericName: 1,
            image: 1,
          },
        },
      ]);

      const searchcopy = new Searchcopy({
        productSearch: req.query.search,
      });
      await searchcopy.save(); */
      //console.log("sea", products)

      return res.status(200).json(products);
    }
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 169 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching products",
    });
  }
};

exports.delete = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({
        code: 400,
        message: "Product not found",
      });
    }

    await Product.deleteOne({ _id: productId });

    // if (process.env.NODE_ENV == "production") {
    //   axios({
    //     method: "post",
    //     url: process.env.NETLIFY_BUILD_CMD,
    //   });
    // }

    res
      .status(200)
      .json({ code: 200, message: "Product deleted successfully." });
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 195 ~ exports.delete ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting product",
    });
  }
};

exports.transfer = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    const { storeQuantity, shopId } = req.body;

    if (!storeQuantity || !shopId) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const product = await Product.findById(productId).populate([
      {
        path: "shop",
        populate: {
          path: "company", // Populate the "company" field within the "shop" field
        },
      },
      "staff",
    ]);
    if (!product) {
      return res.status(400).json({
        code: 400,
        message: "Product not found",
      });
    }

    //TODO
    /* if (product.quantity - parseInt(quantity) < 0) {
        return res.status(400).json({
          code: 400,
          message: "Invalid quantity",
        });
      } */

    product.storeQuantity = storeQuantity;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const transferredProduct = new Product({
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
      tags: product.tags,
      salesChannel: product.salesChannel,
      reorderLevel: product.reorderLevel,
      storeQuantity: storeQuantity,
      shop: shop._id,
    });

    await transferredProduct.save();

    const transfer = new Transfer({
      from: product.shop,
      to: shop,
      products: { ...product },
    });

    await transfer.save();

    /* if (process.env.NODE_ENV == "production") {
      axios({
        method: "post",
        url: process.env.NETLIFY_BUILD_CMD,
      });
    } */

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
