const mongoose = require("mongoose");
require('dotenv').config();
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const Shop = require("../models/shop");
const Staff = require("../models/staff");
const userSockets = require("../userSockets");
const emailService = require("../utils/emailService");
const smsService = require("../utils/smsService")
const axios = require('axios');


// function to send push notification to customer

async function sendNotificationToCustomer(recipients, message, heading) {
  const notification = {
    app_id: process.env.ONESIGNAL_APP_ID_POS,
    contents: { en: message },
    headings: { en: heading },
    //included_segments: ['Total Subscriptions'],
    target_channel: "push",
    include_external_user_ids: [recipients],
  };

  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${apiKey}`
  };


  // send notification using the OneSignal client
  try {
    // const response = await client.createNotification(notification);
    const response = await axios.post('https://onesignal.com/api/v1/notifications', notification, { headers });
    //console.log('Notification sent customer:', response);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error sending notification customer:', error.response.data);
      return error.response.data;
    } else if (error.request) {
      console.error('No response received customer:', error.request);
      return { error: 'No response received' };
    } else {
      console.error('Error:', error.message);
      return { error: error.message };
    }


  }

}


// function to send push notification to pharmacy

async function sendNotificationToPOS(recipients, message, heading) {
  const notification = {
    app_id: process.env.ONESIGNAL_APP_ID_POS,
    //`include_player_ids: [recipients],
    contents: { en: message },
    headings: { en: heading },
    // included_segments: ['Total Subscriptions'],
    target_channel: "push",
    include_external_user_ids: [recipients],
    //included_aliases: { external_id: recipients }
  };

  const apiKey = process.env.ONESIGNAL_REST_API_KEY_POS;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${apiKey}`
  };


  // send notification using the OneSignal client
  try {
    // const response = await client.createNotification(notification);
    const response = await axios.post('https://onesignal.com/api/v1/notifications', notification, { headers });
    //console.log('Notification sent pos:', response);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error sending notification pos:', error.response.data);
      return error.response.data;
    } else if (error.request) {
      console.error('No response received pos:', error.request);
      return { error: 'No response received' };
    } else {
      console.error('Error:', error.message);
      return { error: error.message };
    }


  }

}

// event listener for quoted order to customer
function onOrderQuoted(recipients) {
  // send push notification to the customer
  const message = "Your order has been quoted.";
  const heading = "Order status";
  sendNotificationToCustomer(recipients, message, heading);
}

// event listener for cancelled order customer
function onOrderCancel(recipients) {
  // send push notification to the customer
  const message = "Your order has been cancelled.";
  const heading = "Order status";
  sendNotificationToCustomer(recipients, message, heading);
}

// event listener for cancelled order pos
function onOrderCancelPos(recipients) {
  // send push notification to the pos
  const message = "An order has been cancelled.";
  const heading = "Order status";
  sendNotificationToPOS(recipients, message, heading);
}

// event listener for created order
function onOrderCreated(recipients) {
  // send push notification to the pos
  const message = "An order has been created.";
  const heading = "Order status";
  sendNotificationToPOS(recipients, message, heading);

}

// event listener for received order
function onOrderReceived(recipients) {
  const message = "An order has been received.";
  const heading = "Order status";
  sendNotificationToPOS(recipients, message, heading);
}

// event listener for confirmed order
function onOrderConfirmed(recipients) {
  const message = "An order has been confirmed.";
  const heading = "Order status";
  sendNotificationToPOS(recipients, message, heading);
}

exports.create = async (req, res, next) => {
  try {
    // console.log("Request Body:", req.body); 
    const { products, patientId, address, paymentMethod, generalComment } = req.body;

    if (
      !products ||
      !patientId ||
      !address.county ||
      !address.street ||
      !paymentMethod
    ) {
      // console.log("Missing required fields"); 
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (products.length < 1) {
      // console.log("Product required"); 
      return res.status(400).json({
        code: 400,
        message: "Product required",
      });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      console.log(`Patient not found for ID: ${patientId}`);
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const transactionId = mongoose.Types.ObjectId();

    for (const product of products) {
      const databaseProduct = await Product.findById(product.id);
      if (!databaseProduct) {
        // console.log("Product not found"); 
        return res.status(400).json({
          code: 400,
          message: "Product not found",
        });
      }

      if (databaseProduct.prescribed && !product.prescription) {
        // console.log(`${product.customBrandName || databaseProduct.productName} requires a prescription`); 
        return res.status(400).json({
          code: 400,
          message: `${product.customBrandName || databaseProduct.productName} requires a prescription`,
        });
      }

      const drug = {
        _id: databaseProduct._id,
        productName: databaseProduct.productName,
        genericName: databaseProduct.genericName,
        formulation: databaseProduct.formulation,
        category: databaseProduct.category,
        unit: databaseProduct.unit,
        strength: databaseProduct.strength,
        packSize: databaseProduct.packSize,
        sellingPrice: databaseProduct.sellingPrice,
        costPrice: databaseProduct.costPrice,
        discount: databaseProduct.discount,
        shop: databaseProduct.shop,
        quantity: product.quantity,
        comment: product.comment || '',
        prescription: product.prescription,
        customBrandName: databaseProduct.customBrandName,
      };

      const totalPrice =
        databaseProduct.sellingPrice *
        product.quantity *
        (databaseProduct.discount?.value
          ? (100 - databaseProduct.discount.value) / 100
          : 1);

      const order = new Order({
        product: drug,
        transactionId,
        totalPrice,
        patient: patientId,
        paymentMethod,
        address,
        generalComment,
      });

      order.product.reqQuantity = products[0].quantity;

      await order.save();

      const baseUrl = process.env.POS_CLIENT_URL;

      if (!order.product.shop) {
        // console.log(`Shop ID is missing in drug object: ${order.product.shop}`);
        return res.status(400).json({
          code: 400,
          message: "Shop ID is missing in drug object",
        });
      }

      const shop = await Shop.findById(order.product.shop).populate("staff");
      if (!shop) {
        // console.log(`Shop not found for ID: ${order.product.shop}`); 
        return res.status(400).json({
          code: 400,
          message: `Shop not found for ID: ${order.product.shop}`,
        });
      }

      // console.log("Fetched Shop:", shop); // Log the shop details

      const smsMessage = `Order update: An order has been sent to ${shop.name || 'your pharmacy'}. View details at ${process.env.BASE_URL}`;
      await smsService.SMS.send({
        to: shop.contact.phoneNumber,
        message: smsMessage,
        from: 'Afyabook',
      });

      const adminEmail = process.env.ADMINEMAIL;
      const adminPhoneNumber = process.env.ADMINPHONENUMBER;

      if (shop.contact?.email) {
        const data = {
          from: '"Afyabook" <no-reply@afyabook.com>',
          to: shop.contact.email,
          subject: "New Order",
          html: `
          <h3>Hello ${shop.name || "Team"},</h3>
          <p>An order has been sent to your pharmacy</p>
          <strong><a href="${baseUrl}">View Order</a></strong>`,
        };

        await emailService.sendMail(data);
      }

      const smsAdminMessage = `Hello ${shop.name || "Team"},\n\n` +
        `An order has been sent to your pharmacy.\n` +
        `Please visit ${baseUrl} to view the order.\n\n` +
        `Thank you,\nAfyabook`;

      await smsService.SMS.send({
        to: adminPhoneNumber,
        message: smsAdminMessage,
        from: 'Afyabook',
      });

      const dataAdmin = {
        from: '"Afyabook" <no-reply@afyabook.com>',
        to: adminEmail,
        subject: "New Order",
        html: `
        <h3>Hello ${shop.name || "Team"},</h3>
        <p>An order has been sent to your pharmacy</p>
        <strong><a href="${baseUrl}">View Order</a></strong>`,
      };

      await emailService.sendMail(dataAdmin);

      shop.staff?.forEach(async (person) => {
        const personId = person.member.toString();
        onOrderCreated(personId);

        const targetSocket = userSockets.get(personId);
        if (targetSocket) {
          targetSocket.emit("orderCreated");
        }
      });
    }

    return res.status(201).json({ code: 200, message: "Order created successfully." });
  } catch (error) {
    // console.log("🚀 ~ file: order.js:312 ~ exports.create= ~ error:", error);
    res.status(500).json({
      code: 500,
      message: "Error creating order",
    });
  }
};




exports.getById = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId).populate([
      "patient",
      "staff",
      "product.shop",
    ]);
    if (!order) {
      return res.status(400).json({
        code: 400,
        message: "Order not found",
      });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error fetching order",
    });
  }
};

exports.delete = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    await Order.deleteOne({ _id: orderId });
    res.status(200).json({ code: 200, message: "Order deleted successfully." });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error deleting order",
    });
  }
};

exports.processOrder = async (req, res, next) => {

  try {
    const {
      shopId,
      products,
      patientId,
      staffId,
      discount,
      bill,
      orderId,
      prescriptionId,
      diagnosis,
      complaint,
      treatmentPlan,
    } = req.body;

    if (!shopId || !products || !patientId || !staffId) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
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

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
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
    const order = await Order.findById(orderId).populate([
      "patient",
      "staff",
      "product.shop",
    ]);

    if (!order) {
      return res.status(400).json({
        code: 400,
        message: "Order not found",
      });
    }



    //order.processed = !order.processed;
    order.updateOrderStatus("review");
    order.quoteTime = new Date()
    order.quote(
      bill,
      bill?.totalCost,
      discount?.type,
      discount?.value,
      diagnosis,
      staff,
      products
    );

    order.save();

    onOrderQuoted(patientId)

    const smsPatientMessage = `Hello ${order.patient.firstName || ""},\n\n` +
      `Your order for ${order.product.productName} has been quoted.\n` +
      `Please visit https://www.afyabook.com/Orders to confirm your order.\n\n` +
      `Thank you,\nAfyabook;`
    await smsService.SMS.send({
      to: order.patient.phoneNumber,
      message: smsPatientMessage,
      from: 'Afyabook',
    });


    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: order.patient.email,
      subject: "Review Order",
      html: `
        <h3>Hello ${order.patient.firstName || ""},</h3>
        <p>Your order for ${order.product.productName} has been quoted</p>
        <strong><a href="https://www.afyabook.com/Orders">Confirm Order</a></strong>`,
    };

    await emailService.sendMail(mail);

    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error updating order",
    });
  }
};

exports.processOrderCancel = async (req, res, next) => {
  const orderId = req.params.orderId;
  //console.log("req.params.orderId", orderId)

  try {

    const { staffId } = req.body;
    const order = await Order.findById(orderId).populate([
      "patient",
      "staff",
      "product.shop",
    ]);

    if (!order) {
      return res.status(400).json({
        code: 400,
        message: "Order not found",
      });
    }

    order.updateOrderStatus("cancelled");
    order.processed = true;
    order.staff = staffId;
    order.cancellationTime = new Date()

    //console.log("order", order)

    order.save();

    const shop = await Shop.findById(order.product.shop._id).populate("staff");

    shop.staff.forEach(async (person) => {
      const personId = person.member.toString();
      onOrderCancelPos(personId)
      const targetSocket = userSockets.get(personId);

      if (targetSocket) {
        targetSocket.emit("orderCancelled", order.product.productName);
      }
    });

    const smsPatientCancel = `Hello ${order.patient.firstName || "Customer"},\n\n` +
      `Your order for ${order.product.productName} has been cancelled.\n` +
      `To reorder, please visit: https://www.afyabook.com/pharmacy\n\n` +
      `Thank you,\nAfyabook`;
    await smsService.SMS.send({
      to: order.patient.phoneNumber,
      message: smsPatientCancel,
      from: 'Afyabook',
    });


    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: order.patient.email,
      subject: "Order Cancelled",
      html: `
        <h3>Hello ${order.patient.firstName || ""},</h3>
        <p>Your order for ${order.product.productName} has been cancelled</p>
        <strong><a href="https://www.afyabook.com/pharmacy">Re-Order.</a></strong>`,
    };

    await emailService.sendMail(mail);

    onOrderCancel(order.patient._id.toString())

    const targetSocket = userSockets.get(order.patient._id.toString());

    if (targetSocket) {
      targetSocket.emit("orderCancel", order.product.productName);
    }


    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error cancelling order",
    });
  }
};

exports.processOrderReceived = async (req, res, next) => {
  const orderId = req.params.orderId;
  //console.log("req.params.orderId", orderId)

  try {
    const order = await Order.findById(orderId).populate([
      "patient",
      "staff",
      "product.shop",
    ]);

    if (!order) {
      return res.status(400).json({
        code: 400,
        message: "Order not found",
      });
    }

    //order.processed = !order.processed;
    order.updateOrderStatus("received");
    order.receiveTime = new Date()

    order.save();

    const smsPatientReceive = `Hello ${order.patient.firstName || "Customer"},\n\n` +
      `Your order for ${order.product.productName} has been delivered and received by you.\n` +
      `Check out our offers at: https://www.afyabook.com/pharmacy\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: order.patient.phoneNumber,
      message: smsPatientReceive,
      from: 'Afyabook',
    });

    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: order.patient.email,
      subject: "Order Received",
      html: `
        <h3>Hello ${order.patient.firstName || ""},</h3>
        <p>Your order for ${order.product.productName} has been delivered; received by ${order.patient.firstName || ""
        }</p>
        <strong><a href="https://www.afyabook.com/pharmacy">See Offers</a></strong>`,
    };

    await emailService.sendMail(mail);

    const shop = await Shop.findById(order.product.shop._id).populate("staff");

    shop.staff.forEach(async (person) => {
      const personId = person.member.toString();
      onOrderReceived(personId)
      const targetSocket = userSockets.get(personId);

      if (targetSocket) {
        targetSocket.emit("orderReceived", order.product.productName);
      }
    });

    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error updating order",
    });
  }
};

exports.processOrderConfirm = async (req, res, next) => {
  const orderId = req.params.orderId;
  //console.log("req.params.orderId", orderId)

  try {
    const order = await Order.findById(orderId).populate([
      "patient",
      "staff",
      "product.shop",
    ]);

    if (!order) {
      return res.status(400).json({
        code: 400,
        message: "Order not found",
      });
    }

    const shopId = order.product.shop._id;

    const baseUrl = process.env.POS_CLIENT_URL;

    const shop = await Shop.findById(shopId);

    //order.processed = !order.processed;
    order.updateOrderStatus("confirmed");
    order.confirmTime = new Date()

    order.save();

    const smsOrderConfirmed = `Hello ${shop.name || "team"},\n\n` +
      `An order has been confirmed for purchase by ${order.patient.firstName || "the customer"}.\n` +
      `View the order details at: ${baseUrl}\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: shop.contact.phoneNumber,
      message: smsOrderConfirmed,
      from: 'Afyabook',
    });


    if (shop?.contact?.email) {
      const data = {
        from: '"Afyabook" <no-reply@afyabook.com>',
        to: shop.contact.email,
        subject: "Order confirmed",
        html: `
          <h3>Hello ${shop.name || ""} team,</h3>
          <p>An order has been confirmed for purchase by ${order.patient.firstName || ""
          }</p>
          <strong><a href="${baseUrl}">View Order</a></strong>`,
      };

      await emailService.sendMail(data);
    }

    shop.staff.forEach(async (person) => {
      const personId = person.member.toString();
      onOrderConfirmed(personId)
      const targetSocket = userSockets.get(personId);

      if (targetSocket) {
        targetSocket.emit("orderConfirmed", order.product.productName);
      }
    });

    const smsOrderConfirmed2 = `Hello ${order.patient.firstName || "Customer"},\n\n` +
      `Your order for ${order.product.productName} has been confirmed.\n` +
      `You can check the order status at: https://www.afyabook.com/Orders\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: order.patient.phoneNumber,  
      message: smsOrderConfirmed2,
      from: 'Afyabook',
    });



    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: order.patient.email,
      subject: "Order Confirmed",
      html: `
        <h3>Hello ${order.patient.firstName || ""},</h3>
        <p>Your order for ${order.product.productName} has been confirmed by ${order.patient.firstName || ""
        }</p>
        <strong><a href="https://www.afyabook.com/Orders">Check Order Status</a></strong>`,
    };

    await emailService.sendMail(mail);

    const targetSocket = userSockets.get(order.patient._id.toString());

    if (targetSocket) {
      targetSocket.emit("orderConfirmed", order.product.productName);
    }

    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error updating order",
    });
  }
};
