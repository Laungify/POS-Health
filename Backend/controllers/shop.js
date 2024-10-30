const Company = require("../models/company");
const Product = require("../models/product");
const Shop = require("../models/shop");
const Staff = require("../models/staff");
const PurchaseOrder = require("../models/purchase_order");
const Order = require("../models/order");
const Sale = require("../models/sale");
const Transfer = require("../models/transfer");
const Receipt = require("../models/receipt");
const Expense = require("../models/expense");
const Supplier = require("../models/supplier");
const StockAdjustment = require("../models/stockAdjustment");
const Token = require("../models/token");
const Prescription = require("../models/prescription");
const User = require("../models/user");
const Appointment = require("../models/appointment");
const MedicationEncounter = require("../models/medication_encounter");
const { MedicalHistory } = require("../models/medical_history");
const MedicalNotes = require("../models/medical_notes")
const ProductData = require("../models/productData");
const mongoose = require("mongoose");
const crypto = require("crypto");
const emailService = require("../utils/emailService");
const paginator = require("../utils/paginator");

exports.create = async (req, res, next) => {
  try {
    const { name, physicalAddress, companyId } = req.body;

    if (
      !name ||
      !physicalAddress?.county ||
      !physicalAddress?.street ||
      !companyId
    ) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Title has to be at least 2 characters long",
      });
    }

    const company = await Company.findById(companyId).populate("owner");
    if (!company) {
      return res.status(400).json({
        code: 400,
        message: "Company not found",
      });
    }

    const sameNameShopExists = !!(await Shop.findOne({
      "company._id": companyId,
      name: name.toLowerCase(),
    }));
    if (sameNameShopExists) {
      return res.status(400).json({
        code: 400,
        message: "Shop already exists",
      });
    }

    const newShop = new Shop({
      name: name.toLowerCase(),
      physicalAddress: {
        county: physicalAddress.county,
        street: physicalAddress.street.toLowerCase(),
      },
      contact: {
        ...company.owner,
      },
      company: company._id,
      staff: [
        {
          member: company.owner._id,
          roles: ["admin"],
          owner: true,
        },
      ],
    });

    await newShop.save();

    company.shops.unshift(newShop._id);

    await company.save();

    const shopOwner = await Staff.findById(company.owner._id);

    shopOwner.shops.unshift({
      shop: newShop._id,
      roles: ["admin"],
      owner: true,
    });

    await shopOwner.save();

    return res.status(201).json(newShop);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 42 ~ exports.create= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error creating shop",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;

    const { name, physicalAddress } = req.body;

    if (!name || !physicalAddress?.county || !physicalAddress?.street) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Title has to be at least 2 characters long",
      });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const company = await Company.findById(shop.company).populate("shops");
    if (!company) {
      return res.status(400).json({
        code: 400,
        message: "Company not found",
      });
    }

    const companyShops = company.shops;

    const sameNameShop = companyShops.find(
      (shop) =>
        shop.name === name && !shop._id.equals(mongoose.Types.ObjectId(shopId))
    );

    if (sameNameShop) {
      return res.status(400).json({
        code: 400,
        message: "Shop already exists",
      });
    }

    shop.name = name;
    shop.physicalAddress = physicalAddress;

    await shop.save();

    return res.status(200).json(shop);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 103 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating shop",
    });
  }
};

exports.getById = async (req, res, next) => {
  const shopId = req.params.shopId;

  try {
    const shop = await Shop.findById(shopId).populate([
      "company",
      "staff.member",
      "patients.patient",
    ]);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    res.status(200).json(shop);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 139 ~ exports.getById= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop",
    });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    //const shops = await Shop.find({}).populate("company", "staff", "patients");

    const shops = await Shop.find({})
      .populate("company")
      .populate("staff.member")
      .populate("patients");

    res.status(200).json(shops);
    //console.log("shops", shops)
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 169 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shops",
    });
  }
};

exports.delete = async (req, res, next) => {
  const shopId = req.params.shopId;

  try {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const company = Company.findById(shop.company._id);

    const newCompanyShops = company.shops.filter(
      (shop) => shop.toString() !== shopId.toString()
    );
    company.shops = newCompanyShops;
    company.save();

    const shopStaff = shop.staff;

    // delete shop from each staff member
    shopStaff.forEach(async (staff) => {
      const currentStaff = await Staff.findById(staff.member);

      if (currentStaff) {
        const currentStaffShops = currentStaff.shops;

        const newStaffShops = currentStaffShops.filter(
          (shop) => shop.toString() !== shopId.toString()
        );
        currentStaff.shops = newStaffShops;
        currentStaff.save();
      }
    });

    await Shop.deleteOne({ _id: shopId });

    res.status(200).json({ code: 200, message: "Shop deleted successfully." });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 195 ~ exports.delete ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting shop",
    });
  }
};

exports.getShopOrders = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const matchQuery = {
      "product.shop": mongoose.Types.ObjectId(shopId),
    };

    const aggregationPipeline = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $lookup: {
          from: "staff",
          localField: "staff",
          foreignField: "_id",
          as: "staff",
        },
      },
      {
        $group: {
          _id: "$transactionId",
          patient: { $first: { $arrayElemAt: ["$patient", 0] } },
          orders: { $push: { $mergeObjects: ["$product", "$$ROOT"] } },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" }
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];

    if (search) {
      const regexPattern = new RegExp(search, "i");

      aggregationPipeline.push({
        $match: {
          $or: [
            { "patient.firstName": regexPattern },
            { "patient.lastName": regexPattern },
            { "orders.product.productName": regexPattern },
            { "orders.product.genericName": regexPattern },
          ],
        },
      });
    }

    // Count documents matching search criteria
    const totalOrdersMatchingSearch = search
      ? await Order.aggregate([
        ...aggregationPipeline,
        { $count: "total" },
      ])
      : [];

    // Only add $skip and $limit stages for pagination if limit is provided
    if (limit !== 0) {
      aggregationPipeline.push(
        {
          $skip: offset,
        },
        {
          $limit: limit,
        }
      );
    }

    let result = await Order.aggregate(aggregationPipeline);

    const totalOrders = await Order.countDocuments(matchQuery);

    const totalCount = totalOrdersMatchingSearch.length > 0 ? totalOrdersMatchingSearch[0].total : totalOrders;

    const totalPages = limit ? Math.ceil(totalCount / limit) : 1;

    const shopOrders = {
      paging: {
        total: totalCount,
        page: page,
        pages: totalPages,
      },
      data: result,
    };

    res.status(200).json(shopOrders);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:365 ~ exports.getShopOrders= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop orders",
    });
  }
};

exports.getShopProducts = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
      ];
    }

    let productsQuery = Product.find(query).populate(["shop", "staff"]);

    if (limit) {
      productsQuery = productsQuery.skip(offset).limit(limit);
    }

    const products = await productsQuery.exec();

    const totalProducts = await Product.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalProducts / (limit || totalProducts))
      : 1;

    return res.status(200).json({
      data: products,
      paging: {
        total: totalProducts,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:436 ~ exports.getShopProducts= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop products",
    });
  }
};


exports.getShopProduct = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const productId = req.params.productId;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const product = await Product.findById(productId).populate(["shop", "staff"]);
    if (!product) {
      return res.status(400).json({
        code: 400,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      data: product,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:476 ~ exports.getShopProductById= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop product",
    });
  }
};


exports.getShopInfos = async (req, res) => {
  try {
    const products = await ProductData.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error occurred' });
  }
};


exports.getShopInfoByGenericName = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const genericName = req.query.genericName;

    // const shop = await Shop.findById(shopId);
    // if (!shop) {
    //   return res.status(400).json({ code: 400, message: "Shop not found" });
    // }

    const products = await ProductData.find({ genericName: { $regex: genericName, $options: 'i' } });

    if (!products) {
      return res.status(404).json({
        code: 404,
        message: "No products found for the specified generic name",
      });
    }

    return res.status(200).json({ data: products });
  } catch (error) {
    console.error("Error fetching shop product by generic name:", error); b
    return res.status(500).json({ code: 500, message: "Error fetching shop product by generic name" });
  }
};


exports.getShopStaff = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = {
      "shops.shop": shopId,
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    let staffQuery = Staff.find(query);

    // Check if limit is specified
    if (limit) {
      staffQuery = staffQuery.skip(offset).limit(limit);
    }

    const staff = await staffQuery.exec();

    const totalStaff = await Staff.countDocuments(query);

    const pages = limit ? Math.ceil(totalStaff / (limit || totalStaff)) : 1;

    return res.status(200).json({
      data: staff,
      paging: {
        total: totalStaff,
        page,
        pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:562 ~ exports.getShopStaff= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop staff",
    });
  }
};

exports.getShopPurchaseOrders = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
      ];
    }

    let purchaseOrdersQuery = PurchaseOrder.find(query).populate("shop");

    // Check if limit is specified
    if (limit) {
      purchaseOrdersQuery = purchaseOrdersQuery.skip(offset).limit(limit);
    }

    const purchaseOrders = await purchaseOrdersQuery.exec();

    const totalPurchaseOrders = await PurchaseOrder.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalPurchaseOrders / (limit || totalPurchaseOrders))
      : 1;

    return res.status(200).json({
      data: purchaseOrders,
      paging: {
        total: totalPurchaseOrders,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:555 ~ exports.getShopPurchaseOrders= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop purchase orders",
    });
  }
};

exports.getShopSales = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: mongoose.Types.ObjectId(shopId) };

    const aggregationPipeline = [
      {
        $match: query,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $addFields: { v: 0 },
      },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
    ];

    if (search) {
      const regexPattern = new RegExp(search.toLowerCase(), "i");
    
      aggregationPipeline.push({
        $match: {
          $or: [
            { "patient.firstName": regexPattern },
            { "patient.lastName": regexPattern },
            { "products.productName": regexPattern },
            { "products.genericName": regexPattern },
            { "patientName": regexPattern },
            { "bill.paymentMethod": regexPattern },
          ],
        },
      });
    }
    


    const totalSalesMatchingSearch = search
      ? await Sale.aggregate([
        ...aggregationPipeline,
        { $count: "total" },
      ])
      : [];

    if (limit > 0) {
      aggregationPipeline.push(
        {
          $skip: offset,
        },
        {
          $limit: limit,
        }
      );
    }

    // Count total documents regardless of search criteria
    const totalSales = await Sale.countDocuments(query);

    const totalCount = totalSalesMatchingSearch.length > 0 ? totalSalesMatchingSearch[0].total : totalSales;

    let result = await Sale.aggregate(aggregationPipeline);

    result = await Sale.populate(result, [
      { path: "shop" },
      { path: "patient" },
      { path: "order" },
      { path: "prescription" },
      { path: "staff" }
    ]);

    const pages = limit ? Math.ceil(totalCount / limit) : 1;

    return res.status(200).json({
      data: result,
      paging: {
        total: totalCount,
        page,
        pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:706 ~ exports.getShopSales= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop sales",
    });
  }
};


exports.getShopTransfers = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    if (search) {
      query.$or = [
        { "product.productName": { $regex: search, $options: "i" } },
        { "product.genericName": { $regex: search, $options: "i" } },
        { "to.name": { $regex: search, $options: "i" } },
      ];
    }

    let transfersQuery = Transfer.find(query).populate(["from", "to"]);

    // Check if limit is specified
    if (limit) {
      transfersQuery = transfersQuery.skip(offset).limit(limit);
    }

    const transfers = await transfersQuery.exec();

    const totalTransfers = await Transfer.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalTransfers / (limit || totalTransfers))
      : 1;

    return res.status(200).json({
      data: transfers,
      paging: {
        total: totalTransfers,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:690 ~ exports.getShopTransfers= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop transfers",
    });
  }
};

exports.getShopReceipts = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    if (search) {
      query.$or = [
        { "product.productName": { $regex: search, $options: "i" } },
        { "product.genericName": { $regex: search, $options: "i" } },//TODO: add this to the model to work
        { "supplier.name": { $regex: search, $options: "i" } },
        { "supplier.email": { $regex: search, $options: "i" } },
      ];
    }

    let receiptsQuery = Receipt.find(query).populate(["shop", "staff"]);

    receiptsQuery = receiptsQuery.sort({ "createdAt": -1 });

    // Check if limit is specified
    if (limit) {
      receiptsQuery = receiptsQuery.skip(offset).limit(limit);
    }

    const receipts = await receiptsQuery.exec();

    const totalReceipts = await Receipt.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalReceipts / (limit || totalReceipts))
      : 1;

    return res.status(200).json({
      data: receipts,
      paging: {
        total: totalReceipts,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:752 ~ exports.getShopReceipts= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop receipts",
    });
  }
};

exports.getShopExpenses = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    if (search) {
      query.$or = [
        { accountTo: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { paidTo: { $regex: search, $options: "i" } },

      ];
    }

    let expensesQuery = Expense.find(query).populate(["shop", "staff"]);

    expensesQuery = expensesQuery.sort({ "createdAt": -1 });

    // Check if limit is specified
    if (limit) {
      expensesQuery = expensesQuery.skip(offset).limit(limit);
    }

    const expenses = await expensesQuery.exec();

    const totalExpenses = await Expense.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalExpenses / (limit || totalExpenses))
      : 1;

    return res.status(200).json({
      data: expenses,
      paging: {
        total: totalExpenses,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:752 ~ exports.getShopExpenses= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop expenses",
    });
  }
};

exports.getShopSuppliers = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },


      ];
    }

    let suppliersQuery = Supplier.find(query).populate("shop");

    suppliersQuery = suppliersQuery.sort({ "createdAt": -1 });

    // Check if limit is specified
    if (limit) {
      suppliersQuery = suppliersQuery.skip(offset).limit(limit);
    }

    const suppliers = await suppliersQuery.exec();

    const totalSuppliers = await Supplier.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalSuppliers / (limit || totalSuppliers))
      : 1;

    return res.status(200).json({
      data: suppliers,
      paging: {
        total: totalSuppliers,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:752 ~ exports.getShopSuppliers= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop supplier",
    });
  }
};

exports.getShopStockAdjustments = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    if (search) {
      query.$or = [
        { "product.productName": { $regex: search, $options: "i" } },
        { "product.genericName": { $regex: search, $options: "i" } },//TODO: add this to the model to work
      ];
    }

    let stockAdjustmentsQuery = StockAdjustment.find(query).populate(["shop", "staff"]);

    stockAdjustmentsQuery = stockAdjustmentsQuery.sort({ "createdAt": -1 });

    // Check if limit is specified
    if (limit) {
      stockAdjustmentsQuery = stockAdjustmentsQuery.skip(offset).limit(limit);
    }

    const stockAdjustments = await stockAdjustmentsQuery.exec();

    const totalStockAdjustments = await StockAdjustment.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalStockAdjustments / (limit || totalStockAdjustments))
      : 1;

    return res.status(200).json({
      data: stockAdjustments,
      paging: {
        total: totalStockAdjustments,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:752 ~ exports.getShopSuppliers= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop supplier",
    });
  }
};

exports.getShopPatients = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = {
      shops: shopId,
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: new RegExp(search, "i") } },
        { lastName: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
      ];
    }

    let patientsQuery = User.find(query);

    // Check if limit is specified
    if (limit) {
      patientsQuery = patientsQuery.skip(offset).limit(limit);
    }

    const patients = await patientsQuery.exec();

    const totalPatients = await User.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalPatients / (limit || totalPatients))
      : 1;

    return res.status(200).json({
      data: patients,
      paging: {
        total: totalPatients,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:814 ~ exports.getShopPatients= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop patients",
    });
  }
};

/* exports.getShopAppointments = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    //TODO: fix query
    const query = {
      "staff.shops.shop": mongoose.Types.ObjectId(shopId),
    };

    if (search) {
      query.$or = [
        { "user.firstName": { $regex: new RegExp(search, "i") } },
        { "user.lastName": { $regex: new RegExp(search, "i") } },
        { "user.email": { $regex: new RegExp(search, "i") } },
        { "user.phoneNumber": { $regex: new RegExp(search, "i") } },
        { "staff.firstName": { $regex: new RegExp(search, "i") } },
        { "staff.lastName": { $regex: new RegExp(search, "i") } },
        { "staff.email": { $regex: new RegExp(search, "i") } },
        { "staff.phoneNumber": { $regex: new RegExp(search, "i") } },
        { type: { $regex: new RegExp(search, "i") } },
      ];
    }

    let appointmentsQuery = Appointment.find(query).populate(
      "staff user medicalHistory"
    );

    // Check if limit is specified
    if (limit) {
      appointmentsQuery = appointmentsQuery.skip(offset).limit(limit);
    }

    const appointments = await appointmentsQuery.exec();

    const totalAppointments = await Appointment.countDocuments(query);

    const pages = limit
      ? Math.ceil(totalAppointments / (limit || totalAppointments))
      : 1;

    return res.status(200).json({
      data: appointments,
      paging: {
        total: totalAppointments,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:901 ~ exports.getShopAppointments= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop appointments",
    });
  }
}; */

exports.getShopAppointments = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {};

    let appointmentsQuery = Appointment.find(query)
      .populate(["staff", "user", "medicalHistory"])
      .sort({ date: -1 });

    const appointments = await appointmentsQuery.exec();

    const filteredAppointments = appointments.filter((appointment) => {
      return appointment.staff.shops.some(
        (shop) => shop.shop.toString() === shopId.toString()
      );
    });

    const regexSearch = new RegExp(search, "i");

    const searchedAppointments = filteredAppointments.filter(
      (appointment) =>
        regexSearch.test(appointment.staff.firstName) ||
        regexSearch.test(appointment.staff.lastName) ||
        regexSearch.test(appointment.staff.email) ||
        regexSearch.test(appointment.staff.phoneNumber) ||
        regexSearch.test(appointment.user.firstName) ||
        regexSearch.test(appointment.user.lastName) ||
        regexSearch.test(appointment.user.email) ||
        regexSearch.test(appointment.user.phoneNumber) ||
        regexSearch.test(appointment.type)
    );

    const items = paginator(searchedAppointments, page, limit);

    const appointmentsCollection = items.data;

    const appointmentsCollectionCount = items.total;
    const totalPages = items.totalPages;

    return res.status(200).json({
      data: appointmentsCollection,
      paging: {
        total: appointmentsCollectionCount,
        page: page,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:957 ~ exports.getShopAppointments= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error fetching shop appointments",
    });
  }
};

exports.createShopPatient = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const { firstName, lastName, email, phoneNumber } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    if (!email || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (firstName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "First name has to be at least 2 characters long",
      });
    }

    if (lastName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Last name has to be at least 2 characters long",
      });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email",
      });
    }

    let patient = await User.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    }).exec();

    if (!patient) {
      sendMail = false;
      patient = new User({
        ...req.body,
        shops: [shopId],
      });
    } else {
      //patient already exists
      patient.shops.push(shopId);
    }

    await patient.save();

    shop.patients.push(patient._id);

    shop.save();

    const code = crypto.randomBytes(16).toString("hex");

    const token = new Token({
      ownerId: patient._id,
      code,
    });
    await token.save();

    const baseUrl = process.env.CLIENT_URL;
    const data = {
      from: '"Afyabook" <no-reply@afyabook.com>',
      to: email,
      subject: `Invite from ${shop.name}`,
      html: `
          <h2>Hi ${firstName},</h2>
          <p>You have been invited to join <strong><a href="${baseUrl}/?shop=${shopId}&invite=${code}">Afyabook</a></strong> by ${shop.name}</p>
          `,
    };

    await emailService.sendMail(data);

    return res.status(201).json(patient);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1048 ~ exports.createShopPatient= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error creating patient",
    });
  }
};

exports.updateShopPatient = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const { firstName, lastName, email, phoneNumber } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({
        code: 400,
        message: "First name and last name are required",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        code: 400,
        message: "Phone number is required",
      });
    }

    if (firstName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "First name has to be at least 2 characters long",
      });
    }

    if (lastName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Last name has to be at least 2 characters long",
      });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: patientId },
      { ...req.body },
      {
        new: true,
      }
    ).exec();

    if (!updatedUser) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    return res.status(201).json(updatedUser);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating patient",
    });
  }
};

exports.getShopPatientMedicationEncounters = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    //TODO: fix search
    /* if (search) {
      const regexSearch = new RegExp(search, "i");

      query.$or = [
        { "user.firstName": { $regex: regexSearch } },
        { "user.lastName": { $regex: regexSearch } },
        { "user.email": { $regex: regexSearch } },
        { "user.phoneNumber": { $regex: regexSearch } },
        { "reviewer.firstName": { $regex: regexSearch } },
        { "reviewer.lastName": { $regex: regexSearch } },
        { "reviewer.email": { $regex: regexSearch } },
        { "reviewer.phoneNumber": { $regex: regexSearch } },
        { "shop.name": { $regex: regexSearch } },
      ];
    } */

    let medicationEncounterQuery = MedicationEncounter.find(query).populate([
      "user",
      "shop",
      "reviewer",
    ]);

    // Check if limit is specified
    if (limit) {
      medicationEncounterQuery = medicationEncounterQuery
        .skip(offset)
        .limit(limit);
    }

    const medicationEncounters = await medicationEncounterQuery.exec();

    const totalMedicationEncounters = await MedicationEncounter.countDocuments(
      query
    );

    const pages = limit
      ? Math.ceil(
        totalMedicationEncounters / (limit || totalMedicationEncounters)
      )
      : 1;

    return res.status(200).json({
      data: medicationEncounters,
      paging: {
        total: totalMedicationEncounters,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1206 ~ exports.getShopPatientMedicationEncounters= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching patient medication encounters",
    });
  }
};

exports.deleteShopPatient = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patientIndex = shop.patients.findIndex(
      (patient) => patient.toString() === patientId.toString()
    );

    if (patientIndex === -1) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    shop.patients.splice(patientIndex, 1);
    await shop.save();

    const user = await User.findById(patientId);

    if (user) {
      const shopIndex = user.shops.findIndex(
        (shop) => shop.toString() === shopId.toString()
      );

      if (shopIndex !== -1) {
        user.shops.splice(shopIndex, 1);
        await user.save();
      }
    }

    res
      .status(200)
      .json({ code: 200, message: "Patient deleted successfully." });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1262 ~ exports.deleteShopPatient ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error deleting Patient",
    });
  }
};

exports.getShopInvitedPatient = async (req, res, next) => {
  try {
    const invite = req.params.invite;
    const shopId = req.params.shopId;

    if (!invite) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const token = await Token.findOne({ code: invite });
    if (!token) {
      return res.status(400).json({
        code: 400,
        message: "Invite verification failed. Please try again",
      });
    }

    const shop = await Shop.findById(shopId).populate("patients.patient");
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const tokenId = token.id;
    const patientId = token.ownerId;

    /* const patient = shop.patients.id(patientId); */

    const patient = shop.patients.find(
      (patient) => patient._id.toString() == patientId.toString()
    );

    if (!patient) {
      return res.status(400).json({
        code: 400,
        message: "Invite verification failed. Please try again",
      });
    }

    //TODO:figure out if this needs to be uncommented

    /* await Token.deleteOne({ _id: tokenId });
     */

    res.status(200).json(patient);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1329 ~ exports.getShopInvitedPatient= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error verifying invite",
    });
  }
};

exports.getShopPrescriptions = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: mongoose.Types.ObjectId(shopId) };

    const aggregationPipeline = [
      {
        $match: query,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $addFields: { v: 0 },
      },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      }
    ];

    if (search) {
      const regexPattern = new RegExp(search, "i");

      aggregationPipeline.push({
        $match: {
          $or: [
            { "patient.firstName": regexPattern },
            { "patient.lastName": regexPattern },
            { "product.productName": regexPattern },
            { "product.genericName": regexPattern },
          ],
        },
      });
    }

    // Count documents matching search criteria
    const totalPrescriptionsMatchingSearch = search
      ? await Prescription.aggregate([
        ...aggregationPipeline,
        { $count: "total" },
      ])
      : [];

    // Only add $skip and $limit stages for pagination if limit is provided
    if (limit !== 0) {
      aggregationPipeline.push(
        {
          $skip: offset,
        },
        {
          $limit: limit,
        }
      );
    }

    let result = await Prescription.aggregate(aggregationPipeline);

    result = await Prescription.populate(result, [
      { path: "patient" },
      { path: "staff" },
      { path: "shop" }
    ]);

    const totalPrescriptions = await Prescription.countDocuments(query);

    const totalCount = totalPrescriptionsMatchingSearch.length > 0 ? totalPrescriptionsMatchingSearch[0].total : totalPrescriptions;

    const pages = limit
      ? Math.ceil(totalCount / limit)
      : 1;

    return res.status(200).json({
      data: result,
      paging: {
        total: totalCount,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1403 ~ exports.getShopPrescriptions= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error fetching shop prescriptions",
    });
  }
};

exports.createShopPatientPrescription = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const { products, complaint, treatmentPlan, addToCart } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    if (!complaint || !treatmentPlan || products.length < 1) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (complaint.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Complaint has to be at least 2 characters long",
      });
    }

    if (treatmentPlan.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Treatment plan has to be at least 2 characters long",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.findIndex(
      (patient) => patient.toString() === patientId.toString()
    );

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    patient.prescriptions.push({
      products,
      complaint,
      treatmentPlan,
      addToCart,
    });
    await patient.save();

    //TODO: is it necessary to return all results back

    return res.status(201).json(patient.prescriptions);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1472 ~ exports.createShopPatientPrescription= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error creating patient prescription",
    });
  }
};

exports.updateShopPatientPrescription = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const prescriptionId = req.params.prescriptionId;
    const { products, complaint, treatmentPlan } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    if (!complaint || !treatmentPlan || products.length < 1) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (complaint.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Complaint has to be at least 2 characters long",
      });
    }

    if (treatmentPlan.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Treatment plan has to be at least 2 characters long",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.findIndex(
      (patient) => patient.toString() === patientId.toString()
    );

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const prescriptions = patient.prescriptions;

    const updated = prescriptions.find(
      (item) => item._id.toString() == prescriptionId.toString()
    );

    if (!updated) {
      return res.status(400).json({
        code: 400,
        message: "Prescription not found",
      });
    }

    const prescriptionIndex = prescriptions.findIndex(
      (item) => item._id.toString() == prescriptionId.toString()
    );

    if (prescriptionIndex !== -1) {
      patient.prescriptions[prescriptionIndex] = {
        products,
        complaint,
        treatmentPlan,
      };
    }

    await patient.save();

    //TODO: is it necessary to return all results back

    return res.status(201).json(patient.prescriptions);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1562 ~ exports.updateShopPatientPrescription= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating patient prescription",
    });
  }
};

exports.deleteShopPatientPrescription = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const prescriptionId = req.params.prescriptionId;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.findIndex(
      (patient) => patient.toString() === patientId.toString()
    );

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const prescriptions = patient.prescriptions;

    const deleted = prescriptions.find(
      (item) => item._id.toString() === prescriptionId.toString()
    );

    if (!deleted) {
      return res.status(400).json({
        code: 400,
        message: "Prescription not found",
      });
    }

    const deletedIndex = prescriptions.findIndex(
      (item) => item._id.toString() == prescriptionId.toString()
    );

    if (deletedIndex !== -1) {
      patient.prescriptions.splice(deletedIndex, 1);
      patient.save();
    }

    res.status(200).json({
      code: 200,
      message: "Patient prescription deleted successfully.",
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1631 ~ exports.deleteShopPatientPrescription ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error deleting patient prescription",
    });
  }
};

exports.getShopPatientPrescriptions = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.indexOf(patientId);

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const prescriptions = patient.prescriptions;

    return res.status(201).json(prescriptions);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting patient prescription",
    });
  }
};

exports.createShopPatientMedication = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const {
      productName,
      genericName,
      category,
      route,
      frequency,
      duration,
      dosage,
      comment,
      regardsToMeal,
      reason,
      startDate,
      endDate,
      instructions,
      medicationStatus,
    } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    if (!productName || !genericName) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.indexOf(patientId);

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    patient.medications.push({
      productName,
      genericName,
      category,
      route,
      frequency,
      duration,
      dosage,
      comment,
      regardsToMeal,
      reason,
      startDate,
      endDate,
      instructions,
      medicationStatus,
    });
    await patient.save();

    return res.status(201).json(patient.medications);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error adding medication",
    });
  }
};

exports.updateShopPatientMedication = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const medicationId = req.params.medicationId;
    const {
      productName,
      genericName,
      category,
      route,
      frequency,
      duration,
      dosage,
      comment,
      regardsToMeal,
      reason,
      startDate,
      endDate,
      instructions,
      medicationStatus,
    } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    if (!productName || !genericName) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.indexOf(patientId);

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const medications = patient.medications;

    const medicationFound = !!medications.id(medicationId);

    if (!medicationFound) {
      return res.status(400).json({
        code: 400,
        message: "Medication not found",
      });
    }

    const medicationIndex = medications.findIndex(
      (item) => item._id == medicationId
    );

    patient.medications[medicationIndex] = {
      productName,
      genericName,
      category,
      route,
      frequency,
      duration,
      dosage,
      comment,
      regardsToMeal,
      reason,
      startDate,
      endDate,
      instructions,
      medicationStatus,
    };

    await patient.save();

    return res.status(201).json(patient.medications);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating",
    });
  }
};

exports.deleteShopPatientMedication = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const medicationId = req.params.medicationId;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.indexOf(patientId);

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const medications = patient.medications;

    const medicationIndex = medications.findIndex(
      (item) => item._id == medicationId
    );

    if (!medicationIndex === -1) {
      return res.status(400).json({
        code: 400,
        message: "Medication not found",
      });
    }

    patient.medications.splice(medicationIndex, 1);

    await patient.save();

    return res.status(201).json(patient.medications);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting medication",
    });
  }
};

exports.getShopPatientMedications = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.indexOf(patientId);

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const medications = patient.medications;

    return res.status(201).json(medications);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching medications",
    });
  }
};

exports.getShopPatientOrders = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const patientId = req.params.patientId;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);

    const patientIndex = shop.patients.indexOf(patientId);

    if (!patientIndex === -1 || !patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const orders = await Order.find({
      "product.shop._id": shopId,
      "patient._id": patientId,
    });

    return res.status(201).json(orders);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting patient prescription",
    });
  }
};

exports.createShopPatientMedicalHistory = async (req, res, next) => {
  try {
    const { shopId, patientId } = req.params;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const { staffId, appointmentId } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const newMedicalHistory = new MedicalHistory({
      ...req.body,
      patient,
      shop: shopId,
      reviewer: staffId,
    });

    await newMedicalHistory.save();

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        appointment.medicalHistory = newMedicalHistory._id;
      }
      appointment.save();
    }

    return res.status(201).json(newMedicalHistory);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js:899 ~ exports.createMedicalHistory= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error creating medical history",
    });
  }
};

exports.updateShopPatientMedicalHistory = async (req, res, next) => {
  try {
    const { shopId, patientId, medicalHistoryId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const medicalHistory = await MedicalHistory.findById(medicalHistoryId);

    if (!medicalHistory) {
      return res.status(404).json({
        code: 404,
        message: "Medical history not found",
      });
    }

    const { encounter } = req.body;

    medicalHistory.encounter = { ...encounter };

    await medicalHistory.save();

    return res.status(200).json(medicalHistory);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js:962 ~ exports.updateMedicalHistory= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error updating medical history",
    });
  }
};

exports.getShopPatientMedicalHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { shopId, patientId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const medicalHistory = await MedicalHistory.find({
      patient: patientId,
      shop: shopId,
    })
      .populate(["patient", "shop", "reviewer"])
      .skip(offset)
      .limit(limit);

    const medicalHistoryCount = await MedicalHistory.find({
      patient: patientId,
      shop: shopId,
    }).countDocuments();

    const totalPages = limit !== 0 ? Math.ceil(medicalHistoryCount / limit) : 1;

    res.status(200).json({
      data: medicalHistory,
      paging: {
        total: medicalHistoryCount,
        page: page,
        pages: totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error fetching medical history",
    });
  }
};

exports.deleteShopPatientMedicalHistory = async (req, res, next) => {
  try {
    const { shopId, patientId, medicalHistoryId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const medicalHistory = await MedicalHistory.findById(medicalHistoryId);
    if (!medicalHistory) {
      return res.status(400).json({
        code: 400,
        message: "Medical history not found",
      });
    }

    await medicalHistory.deleteOne();
    res.status(200).json({
      code: 200,
      message: "Medical history deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error deleting medical history",
    });
  }
};



exports.createShopPatientMedicalNotes = async (req, res, next) => {
  try {
    const { shopId, patientId } = req.params;
    const {
      staffId,
      medicationEffective,
      otherExplanations,
      followUp,
      recommendationToClinician,
      recommendationToPatient,
      complaint,
      treatmentPlan,
      products,
      addToCart,
    } = req.body;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const newMedicalNotes = new MedicalNotes({
      patient: patientId,
      shop: shopId,
      staff: staffId,
      encounter: {
        medicationEffective,
        otherExplanations,
        followUp,
        recommendationToClinician,
        recommendationToPatient,
      },
      prescription: {
        complaint,
        treatmentPlan,
        products,
        addToCart,
      },
    });

    await newMedicalNotes.save();

    return res.status(201).json(newMedicalNotes);
  } catch (error) {
    console.error("Error creating medical notes:", error);
    res.status(500).json({
      code: 500,
      message: "Error creating medical notes",
    });
  }
};


exports.getShopPatientMedicalNotes = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const query = { shop: shopId };

    //TODO: fix search
    /* if (search) {
      const regexSearch = new RegExp(search, "i");

      query.$or = [
        { "user.firstName": { $regex: regexSearch } },
        { "user.lastName": { $regex: regexSearch } },
        { "user.email": { $regex: regexSearch } },
        { "user.phoneNumber": { $regex: regexSearch } },
        { "reviewer.firstName": { $regex: regexSearch } },
        { "reviewer.lastName": { $regex: regexSearch } },
        { "reviewer.email": { $regex: regexSearch } },
        { "reviewer.phoneNumber": { $regex: regexSearch } },
        { "shop.name": { $regex: regexSearch } },
      ];
    } */

    let medicationEncounterQuery = MedicationEncounter.find(query).populate([
      "user",
      "shop",
      "reviewer",
    ]);

    // Check if limit is specified
    if (limit) {
      medicationEncounterQuery = medicationEncounterQuery
        .skip(offset)
        .limit(limit);
    }

    const medicationEncounters = await medicationEncounterQuery.exec();

    const totalMedicationEncounters = await MedicationEncounter.countDocuments(
      query
    );

    const pages = limit
      ? Math.ceil(
        totalMedicationEncounters / (limit || totalMedicationEncounters)
      )
      : 1;

    return res.status(200).json({
      data: medicationEncounters,
      paging: {
        total: totalMedicationEncounters,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js:1206 ~ exports.getShopPatientMedicationEncounters= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching patient medication encounters",
    });
  }
};
