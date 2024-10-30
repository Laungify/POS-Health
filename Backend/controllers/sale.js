const Product = require("../models/product");
const Sale = require("../models/sale");
const Shop = require("../models/shop");
const Order = require("../models/order");
const User = require("../models/user");
const Prescription = require("../models/prescription");
const Staff = require("../models/staff");
const userSockets = require("../userSockets");
const { ObjectId } = require('mongodb');


exports.create = async (req, res, next) => {
  try {
    const {
      shopId,
      products,
      patientId,
      saleType,
      staffId,
      discount,
      bill,
      patientName,
      source,
      orderId,
      prescriptionId,
      diagnosis,
      complaint,
      treatmentPlan,
    } = req.body;

    if (!shopId || !products || !staffId || !source) {
      const missingFields = [];
      if (!shopId) missingFields.push('shopId');
      if (!products) missingFields.push('products');
      if (!staffId) missingFields.push('staffId');
      if (!source) missingFields.push('source');

      return res.status(400).json({
        code: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    if (discount && !discount?.type && discount?.value) {
      return res.status(400).json({
        code: 400,
        message: "Invalid discount",
      });
    }

    if (bill && !bill?.received && bill?.change) {
      return res.status(400).json({
        code: 400,
        message: "Invalid bill",
      });
    }

    if (products.length < 1) {
      return res.status(400).json({
        code: 400,
        message: "At least one product required for a sale",
      });
    }

    const shop = await Shop.findById(shopId).populate("staff");
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    let patient = {};
    if (patientId) {
      patient = await User.findById(patientId);
    } else {
      if (!patient) {
        return res.status(400).json({
          code: 400,
          message: "Patient not found",
        });
      }
    }

    if (!patientId) {
      patient = { _id: new ObjectId() };
    }

    /* const patientShop = shop.patients.id(patientId); */

    // const patient = shop.patients.id(patientId);
    // if (!patient) {
    //   return res.status(400).json({
    //     code: 400,
    //     message: "Patient not found",
    //   });
    // }

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

    let salesPrice = 0;
    products.map((sale) => {
      salesPrice += sale.sellingPrice * sale.quantity;
    });

    let totalCostPrice = 0;
    products.map((sale) => {
      totalCostPrice += sale.costPrice * sale.quantity;
    });

    const sale = new Sale({
      products,
      shop: shopId,
      salesPrice,
      totalCostPrice,
      patient,
      saleType,
      discount,
      order: orderId,
      prescription: prescriptionId,
      bill,
      patientName,
      profit: bill ? (bill?.totalCost - totalCostPrice).toFixed(1) : 0,
      source,
      diagnosis,
      complaint,
      treatmentPlan,
      staff: staffId,
    });

    //console.log("sale", sale)

    for (let index = 0; index < sale.products.length; index++) {
      const element = sale.products[index];
      const saleProduct = await Product.findById(element._id);
      if (saleProduct.storeQuantity < element.quantity) {
        return res.status(400).json({
          code: 400,
          message: `You have ${saleProduct.storeQuantity} ${saleProduct.customBrandName} in stock`,
        });
      }
    }

    for (let index = 0; index < sale.products.length; index++) {
      const element = sale.products[index];
      const saleProduct = await Product.findById(element._id);
      saleProduct.storeQuantity = saleProduct.storeQuantity - element.quantity;
      await saleProduct.save();
    }

    if (orderId) {
      const order = await Order.findById(orderId).populate(["patient", "staff"]);

      if (order) {
        order.processed = true;
        order.updateOrderStatus("receive");
        order.endSaleTime = new Date()
        order.quote(
          bill,
          bill?.totalCost,
          discount?.type,
          discount?.value,
          diagnosis,
          staff._id,
          products
        );

        await order.save();
        //console.log("order", order)

        const targetSocket = userSockets.get(order.patient._id.toString());

        if (targetSocket) {
          targetSocket.emit("orderReceived");
        }
      }
    }

    if (prescriptionId) {
      const prescription = await Prescription.findById(prescriptionId).populate(
        "patient"
      );

      if (prescription) {
        prescription.processed = true;
        sale.prescription = prescriptionId;
        prescription.updateOrderStatus("receive");
        prescription.endSaleTime = new Date()
        prescription.quote(
          bill,
          bill?.totalCost,
          discount?.type,
          discount?.value,
          diagnosis,
          staff._id
        );
        prescription.getProducts(products);
        await prescription.save();

        const targetSocket = userSockets.get(
          prescription.patient._id.toString()
        );

        if (targetSocket) {
          targetSocket.emit("prescriptionReceived");
        }
      }
    }

    await sale.save();

    return res.status(201).json(sale);
  } catch (error) {
    console.log(
      "🚀 ~ file: sale.js ~ line 30 ~ exports.create= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error creating sale",
    });
  }
};


// exports.bulkSaleCreate = async (req, res, next) => {
//   try {
//     const sales = req.body;

//     if (!Array.isArray(sales) || sales.length === 0) {
//       return res.status(400).json({
//         message: "Invalid input: expected an array of sales"
//       });
//     }

//     // Insert sales in bulk
//     const createdSales = await Sale.insertMany(sales);

//     res.status(201).json({
//       message: "Bulk document creation successful",
//       data: createdSales
//     });
//   } catch (error) {
//     console.error("Error creating bulk sales:", error);
//     res.status(500).json({
//       message: "Error creating bulk sales",
//       error: error.message
//     });
//   }
// };

exports.bulkSaleCreate = async (req, res, next) => {
  console.log(req.body);

  Sale.insertMany(req.body, (err, docs) => {
    if (err) {
      res.status(400).json({
        message: "The Sales were not saved",
        errorMessage: err.message,
      });
    } else {
      res.status(200).json({
        message: "Bulk sale document creation successful",
        docs,
      });
    }
  });
};

exports.update = async (req, res, next) => {

  try {
    const saleId = req.params.saleId;

    const {
      products,
      patientId,
      discount,
      bill,
      diagnosis,
      staffId,
      prescriptionId,
      source,
      orderId,
      shopId,
    } = req.body;

    if (!shopId || !products || !staffId || !source) {
      const missingFields = [];
      if (!shopId) missingFields.push('shopId');
      if (!products) missingFields.push('products');
      if (!staffId) missingFields.push('staffId');
      if (!source) missingFields.push('source');

      return res.status(400).json({
        code: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    if (discount && !discount?.type && discount?.value) {
      return res.status(400).json({
        code: 400,
        message: "Invalid discount",
      });
    }

    if (bill && !bill?.received && bill?.change) {
      return res.status(400).json({
        code: 400,
        message: "Invalid bill",
      });
    }

    if (products.length < 1) {
      return res.status(400).json({
        code: 400,
        message: "At least one product required for a sale",
      });
    }

    const sale = await Sale.findById(saleId).populate([
      "shop",
      "patient",
      "order",
      "prescription",
      "staff"
    ]);
    if (!sale) {
      return res.status(400).json({
        code: 400,
        message: "Sale not found",
      });
    }

    //const shopId = sale.shop._id;

    const shop = await Shop.findById(shopId).populate("staff");
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    // const patient = shop.patients.id(patientId);
    // if (!patient) {
    //   return res.status(400).json({
    //     code: 400,
    //     message: "Patient not found",
    //   });
    // }

    let patient = {};
    if (patientId) {
      patient = await User.findById(patientId);
    } else {
      if (!patient) {
        return res.status(400).json({
          code: 400,
          message: "Patient not found",
        });
      }
    }

    if (!patientId) {
      patient = { _id: new ObjectId() };
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

    //TODO: reduce storeQuantity in product model
    // products.map(async (product) => {
    //   try {
    //     const saleProduct = await Product.findById(product._id);
    //     console.log("product362", product)
    //     console.log("saleProduct363", saleProduct)
    //     console.log("sales364", sale)

    //     const oldQuantity = product.quantity;
    //     console.log("sale366", sale.products.find((item) => item._id === saleProduct._id));
    //     const newQuantity = sale.products.find(
    //       (item) => item._id === product._id
    //     )[0].quantity;
    //     saleProduct.storeQuantity = saleProduct.storeQuantity - oldQuantity;
    //     saleProduct.storeQuantity = saleProduct.storeQuantity + newQuantity;
    //     await saleProduct.save();
    //   } catch (error) {
    //     console.log(error);
    //   }
    // });
    for (const product of products) {
      try {
        const saleProduct = await Product.findById(product._id); //get storeQuantity
        const newQuantity = product.quantity; //new Quantity
        const saleProductInSale = sale.products.find(item => item._id.toString() === product._id.toString());
        if (!saleProductInSale) {
          console.error(`Product ${product._id} not found in the sale.`);
          continue;
        }

        const oldQuantity = saleProductInSale.quantity;//old quantity

        saleProduct.storeQuantity += oldQuantity;
        saleProduct.storeQuantity -= newQuantity;
        await saleProduct.save();
      } catch (error) {
        console.log(error);
      }
    }

    let salesPrice = 0;
    products.map((sale) => {
      salesPrice += sale.sellingPrice * sale.quantity;
    });

    let totalCostPrice = 0;
    products.map((sale) => {
      totalCostPrice += sale.costPrice * sale.quantity;
    });

    sale.products = products;
    sale.salesPrice = salesPrice;
    sale.totalCostPrice = totalCostPrice;
    sale.patient = patientId;
    sale.discount = discount;
    sale.bill = bill;
    sale.diagnosis = diagnosis;
    sale.staff = staff;
    sale.source = source;
    sale.profit = bill ? (bill?.totalCost - totalCostPrice).toFixed(1) : 0,

      await sale.save();

    if (orderId) {
      const order = await Order.findById(orderId);

      if (order) {
        order.quote(
          bill,
          bill?.totalCost,
          discount?.type,
          discount?.value,
          diagnosis,
          staff,
          products
        );

        await order.save();
      }
    }

    if (prescriptionId) {
      const prescription = await Prescription.findById(prescriptionId);

      if (prescription) {
        prescription.quote(
          bill,
          bill?.totalCost,
          discount?.type,
          discount?.value,
          diagnosis,
          staff
        );
        prescription.getProducts(products);
        await prescription.save();
      }
    }

    res.status(200).json(sale);
  } catch (error) {
    console.log(
      "🚀 ~ file: sale.js ~ line 111 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating sale",
    });
  }
};

exports.bill = async (req, res, next) => {
  try {
    const saleId = req.params.saleId;

    const { received, change } = req.body;

    if (!received || !change) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (received == change) {
      return res.status(400).json({
        code: 400,
        message: "Invalid values",
      });
    }

    const sale = await Sale.findById(saleId).populate([
      "shop",
      "patient",
      "order",
      "prescription",
      "staff"
    ]);
    if (!sale) {
      return res.status(400).json({
        code: 400,
        message: "Sale not found",
      });
    }

    sale.bill = {
      received,
      change,
    };

    await sale.save();

    res.status(200).json(sale);
  } catch (error) {
    console.log(
      "🚀 ~ file: sale.js ~ line 111 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error billing",
    });
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const saleId = req.params.saleId;

    const {
      products,
      staffId,
      prescriptionId,
      orderId,
      shopId,
    } = req.body;

    if (!shopId || !products || !staffId) {
      const missingFields = [];
      if (!shopId) missingFields.push('shopId');
      if (!products) missingFields.push('products');
      if (!staffId) missingFields.push('staffId');


      return res.status(400).json({
        code: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    if (products.length < 1) {
      return res.status(400).json({
        code: 400,
        message: "At least one product required for a sale",
      });
    }

    const sale = await Sale.findById(saleId).populate([
      "shop",
      "patient",
      "order",
      "prescription",
      "staff"
    ]);
    if (!sale) {
      return res.status(400).json({
        code: 400,
        message: "Sale not found",
      });
    }

    for (const product of products) {
      try {
        const saleProduct = await Product.findById(product._id); //get storeQuantity
        const newQuantity = product.quantity; //new Quantity
        const saleProductInSale = sale.products.find(item => item._id.toString() === product._id.toString());
        if (!saleProductInSale) {
          console.error(`Product ${product._id} not found in the sale.`);
          continue;
        }

        const oldQuantity = saleProductInSale.quantity;//old quantity

        saleProduct.storeQuantity += oldQuantity;
        //saleProduct.storeQuantity -= newQuantity;
        await saleProduct.save();
      } catch (error) {
        console.log(error);
      }
    }

    sale.cancellationTime = new Date()

    await sale.save();

    res.status(200).json(sale);
  } catch (error) {
    console.log(
      "🚀 ~ file: sale.js ~ line 578 ~ exports.cancel= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error cancel",
    });
  }
};

exports.getById = async (req, res, next) => {
  const saleId = req.params.saleId;

  try {
    const sale = await Sale.findById(saleId).populate([
      "shop",
      "patient",
      "order",
      "prescription",
      "staff"
    ]);
    if (!sale) {
      return res.status(400).json({
        code: 400,
        message: "Sale not found",
      });
    }
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error fetching sale",
    });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const saleId = req.params.saleId;

    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(400).json({
        code: 400,
        message: "Sale not found",
      });
    }

    //TODO: reset quantity in product model

    /* sale.products.foreach(async (product) => {
      const saleProduct = Product.findById(product._id);
      saleProduct.storeQuantity = saleProduct.storeQuantity + product.quantity;
      await saleProduct.save();
    }); */

    await Sale.deleteOne({ _id: saleId });
    res.status(200).json({ code: 200, message: "Sale deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error deleting sale",
    });
  }
};
